<template>
  <div data-testid="chat-message-edit" class="chat-wrapper">
    <TrChat :config="messageEditConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const messageEditConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Message Edit',
    welcomeTitle: 'Message Edit Scene',
    welcomeDescription: 'Send a message, then use the edit button to modify and resend it.',
    initialMessages: [
      { role: 'user', content: 'original message' },
      { role: 'assistant', content: 'reply from assistant' },
    ],
    messages: {
      feedback: {
        enabled: true,
      },
    },
  }),
)
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}
</style>
