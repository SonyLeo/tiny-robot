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
                <TrModelSelector v-model="selectedModel" :models="chatConfig.models" />
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
import { TrChat, TrMcpTrigger, TrModelSelector, useChatKit } from '@opentiny/tiny-robot-chat'
import type { PromptProps } from '@opentiny/tiny-robot'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider } from './shared'

const prompts: PromptProps[] = [{ label: '自定义 UI', description: '我们可以调整哪些组件布局？' }]

const mcpManager = createDemoMcpManager()
const chatConfig = createDemoChatConfig()
const selectedModel = ref(chatConfig.defaults?.model ?? chatConfig.models[0]?.id ?? 'deepseek-chat')

const chat = useChatKit({
  responseProvider: createMockResponseProvider('手动组合页面示例', {
    getModelId: () => selectedModel.value,
  }),
})
const { messages } = chat

watch(selectedModel, (value) => {
  if (!value) {
    return
  }

  chat.updateResponseProvider(
    createMockResponseProvider('手动组合页面示例', {
      getModelId: () => value,
    }),
  )
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
