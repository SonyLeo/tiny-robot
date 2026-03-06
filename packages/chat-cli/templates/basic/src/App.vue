<script setup lang="ts">
import { TrChat, createOpenAIProvider, createDeepSeekProvider } from '@opentiny/tiny-robot-chat'

const apiKey = import.meta.env.VITE_API_KEY
const provider = import.meta.env.VITE_API_PROVIDER

let responseProvider

if (provider === 'openai') {
  responseProvider = createOpenAIProvider({
    apiKey,
    model: 'gpt-4-turbo',
  })
} else if (provider === 'deepseek') {
  responseProvider = createDeepSeekProvider({
    apiKey,
    model: 'deepseek-chat',
  })
} else {
  throw new Error(`Unknown API provider: ${provider}`)
}
</script>

<template>
  <div id="app">
    <TrChat
      :response-provider="responseProvider"
      :welcome="{
        title: 'Welcome to Tiny Robot Chat',
        description: 'Start a conversation with AI',
      }"
      show-history
      fullscreen
    />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}
</style>
