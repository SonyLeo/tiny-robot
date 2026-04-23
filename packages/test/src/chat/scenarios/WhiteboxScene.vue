<template>
  <div data-testid="chat-whitebox" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="status-indicator">status:{{ whiteboxResolution.runtime.conversation.status.value }}</span>
      <span data-testid="message-count"
        >messages:{{ whiteboxResolution.runtime.conversation.messages.value.length }}</span
      >
      <span data-testid="on-finish-log">{{ finishLog }}</span>
      <span data-testid="on-error-log">{{ errorLog }}</span>
    </div>

    <TrChat.Root :runtime="whiteboxResolution.runtime" :ui="whiteboxResolution.ui">
      <TrChat.Page />
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, createRuntimeFromConfig, type TrChatConfig } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const finishLog = ref('finish:pending')
const errorLog = ref('error:none')

const whiteboxConfig = computed<TrChatConfig>(() => ({
  ...createOfficialSceneConfig({
    brandTitle: 'Root + Page',
    welcomeTitle: 'Official Root + Page entry',
    welcomeDescription:
      'Use createRuntimeFromConfig(config) when you want to own runtime creation but keep the official page composition.',
    workspace: true,
  }),
  lifecycle: {
    afterReceive(message) {
      const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
      finishLog.value = `finish:${content.slice(0, 60)}`
      errorLog.value = 'error:none'
    },
    error(error) {
      errorLog.value = `error:${error instanceof Error ? error.message : String(error)}`
    },
  },
}))

const whiteboxResolution = computed(() => createRuntimeFromConfig(whiteboxConfig.value))
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}

.status-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 12px 0;
  font-size: 12px;
}

.status-bar span {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.08);
}
</style>
