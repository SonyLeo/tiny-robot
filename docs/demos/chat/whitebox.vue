<template>
  <div class="chat-demo-container">
    <TrChat.Root :chat-kit="chat" :mcp-manager="mcpManager">
      <div class="tr-chat" style="height: 100%">
        <TrChat.Header show-history title="手动组合页面" />

        <TrChat.Welcome
          v-if="messages.length === 0"
          title="手动组合页面结构"
          description="使用子组件和插槽自行组织页面内容，同时把模型选择器和 MCP 面板挂到自己的工具区里。"
          :prompts="prompts"
          @prompt-click="(desc: string) => chat.sendMessage(desc)"
        />

        <TrChat.MessageList v-else auto-scroll />

        <TrChat.Footer>
          <template #extra>
            <div style="font-size: 12px; color: #999; margin-bottom: 8px">
              这是通过 Footer 的 extra 插槽注入的自定义提示。
            </div>
          </template>
          <TrChat.Sender placeholder="手动组合输入...">
            <template #footer>
              <div class="whitebox-footer-tools">
                <TrModelSelector v-model="selectedModel" :models="adapter.models" />
                <TrMcpTrigger />
              </div>
            </template>
          </TrChat.Sender>
        </TrChat.Footer>

        <TrChat.History />
      </div>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  TrChat,
  TrMcpTrigger,
  TrModelSelector,
  createChatAdapterFromConfig,
  useChatKit,
  useMcpManager,
} from '@opentiny/tiny-robot-chat'
import type { PromptProps, PluginInfo } from '@opentiny/tiny-robot'

const prompts: PromptProps[] = [{ label: '自定义 UI', description: '我们可以调整哪些组件布局？' }]

const initialPlugins: PluginInfo[] = [
  {
    id: 'docs-knowledge',
    name: 'Docs Knowledge',
    icon: 'DK',
    description: 'Provide lightweight documentation lookup tools for the docs chat demos.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'search_docs',
        name: 'Search Docs',
        description: 'Search demo documentation content by keyword.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
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
}

const adapter = createChatAdapterFromConfig(chatConfig)
const mcpManager = useMcpManager({ initialPlugins })
const selectedModel = ref(adapter.defaultModel ?? adapter.models[0]?.value ?? 'gpt-4o-mini')

const chat = useChatKit({
  responseProvider: adapter.createResponseProvider(selectedModel.value),
})
const { messages } = chat

watch(selectedModel, (value) => {
  if (!value) {
    return
  }

  chat.updateResponseProvider(adapter.createResponseProvider(value))
})
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.whitebox-footer-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
