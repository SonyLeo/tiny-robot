<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" />
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const chatConfig = {
  request: {
    providers: {
      deepseek: {
        type: 'openai-compatible' as const,
        // 默认使用代理端点。如需直连 DeepSeek，替换为：
        //   baseURL: 'https://api.deepseek.com/v1',
        //   apiPath: '/chat/completions',
        //   headers: { Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || ''}` },
        endpoint: '/api/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
      },
    },
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', providerId: 'deepseek' },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', providerId: 'deepseek' },
    ],
    defaultModelId: 'deepseek-v4-flash',
  },
  ui: {
    brand: { title: 'TinyRobot Chat' },
    welcome: {
      title: '欢迎使用 TinyRobot Chat',
      description: '最小接入：一个 config 对象 + <TrChat /> 即可跑起完整聊天页。',
      prompts: [
        { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
        { label: '升级路径', description: '什么时候该用 Root + Page 或 Root + primitives？' },
      ],
    },
  },
  sender: {
    placeholder: '请输入问题...',
    mode: 'multiple' as const,
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
