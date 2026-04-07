import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import {
  CallToolResultSchema,
  type CallToolResult,
  type Tool as McpRemoteTool,
} from '@modelcontextprotocol/sdk/types.js'
import type { ToolCall } from '@opentiny/tiny-robot-kit'
import type { UseMcpManagerBridge } from '@opentiny/tiny-robot-chat'

const LEARN_MCP_ENDPOINT = import.meta.env.VITE_MICROSOFT_LEARN_MCP_ENDPOINT || '/api/mcp/learn'
const LEARN_MCP_PLUGIN_ID = 'microsoft-learn'

function resolveEndpointUrl(): URL {
  return new URL(LEARN_MCP_ENDPOINT, window.location.origin)
}

async function createLearnClient(): Promise<Client> {
  const client = new Client({
    name: 'tiny-robot-chat-demo',
    version: '0.1.0',
  })

  await client.connect(new StreamableHTTPClientTransport(resolveEndpointUrl()))
  return client
}

function parseToolArguments(toolCall: ToolCall): Record<string, unknown> {
  try {
    return JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

function formatContentBlock(block: NonNullable<CallToolResult['content']>[number]): string {
  if (block.type === 'text') {
    return block.text
  }

  if (block.type === 'resource' && 'text' in block.resource && typeof block.resource.text === 'string') {
    return block.resource.text
  }

  return JSON.stringify(block)
}

function formatToolResult(result: CallToolResult): string {
  const content = result.content.map(formatContentBlock).filter(Boolean).join('\n\n')

  if (content) {
    return result.isError ? `Tool returned an error:\n${content}` : content
  }

  return result.structuredContent
    ? JSON.stringify(result.structuredContent)
    : result.isError
      ? 'Tool returned an unknown error.'
      : 'Tool completed with no textual output.'
}

async function listAllTools(client: Client): Promise<McpRemoteTool[]> {
  const tools: McpRemoteTool[] = []
  let cursor: string | undefined

  do {
    const result = await client.listTools(cursor ? { cursor } : undefined)
    tools.push(...result.tools)
    cursor = result.nextCursor
  } while (cursor)

  return tools
}

export function createDemoMcpBridge(): UseMcpManagerBridge {
  let clientPromise: Promise<Client> | null = null
  const getClient = () => (clientPromise ??= createLearnClient())

  return {
    getTools: async ({ installedPlugins }) => {
      const localPlugin = installedPlugins.find((plugin) => plugin.id === LEARN_MCP_PLUGIN_ID)

      if (!localPlugin?.enabled) {
        return []
      }

      const enabledToolIds = new Set(localPlugin.tools.filter((tool) => tool.enabled).map((tool) => tool.id))
      const remoteTools = await listAllTools(await getClient())

      return remoteTools
        .filter((tool) => enabledToolIds.has(tool.name))
        .map((tool) => ({
          type: 'function',
          function: {
            name: `${LEARN_MCP_PLUGIN_ID}__${tool.name}`,
            description: tool.description || tool.title || tool.annotations?.title || tool.name,
            parameters: tool.inputSchema,
          },
        }))
    },
    callTool: async (toolCall, { tool }) => {
      const result = await (
        await getClient()
      ).request(
        {
          method: 'tools/call',
          params: {
            name: tool.id,
            arguments: parseToolArguments(toolCall),
          },
        },
        CallToolResultSchema,
      )

      return formatToolResult(result)
    },
  }
}
