import type { PluginInfo } from '@opentiny/tiny-robot'

/**
 * 预配置的 MCP 服务器列表（演示数据）
 */
export const defaultMcpServers: PluginInfo[] = [
  {
    id: 'weather-service',
    name: 'Weather Service',
    icon: '🌤️',
    description: 'Get weather information for any location',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'get-weather',
        name: 'Get Weather',
        description: 'Get current weather for a location',
        enabled: true,
      },
      {
        id: 'get-forecast',
        name: 'Get Forecast',
        description: 'Get weather forecast for the next 7 days',
        enabled: false,
      },
    ],
    category: 'utilities',
  },
  {
    id: 'search-service',
    name: 'Search Service',
    icon: '🔍',
    description: 'Search the web for information',
    enabled: false,
    expanded: false,
    tools: [
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web',
        enabled: false,
      },
      {
        id: 'image-search',
        name: 'Image Search',
        description: 'Search for images',
        enabled: false,
      },
    ],
    category: 'search',
  },
  {
    id: 'database-service',
    name: 'Database Service',
    icon: '🗄️',
    description: 'Query and manage database',
    enabled: false,
    expanded: false,
    tools: [
      {
        id: 'query-db',
        name: 'Query Database',
        description: 'Execute database queries',
        enabled: false,
      },
      {
        id: 'insert-data',
        name: 'Insert Data',
        description: 'Insert data into database',
        enabled: false,
      },
    ],
    category: 'database',
  },
]
