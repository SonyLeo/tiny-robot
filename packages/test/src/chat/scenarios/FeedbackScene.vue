<template>
  <div class="feedback-grid">
    <!-- replace mode: only custom actions, no built-in copy/refresh -->
    <div data-testid="chat-feedback-replace" class="chat-wrapper">
      <TrChat :config="replaceModeConfig" />
    </div>

    <!-- usage panel: assistant messages with usage metadata show the info icon -->
    <div data-testid="chat-feedback-usage" class="chat-wrapper">
      <TrChat :config="usagePanelConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const replaceModeConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Feedback Replace Mode',
    welcomeTitle: 'Feedback Replace Mode',
    welcomeDescription: 'In replace mode only custom actions should appear, built-in copy/refresh are suppressed.',
    messages: {
      feedback: {
        enabled: true,
      },
      actions: [
        {
          id: 'custom-replace-action',
          label: '自定义操作',
          placement: 'operations' as const,
          roles: ['assistant'],
        },
      ],
      actionMode: 'replace',
    },
  }),
)

const usagePanelConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Usage Panel',
    welcomeTitle: 'Usage Panel Test',
    welcomeDescription: 'Send "usage-test" to get a reply with usage metadata.',
    messages: {
      feedback: {
        enabled: true,
      },
    },
  }),
)
</script>

<style scoped>
.feedback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}
</style>
