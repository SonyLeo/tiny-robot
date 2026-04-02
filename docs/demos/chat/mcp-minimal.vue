<template>
  <div class="chat-demo-shell">
    <div class="demo-tip">
      这个示例只展示 MCP 的最小前端接线： `mcpManager + toolPlugin + runtime.mcpManager`。 它不会额外模拟 `tool_calls`
      或假工具结果，真正的工具调用依赖你的模型或后端返回 `tool_calls`。
    </div>
    <div class="chat-demo-container">
      <TrChat
        :config="chatConfig"
        :runtime="runtime"
        :preset-overrides="{
          showHistory: false,
          showFeedback: false,
          placeholder: '这里的重点是 MCP 接入形状，不是模拟工具调用...',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import type { PluginInfo } from '@opentiny/tiny-robot'

const initialPlugins: PluginInfo[] = [
  {
    id: 'docs-knowledge',
    name: 'Docs Knowledge',
    icon: 'DK',
    description: 'A minimal docs search MCP plugin used to show the integration shape.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'search_docs',
        name: 'Search Docs',
        description: 'Search the TinyRobot chat docs by keyword.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]

const mcpManager = useMcpManager({ initialPlugins })

const chatConfig = {
  models: [{ id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'MCP 最小集成',
    },
    welcome: {
      title: '先把 MCP 接到 TrChat 上',
      description:
        '这里不模拟工具调用，只展示最小前端 wiring。真实项目里再把 mcpManager.bridge 接到你的后端或 MCP bridge。',
    },
    prompts: [{ label: '打开 MCP 面板', description: '先看看插件和工具有没有接进来。' }],
  },
}

const runtime = {
  mcpManager,
  plugins: [
    toolPlugin({
      getTools: mcpManager.getTools,
      callTool: mcpManager.callTool,
    }),
  ],
}
</script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.demo-tip {
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
