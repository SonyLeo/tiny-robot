import type { PluginInfo } from '@opentiny/tiny-robot'

/**
 * Preconfigured MCP server list used by the demo.
 */
export const defaultMcpServers: PluginInfo[] = [
  {
    id: 'microsoft-learn',
    name: 'Microsoft Learn',
    icon: 'MS',
    description: 'Search and fetch official Microsoft Learn documentation through the public remote MCP server.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'microsoft_docs_search',
        name: 'Docs Search',
        description: 'Search Microsoft Learn documentation.',
        enabled: true,
      },
      {
        id: 'microsoft_docs_fetch',
        name: 'Docs Fetch',
        description: 'Fetch a full Microsoft Learn article.',
        enabled: true,
      },
      {
        id: 'microsoft_code_sample_search',
        name: 'Code Sample Search',
        description: 'Search Microsoft Learn code samples.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]
