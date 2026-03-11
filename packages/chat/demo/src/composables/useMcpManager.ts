import { ref, computed } from 'vue'
import type { Tool, ToolCall } from '@opentiny/tiny-robot-kit'
import type { PluginInfo } from '@opentiny/tiny-robot'

/**
 * MCP 服务器和工具管理
 * 管理已安装的 MCP 服务器列表，派生出 toolPlugin 需要的 getTools 和 callTool 接口
 */
export function useMcpManager() {
  const installedPlugins = ref<PluginInfo[]>([])

  /**
   * 从 installedPlugins 派生出启用的工具列表（OpenAI Tool 格式）
   */
  const getTools = async (): Promise<Tool[]> => {
    const tools: Tool[] = []

    for (const plugin of installedPlugins.value) {
      if (!plugin.enabled) continue

      for (const tool of plugin.tools) {
        if (!tool.enabled) continue

        // 将 PluginTool 转换为 OpenAI Tool 格式
        tools.push({
          type: 'function',
          function: {
            name: `${plugin.id}__${tool.id}`,
            description: tool.description,
            parameters: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        })
      }
    }

    return tools
  }

  /**
   * 执行工具调用
   * 根据 tool name 找到对应的 plugin 和 tool，调用其 MCP 服务器
   */
  const callTool = async (toolCall: ToolCall): Promise<string> => {
    const toolName = toolCall.function.name
    const [pluginId, toolId] = toolName.split('__')

    const plugin = installedPlugins.value.find((p) => p.id === pluginId)
    if (!plugin) {
      return JSON.stringify({ error: `Plugin not found: ${pluginId}` })
    }

    const tool = plugin.tools.find((t) => t.id === toolId)
    if (!tool) {
      return JSON.stringify({ error: `Tool not found: ${toolId}` })
    }

    // TODO: 这里应该调用真实的 MCP 服务器
    // 目前返回模拟数据
    return JSON.stringify({
      source: 'mcp-server',
      plugin: plugin.name,
      tool: tool.name,
      result: `Mock result from ${plugin.name}/${tool.name}`,
    })
  }

  /**
   * 处理插件启用/禁用
   */
  function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
    const target = installedPlugins.value.find((p) => p.id === plugin.id)
    if (target) {
      target.enabled = enabled
      // 父级被禁用时，禁用所有子级工具
      if (!enabled) {
        target.tools.forEach((tool) => {
          tool.enabled = false
        })
      }
    }
  }

  /**
   * 处理工具启用/禁用
   */
  function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
    const target = installedPlugins.value.find((p) => p.id === plugin.id)
    if (target) {
      const tool = target.tools.find((t) => t.id === toolId)
      if (tool) {
        tool.enabled = enabled
      }
    }
  }

  /**
   * 处理插件创建
   */
  function handlePluginCreate(type: 'form' | 'code', data: Record<string, unknown>) {
    // TODO: 实现插件创建逻辑
    console.log('Plugin create:', type, data)
  }

  /**
   * 处理插件删除
   */
  function handlePluginDelete(plugin: PluginInfo) {
    const index = installedPlugins.value.findIndex((p) => p.id === plugin.id)
    if (index > -1) {
      installedPlugins.value.splice(index, 1)
    }
  }

  /**
   * 启用的插件数量
   */
  const activeCount = computed(() => {
    return installedPlugins.value.filter((p) => p.enabled).length
  })

  const result = {
    installedPlugins,
    getTools,
    callTool,
    handlePluginToggle,
    handleToolToggle,
    handlePluginCreate,
    handlePluginDelete,
    activeCount,
  }

  return result
}

export type UseMcpManagerReturn = ReturnType<typeof useMcpManager>
