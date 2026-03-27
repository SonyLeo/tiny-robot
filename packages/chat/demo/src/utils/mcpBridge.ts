import type { Tool, ToolCall } from '@opentiny/tiny-robot-kit'
import type { UseMcpManagerBridge } from '@opentiny/tiny-robot-chat'

const LEARN_MCP_ENDPOINT = import.meta.env.VITE_MICROSOFT_LEARN_MCP_ENDPOINT || '/api/mcp/learn'
const LEARN_MCP_PLUGIN_ID = 'microsoft-learn'
const DEFAULT_PROTOCOL_VERSION = '2025-06-18'

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: number
  method: string
  params?: Record<string, unknown>
}

interface JsonRpcErrorResponse {
  jsonrpc: '2.0'
  id: number | null
  error: {
    code: number
    message: string
    data?: unknown
  }
}

interface JsonRpcSuccessResponse<TResult> {
  jsonrpc: '2.0'
  id: number | null
  result: TResult
}

type JsonRpcResponse<TResult> = JsonRpcErrorResponse | JsonRpcSuccessResponse<TResult>

interface McpInitializeResult {
  protocolVersion: string
}

interface McpRemoteTool {
  name: string
  title?: string
  description?: string
  inputSchema?: Tool['function']['parameters']
  annotations?: {
    title?: string
  }
}

interface McpListToolsResult {
  tools: McpRemoteTool[]
  nextCursor?: string
}

interface McpContentBlock {
  type: string
  text?: string
  [key: string]: unknown
}

interface McpCallToolResult {
  content?: McpContentBlock[]
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

function parseToolArguments(toolCall: ToolCall) {
  try {
    return JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>
  } catch {
    return {
      raw: toolCall.function.arguments,
    }
  }
}

function createMcpProtocolError(prefix: string, detail: string): Error {
  return new Error(`[Learn MCP] ${prefix}: ${detail}`)
}

function normalizeInputSchema(schema: unknown): Tool['function']['parameters'] {
  if (!schema || typeof schema !== 'object') {
    return {
      type: 'object',
      properties: {},
      required: [],
    }
  }

  return schema
}

function formatContentBlock(block: McpContentBlock): string {
  if (typeof block.text === 'string' && block.text.trim()) {
    return block.text
  }

  return JSON.stringify(block, null, 2)
}

function formatToolResult(result: McpCallToolResult): string {
  const textContent = (result.content ?? []).map(formatContentBlock).filter(Boolean).join('\n\n')
  if (textContent) {
    return result.isError ? `Tool returned an error:\n${textContent}` : textContent
  }

  if (result.structuredContent) {
    return JSON.stringify(result.structuredContent, null, 2)
  }

  return result.isError ? 'Tool returned an unknown error.' : 'Tool completed with no textual output.'
}

function parseSsePayload<TResult>(raw: string, expectedId?: number): JsonRpcResponse<TResult> {
  const responses: JsonRpcResponse<TResult>[] = []
  const chunks = raw.split(/\r?\n\r?\n/g)

  for (const chunk of chunks) {
    const data = chunk
      .split(/\r?\n/g)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter(Boolean)
      .join('\n')

    if (!data) {
      continue
    }

    try {
      responses.push(JSON.parse(data) as JsonRpcResponse<TResult>)
    } catch {
      continue
    }
  }

  const matched = responses.find((response) => response.id === expectedId) ?? responses[responses.length - 1]
  if (!matched) {
    throw createMcpProtocolError('Invalid SSE response', 'No JSON-RPC payload was returned.')
  }

  return matched
}

async function parseJsonRpcResponse<TResult>(
  response: Response,
  expectedId?: number,
): Promise<JsonRpcSuccessResponse<TResult>> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  const bodyText = await response.text()

  if (!response.ok) {
    throw createMcpProtocolError(`HTTP ${response.status}`, bodyText || response.statusText)
  }

  if (!bodyText.trim()) {
    throw createMcpProtocolError('Empty response', 'The MCP server did not return a JSON-RPC payload.')
  }

  const payload = contentType.includes('text/event-stream')
    ? parseSsePayload<TResult>(bodyText, expectedId)
    : (JSON.parse(bodyText) as JsonRpcResponse<TResult>)

  if ('error' in payload) {
    throw createMcpProtocolError(`RPC ${payload.error.code}`, payload.error.message)
  }

  return payload
}

function createMicrosoftLearnClient() {
  let requestId = 0
  let sessionId: string | null = null
  let protocolVersion = DEFAULT_PROTOCOL_VERSION
  let initialized = false
  let initializePromise: Promise<void> | null = null

  function nextId() {
    requestId += 1
    return requestId
  }

  function createHeaders(includeSession = true): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    }

    if (includeSession && sessionId) {
      headers['Mcp-Session-Id'] = sessionId
      headers['MCP-Protocol-Version'] = protocolVersion
    }

    return headers
  }

  async function post(payload: JsonRpcRequest, includeSession = true) {
    const response = await fetch(LEARN_MCP_ENDPOINT, {
      method: 'POST',
      headers: createHeaders(includeSession),
      body: JSON.stringify(payload),
    })

    const nextSessionId = response.headers.get('Mcp-Session-Id') || response.headers.get('MCP-Session-Id')
    if (nextSessionId) {
      sessionId = nextSessionId
    }

    return response
  }

  async function notify(method: string, params?: Record<string, unknown>) {
    const response = await fetch(LEARN_MCP_ENDPOINT, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        ...(params ? { params } : {}),
      }),
    })

    if (!response.ok && response.status !== 202) {
      const bodyText = await response.text()
      throw createMcpProtocolError(`HTTP ${response.status}`, bodyText || response.statusText)
    }
  }

  async function initialize(force = false) {
    if (initialized && !force) {
      return
    }

    if (initializePromise && !force) {
      return initializePromise
    }

    initializePromise = (async () => {
      if (force) {
        initialized = false
        sessionId = null
        protocolVersion = DEFAULT_PROTOCOL_VERSION
      }

      const id = nextId()
      const response = await post(
        {
          jsonrpc: '2.0',
          id,
          method: 'initialize',
          params: {
            protocolVersion: DEFAULT_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: {
              name: 'tiny-robot-chat-demo',
              version: '0.1.0',
            },
          },
        },
        false,
      )

      const payload = await parseJsonRpcResponse<McpInitializeResult>(response, id)
      protocolVersion = payload.result.protocolVersion || DEFAULT_PROTOCOL_VERSION
      await notify('notifications/initialized')
      initialized = true
    })()

    try {
      await initializePromise
    } catch (error) {
      initialized = false
      sessionId = null
      throw error
    } finally {
      initializePromise = null
    }
  }

  async function sendRequest<TResult>(method: string, params?: Record<string, unknown>): Promise<TResult> {
    await initialize()

    const execute = async (): Promise<TResult> => {
      const id = nextId()
      const response = await post({
        jsonrpc: '2.0',
        id,
        method,
        ...(params ? { params } : {}),
      })

      const payload = await parseJsonRpcResponse<TResult>(response, id)
      return payload.result
    }

    try {
      return await execute()
    } catch (error) {
      if (error instanceof Error && /HTTP 404|HTTP 400/.test(error.message)) {
        await initialize(true)
        return execute()
      }

      throw error
    }
  }

  async function listTools(): Promise<McpRemoteTool[]> {
    const tools: McpRemoteTool[] = []
    let cursor: string | undefined

    do {
      const result = await sendRequest<McpListToolsResult>('tools/list', cursor ? { cursor } : undefined)
      tools.push(...result.tools)
      cursor = result.nextCursor
    } while (cursor)

    return tools
  }

  async function callTool(name: string, args: Record<string, unknown>): Promise<McpCallToolResult> {
    return sendRequest<McpCallToolResult>('tools/call', {
      name,
      arguments: args,
    })
  }

  return {
    listTools,
    callTool,
  }
}

export function createDemoMcpBridge(): UseMcpManagerBridge {
  const client = createMicrosoftLearnClient()

  return {
    getTools: async ({ installedPlugins }) => {
      const remoteTools = await client.listTools()
      const localPlugin = installedPlugins.find((plugin) => plugin.id === LEARN_MCP_PLUGIN_ID)

      if (!localPlugin?.enabled) {
        return []
      }

      const enabledToolIds = new Set(localPlugin.tools.filter((tool) => tool.enabled).map((tool) => tool.id))

      return remoteTools
        .filter((tool) => enabledToolIds.has(tool.name))
        .map((tool) => ({
          type: 'function',
          function: {
            name: `${LEARN_MCP_PLUGIN_ID}__${tool.name}`,
            description: tool.description || tool.title || tool.annotations?.title || tool.name,
            parameters: normalizeInputSchema(tool.inputSchema),
          },
        }))
    },
    callTool: async (toolCall, { tool }) => {
      const args = parseToolArguments(toolCall)
      const result = await client.callTool(tool.id, args)
      return formatToolResult(result)
    },
  }
}
