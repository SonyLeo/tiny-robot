export type AppMcpTransportType = 'sse' | 'streamableHttp'

export interface AppMcpServerConfig {
  name: string
  description: string
  type: AppMcpTransportType
  url: string
  icon: string
  headers?: Record<string, string>
  category?: string
}

export const MCP_SERVERS = {
  'model-context-protocol-mcp': {
    name: 'Model Context Protocol',
    description: 'MCP reference server for trying tool calls with near-zero setup.',
    type: 'streamableHttp',
    url: '/modelcontextprotocol-mcp',
    icon: 'https://modelcontextprotocol.io/favicon.ico',
    category: 'reference',
  },
} satisfies Record<string, AppMcpServerConfig>

export type AppMcpServerId = keyof typeof MCP_SERVERS

export const DEFAULT_INSTALLED_MCP_SERVER_IDS: AppMcpServerId[] = []

export const MARKET_MCP_SERVER_IDS: AppMcpServerId[] = ['model-context-protocol-mcp']
