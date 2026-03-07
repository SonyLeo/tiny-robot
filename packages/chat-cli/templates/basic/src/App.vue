<script setup lang="ts">
import { TrChat, createOpenAIProvider, createDeepSeekProvider } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const apiKey = import.meta.env.VITE_API_KEY
const provider = import.meta.env.VITE_API_PROVIDER

const responseProvider =
  provider === 'deepseek'
    ? createDeepSeekProvider({
        apiKey,
        model: import.meta.env.VITE_MODEL || 'deepseek-chat',
      })
    : createOpenAIProvider({
        apiKey,
        model: import.meta.env.VITE_MODEL || 'gpt-4o-mini',
        baseURL: import.meta.env.VITE_BASE_URL,
      })

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
</script>

<template>
  <TrChat
    :response-provider="responseProvider"
    :storage="storage"
    :welcome="welcome"
    :prompts="prompts"
    show-history
    style="height: 100vh"
  />
</template>
