<script setup lang="ts">
import { TrChat, createChatAdapterFromConfig, createPresetChatProps } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const apiKey = import.meta.env.VITE_API_KEY
const provider = import.meta.env.VITE_API_PROVIDER
const model = import.meta.env.VITE_MODEL || (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini')
const baseURL =
  import.meta.env.VITE_BASE_URL ||
  (provider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1')

// 启用 LocalStorage 持久化，配合 show-history 使用
const storage = localStorageStrategyFactory()

const welcome = {
  title: 'AI Assistant',
  description: '你好，我是你的 AI 助手，有什么可以帮你的？',
}

const prompts = [
  { label: '✍️ 写作', description: '帮我写一篇关于...' },
  { label: '💻 编程', description: '帮我写一个...' },
  { label: '📊 分析', description: '帮我分析...' },
  { label: '🌐 翻译', description: '帮我翻译...' },
]

const chatAdapter = createChatAdapterFromConfig({
  models: [{ id: model, provider, label: model }],
  providers: {
    [provider]: {
      type: 'openai-compatible',
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  },
  defaults: {
    model,
  },
  ui: {
    welcome,
    prompts,
  },
})

const chatPreset = createPresetChatProps(chatAdapter, {
  storage,
  showHistory: true,
})
</script>

<template>
  <TrChat v-bind="chatPreset" style="height: 100vh" />
</template>
