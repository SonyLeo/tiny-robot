import type { PluginInfo } from '@opentiny/tiny-robot'

/** 模拟 MCP 插件列表 */
export const mockPlugins: PluginInfo[] = [
  {
    id: 'search-plugin',
    name: '搜索工具',
    description: '模拟 MCP 搜索服务',
    enabled: true,
    tools: [
      {
        id: 'web_search',
        name: '网页搜索',
        description: '搜索网页内容',
        enabled: true,
      },
    ],
  },
  {
    id: 'weather-plugin',
    name: '天气查询',
    description: '模拟天气查询服务',
    enabled: false,
    tools: [
      {
        id: 'get_weather',
        name: '获取天气',
        description: '查询指定城市天气',
        enabled: false,
      },
    ],
  },
]

/** 模拟 MCP bridge：getTools 返回工具列表，callTool 模拟搜索结果 */
export const mockBridge = {
  async getTools() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'search-plugin__web_search',
          description: '搜索网页内容',
          parameters: {
            type: 'object' as const,
            properties: { query: { type: 'string', description: '搜索关键词' } },
            required: ['query'],
          },
        },
      },
    ]
  },
  async callTool(toolCall: { function: { name?: string; arguments?: string } }) {
    const args = JSON.parse(toolCall.function?.arguments || '{}')
    await new Promise((r) => setTimeout(r, 500))
    return JSON.stringify({
      source: 'mock-mcp',
      query: args.query ?? '未知',
      results: [
        { title: `关于「${args.query}」的结果 1`, snippet: '这是模拟搜索返回的第一条结果。' },
        { title: `关于「${args.query}」的结果 2`, snippet: '这是模拟搜索返回的第二条结果。' },
      ],
    })
  },
}
