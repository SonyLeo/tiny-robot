<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit }" />
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: '最小配置示例',
    },
    welcome: {
      title: '只用 config 就能起步',
      description: '模型、provider 和 defaults 是最核心的最小集合。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('最小配置示例'),
})
</script>

<style scoped>
.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
