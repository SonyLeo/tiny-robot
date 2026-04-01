<template>
  <div class="chat-demo-container">
    <TrChat
      :config="chatConfig"
      :runtime="{ chatKit, mcpManager }"
      :callbacks="{ onFinish, onError, onModelChange }"
      :preset-overrides="{
        showHistory: true,
        placeholder: '请输入问题...',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'TinyRobot Chat',
    },
    welcome: {
      title: '欢迎使用 Chat 套件',
      description: '只需几行代码即可拥有完整对话 UI，这个示例的数据完全来自本地 mock。',
    },
    prompts: [
      { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
      { label: '流式响应', description: '演示一下打字机效果' },
    ],
  },
})

const selectedModel = ref(chatConfig.defaults?.model ?? chatConfig.models[0]?.id ?? 'deepseek-chat')
const mcpManager = createDemoMcpManager()
const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('默认接入示例', {
    getModelId: () => selectedModel.value,
  }),
})

function onFinish(message: ChatMessage) {
  console.log('生成完成:', message)
}

function onError(error: Error) {
  console.error('发生错误:', error)
}

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
}
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}
</style>
