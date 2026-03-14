import type { ToolCall } from '@opentiny/tiny-robot-kit'
import type { UseMcpManagerBridge } from '@opentiny/tiny-robot-chat'

function parseToolArguments(toolCall: ToolCall) {
  try {
    return JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>
  } catch {
    return {
      raw: toolCall.function.arguments,
    }
  }
}

export function createDemoMcpBridge(): UseMcpManagerBridge {
  return {
    callTool: async (toolCall, { plugin, tool }) => {
      return {
        source: 'demo-mcp-bridge',
        plugin: plugin.name,
        tool: tool.name,
        arguments: parseToolArguments(toolCall),
        result: `Demo bridge result from ${plugin.name}/${tool.name}`,
      }
    },
  }
}
