import type { PluginInfo } from '@opentiny/tiny-robot'

export const MOCK_PLUGINS: PluginInfo[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: '搜索互联网获取最新信息',
    enabled: true,
    tools: [
      {
        id: 'search',
        name: 'search',
        description: '搜索互联网',
        enabled: true,
      },
    ],
  },
  {
    id: 'code-runner',
    name: 'Code Runner',
    description: '执行代码片段',
    enabled: false,
    tools: [
      {
        id: 'run',
        name: 'run',
        description: '运行代码',
        enabled: false,
      },
    ],
  },
]
