<template>
  <div data-testid="chat-error-retry" class="chat-wrapper">
    <TrChat :config="errorRetryConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

// The mock API server returns a 500 for messages containing "err" (non-edge provider)
// and retries succeed on the second attempt for "err-once".
const errorRetryConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Error Retry',
    welcomeTitle: 'Error & Retry Scene',
    welcomeDescription: 'Send "err" to trigger a permanent error, "err-once" for a retryable failure.',
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
