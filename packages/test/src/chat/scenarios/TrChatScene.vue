<template>
  <div data-testid="chat-trchat" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="business-action-log">{{ businessActionLog }}</span>
      <span data-testid="on-action-log">{{ actionLog }}</span>
    </div>
    <TrChat :config="trChatConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const businessActionLog = ref('business:none')
const actionLog = ref('action:none')

const trChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'TrChat',
    welcomeTitle: 'Official TrChat entry',
    welcomeDescription: 'Pass a target TrChatConfig directly into TrChat.',
    workspace: true,
    models: [
      { id: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
      { id: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
    ],
    defaultModelId: 'openai-test',
    messages: {
      actions: [
        {
          id: 'save-case',
          label: '保存到案例库',
          placement: 'operations',
          roles: ['assistant'],
          order: 10,
          onClick(context) {
            businessActionLog.value = `business:${context.role ?? 'unknown'}`
            actionLog.value = `action:save-case:${context.role ?? 'unknown'}:${context.messageId ?? 'none'}`
          },
        },
      ],
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
