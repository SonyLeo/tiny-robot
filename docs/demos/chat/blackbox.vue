<template>
  <div class="chat-demo-container">
    <TrChat
      :config="chatConfig"
      :runtime="{ chatKit }"
      :callbacks="{ onFinish, onError }"
      :preset-overrides="{
        showHistory: true,
        placeholder: '请输入问题...',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

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

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('默认接入示例'),
})

function onFinish(message: ChatMessage) {
  console.log('生成完成:', message)
}

function onError(error: Error) {
  console.error('发生错误:', error)
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
