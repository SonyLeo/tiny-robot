import type { PluginInfo } from '@opentiny/tiny-robot'
import type { ToolCall } from '@opentiny/tiny-robot-kit'
import type { UseMcpManagerBridge } from '@opentiny/tiny-robot-chat'

export const defaultMcpServers: PluginInfo[] = [
  {
    id: 'weather-service',
    name: 'Weather Service',
    icon: 'W',
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
    icon: 'S',
    description: 'Search your internal knowledge or the web',
    enabled: false,
    expanded: false,
    tools: [
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web',
        enabled: false,
      },
    ],
    category: 'search',
  },
]

function parseToolArguments(toolCall: ToolCall) {
  try {
    return JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>
  } catch {
    return {
      raw: toolCall.function.arguments,
    }
  }
}

export function createLocalMcpBridge(): UseMcpManagerBridge {
  return {
    callTool: async (toolCall, { plugin, tool }) => {
      return {
        source: 'local-agent-mcp-template',
        plugin: plugin.name,
        tool: tool.name,
        arguments: parseToolArguments(toolCall),
        result: `Mock result from ${plugin.name}/${tool.name}`,
      }
    },
  }
}
