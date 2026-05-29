import type { PluginInfo } from '@opentiny/tiny-robot'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types'
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_INSTALLED_MCP_SERVER_IDS,
  MARKET_MCP_SERVER_IDS,
  MCP_SERVERS,
  type AppMcpServerConfig,
  type AppMcpServerId,
} from '../config/mcp'

type McpTool = Awaited<ReturnType<Client['listTools']>>['tools'][number]
type McpToolCallResult = Awaited<ReturnType<Client['callTool']>>
type ToolArguments = CallToolRequest['params']['arguments']

export interface EnabledMcpTool {
  serverId: AppMcpServerId
  name: string
  fullName: string
  description: string
  inputSchema: Record<string, unknown>
}

interface StoredMcpState {
  addedServerIds: AppMcpServerId[]
  enabledServerIds: AppMcpServerId[]
  enabledToolIds: Partial<Record<AppMcpServerId, string[]>>
}

const MCP_STORAGE_KEY = 'tiny-robot-assistant-panel-mcp'

function isKnownServerId(value: string): value is AppMcpServerId {
  return value in MCP_SERVERS
}

function getServerConfig(serverId: AppMcpServerId): AppMcpServerConfig {
  return MCP_SERVERS[serverId]
}

function loadStoredState(): StoredMcpState {
  if (typeof window === 'undefined') {
    return {
      addedServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
      enabledServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
      enabledToolIds: {},
    }
  }

  try {
    const raw = window.localStorage.getItem(MCP_STORAGE_KEY)
    if (!raw) {
      return {
        addedServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
        enabledServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
        enabledToolIds: {},
      }
    }

    const parsed = JSON.parse(raw) as Partial<StoredMcpState>
    const addedServerIds = (parsed.addedServerIds || []).filter(isKnownServerId)
    const enabledServerIds = (parsed.enabledServerIds || []).filter(
      (serverId): serverId is AppMcpServerId => isKnownServerId(serverId) && addedServerIds.includes(serverId),
    )
    const enabledToolIds = Object.fromEntries(
      Object.entries(parsed.enabledToolIds || {}).filter(([serverId]) => isKnownServerId(serverId)),
    ) as StoredMcpState['enabledToolIds']

    return {
      addedServerIds: addedServerIds.length > 0 ? addedServerIds : [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
      enabledServerIds,
      enabledToolIds,
    }
  } catch {
    return {
      addedServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
      enabledServerIds: [...DEFAULT_INSTALLED_MCP_SERVER_IDS],
      enabledToolIds: {},
    }
  }
}

function createMcpClient(serverId: AppMcpServerId, server: AppMcpServerConfig) {
  const client = new Client({
    name: serverId,
    version: '0.1.0',
  })
  const requestInit = {
    headers: server.headers,
  }
  const url = new URL(server.url, window.location.origin)
  const transport =
    server.type === 'streamableHttp'
      ? new StreamableHTTPClientTransport(url, { requestInit })
      : new SSEClientTransport(url, { requestInit })

  return { client, transport }
}

function createToolId(tool: McpTool, fallbackIndex: number): string {
  return typeof tool.name === 'string' && tool.name.length > 0 ? tool.name : `tool-${fallbackIndex + 1}`
}

function createFullToolName(serverId: AppMcpServerId, toolName: string): string {
  return `${serverId}__${toolName}`
}

function normalizeToolDescription(tool: McpTool) {
  return typeof tool.description === 'string' ? tool.description : ''
}

function normalizeInputSchema(tool: McpTool): Record<string, unknown> {
  return (
    (tool.inputSchema as Record<string, unknown> | undefined) || {
      type: 'object',
      properties: {},
    }
  )
}

function formatToolResult(result: McpToolCallResult): string {
  const content = Array.isArray(result.content) ? result.content : []
  if (content.length === 0) {
    return ''
  }

  return content
    .map((item) => {
      if ('text' in item && typeof item.text === 'string') {
        return item.text
      }
      return JSON.stringify(item)
    })
    .join('\n')
}

async function listToolsFromServer(serverId: AppMcpServerId): Promise<McpTool[]> {
  const server = getServerConfig(serverId)
  const { client, transport } = createMcpClient(serverId, server)
  try {
    await client.connect(transport)
    const response = await client.listTools()
    return response.tools
  } finally {
    await client.close().catch(() => undefined)
  }
}

async function callToolFromServer(
  serverId: AppMcpServerId,
  toolName: string,
  args: ToolArguments = {},
): Promise<string> {
  const server = getServerConfig(serverId)
  const { client, transport } = createMcpClient(serverId, server)
  try {
    await client.connect(transport)
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    })

    if (result.isError) {
      throw new Error(formatToolResult(result) || `MCP tool "${toolName}" failed.`)
    }

    return formatToolResult(result)
  } finally {
    await client.close().catch(() => undefined)
  }
}

function createMcpStore() {
  const initialState = loadStoredState()
  const pickerVisible = ref(false)
  const addedServerIds = ref<AppMcpServerId[]>(initialState.addedServerIds)
  const enabledServerIds = ref<AppMcpServerId[]>(initialState.enabledServerIds)
  const enabledToolIds = ref<StoredMcpState['enabledToolIds']>(initialState.enabledToolIds)
  const loadedTools = ref<Partial<Record<AppMcpServerId, McpTool[]>>>({})
  const addingServerIds = ref<AppMcpServerId[]>([])
  const toolLoaders = new Map<AppMcpServerId, Promise<McpTool[]>>()

  const addedServerSet = computed(() => new Set(addedServerIds.value))
  const enabledServerSet = computed(() => new Set(enabledServerIds.value))

  watch(
    [addedServerIds, enabledServerIds, enabledToolIds],
    () => {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.setItem(
        MCP_STORAGE_KEY,
        JSON.stringify({
          addedServerIds: addedServerIds.value,
          enabledServerIds: enabledServerIds.value.filter((serverId) => addedServerSet.value.has(serverId)),
          enabledToolIds: enabledToolIds.value,
        } satisfies StoredMcpState),
      )
    },
    { deep: true },
  )

  function setEnabledToolIds(serverId: AppMcpServerId, toolIds: string[]) {
    enabledToolIds.value = {
      ...enabledToolIds.value,
      [serverId]: [...new Set(toolIds)],
    }
  }

  function syncEnabledToolIds(serverId: AppMcpServerId, tools: McpTool[]) {
    const toolIds = tools.map((tool, index) => createToolId(tool, index))
    const hasStoredSelection = Object.prototype.hasOwnProperty.call(enabledToolIds.value, serverId)
    const nextEnabledToolIds = hasStoredSelection
      ? (enabledToolIds.value[serverId] || []).filter((toolId) => toolIds.includes(toolId))
      : toolIds

    setEnabledToolIds(serverId, nextEnabledToolIds)
  }

  async function ensureServerTools(serverId: AppMcpServerId): Promise<McpTool[]> {
    const cachedTools = loadedTools.value[serverId]
    if (cachedTools) {
      return cachedTools
    }

    const loadingTask = toolLoaders.get(serverId)
    if (loadingTask) {
      return loadingTask
    }

    const nextLoader = listToolsFromServer(serverId)
      .then((tools) => {
        loadedTools.value = {
          ...loadedTools.value,
          [serverId]: tools,
        }
        syncEnabledToolIds(serverId, tools)
        return tools
      })
      .finally(() => {
        toolLoaders.delete(serverId)
      })

    toolLoaders.set(serverId, nextLoader)

    return nextLoader
  }

  function setServerEnabled(serverId: AppMcpServerId, enabled: boolean) {
    if (enabled) {
      if (!enabledServerSet.value.has(serverId)) {
        enabledServerIds.value = [...enabledServerIds.value, serverId]
      }
      return
    }

    enabledServerIds.value = enabledServerIds.value.filter((item) => item !== serverId)
  }

  async function addServer(serverId: AppMcpServerId) {
    if (!addedServerSet.value.has(serverId)) {
      addedServerIds.value = [...addedServerIds.value, serverId]
    }

    setServerEnabled(serverId, true)

    try {
      await ensureServerTools(serverId)
    } catch (error) {
      removeServer(serverId)
      throw error
    }
  }

  function removeServer(serverId: AppMcpServerId) {
    addedServerIds.value = addedServerIds.value.filter((item) => item !== serverId)
    enabledServerIds.value = enabledServerIds.value.filter((item) => item !== serverId)

    const nextLoadedTools = { ...loadedTools.value }
    delete nextLoadedTools[serverId]
    loadedTools.value = nextLoadedTools

    const nextEnabledToolIds = { ...enabledToolIds.value }
    delete nextEnabledToolIds[serverId]
    enabledToolIds.value = nextEnabledToolIds
  }

  function getToolEnabled(serverId: AppMcpServerId, toolId: string) {
    return (enabledToolIds.value[serverId] || []).includes(toolId)
  }

  function setToolEnabled(serverId: AppMcpServerId, toolId: string, enabled: boolean) {
    const nextEnabledToolIds = new Set(enabledToolIds.value[serverId] || [])
    if (enabled) {
      nextEnabledToolIds.add(toolId)
    } else {
      nextEnabledToolIds.delete(toolId)
    }
    setEnabledToolIds(serverId, [...nextEnabledToolIds])
  }

  const installedPlugins = computed<PluginInfo[]>(() =>
    addedServerIds.value.map((serverId) => {
      const server = getServerConfig(serverId)
      const tools = (loadedTools.value[serverId] || []).map((tool, index) => {
        const toolId = createToolId(tool, index)
        return {
          id: toolId,
          name: toolId,
          description: normalizeToolDescription(tool),
          enabled: enabledServerSet.value.has(serverId) && getToolEnabled(serverId, toolId),
        }
      })

      return {
        id: serverId,
        name: server.name,
        icon: server.icon,
        description: server.description,
        enabled: enabledServerSet.value.has(serverId),
        expanded: true,
        tools,
      }
    }),
  )

  const marketPlugins = computed<PluginInfo[]>(() =>
    MARKET_MCP_SERVER_IDS.map((serverId) => {
      const server = getServerConfig(serverId)
      return {
        id: serverId,
        name: server.name,
        icon: server.icon,
        description: server.description,
        enabled: false,
        category: server.category,
        tools: [],
        addState: addedServerSet.value.has(serverId)
          ? 'added'
          : addingServerIds.value.includes(serverId)
            ? 'loading'
            : 'idle',
      }
    }),
  )

  const activePluginCount = computed(() => enabledServerIds.value.length)
  const enabledToolCount = computed(() =>
    installedPlugins.value.reduce(
      (count, plugin) => count + (plugin.enabled ? plugin.tools.filter((tool) => tool.enabled).length : 0),
      0,
    ),
  )

  async function getEnabledTools(): Promise<EnabledMcpTool[]> {
    await Promise.all(enabledServerIds.value.map((serverId) => ensureServerTools(serverId)))

    return enabledServerIds.value.flatMap((serverId) => {
      const tools = loadedTools.value[serverId] || []
      return tools.flatMap((tool, index) => {
        const toolId = createToolId(tool, index)
        if (!getToolEnabled(serverId, toolId)) {
          return []
        }
        return [
          {
            serverId,
            name: toolId,
            fullName: createFullToolName(serverId, toolId),
            description: normalizeToolDescription(tool),
            inputSchema: normalizeInputSchema(tool),
          },
        ]
      })
    })
  }

  function parseFullToolName(fullToolName: string) {
    const [serverIdPart, ...toolNameParts] = fullToolName.split('__')
    if (!isKnownServerId(serverIdPart)) {
      throw new Error(`Unknown MCP tool name: ${fullToolName}`)
    }

    const toolName = toolNameParts.join('__')
    if (!toolName) {
      throw new Error(`Unknown MCP tool name: ${fullToolName}`)
    }

    return {
      serverId: serverIdPart,
      toolName,
    }
  }

  async function callTool(fullToolName: string, args: Record<string, unknown> = {}) {
    const { serverId, toolName } = parseFullToolName(fullToolName)

    if (!enabledServerSet.value.has(serverId)) {
      throw new Error(`MCP server "${serverId}" is disabled.`)
    }

    await ensureServerTools(serverId)

    if (!getToolEnabled(serverId, toolName)) {
      throw new Error(`MCP tool "${toolName}" is disabled.`)
    }

    return callToolFromServer(serverId, toolName, args)
  }

  async function handlePluginAdd(plugin: PluginInfo) {
    if (
      !isKnownServerId(plugin.id) ||
      addedServerSet.value.has(plugin.id) ||
      addingServerIds.value.includes(plugin.id)
    ) {
      return
    }

    addingServerIds.value = [...addingServerIds.value, plugin.id]
    try {
      await addServer(plugin.id)
    } catch (error) {
      console.error(`[MCP] Failed to add "${plugin.id}":`, error)
    } finally {
      addingServerIds.value = addingServerIds.value.filter((serverId) => serverId !== plugin.id)
    }
  }

  async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    if (enabled) {
      try {
        await ensureServerTools(plugin.id)
        setServerEnabled(plugin.id, true)
      } catch (error) {
        console.error(`[MCP] Failed to enable "${plugin.id}":`, error)
      }
      return
    }

    setServerEnabled(plugin.id, false)
  }

  function handlePluginDelete(plugin: PluginInfo) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    removeServer(plugin.id)
  }

  function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    setToolEnabled(plugin.id, toolId, enabled)

    if (enabled) {
      setServerEnabled(plugin.id, true)
    }
  }

  function closePicker() {
    pickerVisible.value = false
  }

  addedServerIds.value.forEach((serverId) => {
    void ensureServerTools(serverId).catch((error) => {
      console.error(`[MCP] Failed to preload "${serverId}":`, error)
    })
  })

  return {
    pickerVisible,
    installedPlugins,
    marketPlugins,
    activePluginCount,
    enabledToolCount,
    handlePluginAdd,
    handlePluginToggle,
    handlePluginDelete,
    handleToolToggle,
    getEnabledTools,
    callTool,
    closePicker,
  }
}

type McpStore = ReturnType<typeof createMcpStore>
let mcpStore: McpStore | null = null

export function useMcp() {
  if (!mcpStore) {
    mcpStore = createMcpStore()
  }

  return mcpStore
}
