<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" />
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const chatConfig = {
  request: {
    models: [
      { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4o-mini',
    transport: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  ui: {
    brand: {
      title: 'TinyRobot Chat',
    },
    welcome: {
      title: '欢迎使用 Chat 套件',
      description: '这个示例直接使用 target TrChatConfig 走官方黑盒入口。',
      prompts: [
        { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
        { label: '流式响应', description: '演示一下打字机效果。' },
      ],
    },
    contentLayout: 'centered' as const,
  },
  sender: {
    placeholder: '请输入问题...',
    mode: 'multiple' as const,
    maxLength: 200,
    wordCount: true,
  },
  history: {
    enabled: true,
    defaultOpen: false,
  },
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
