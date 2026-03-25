<template>
  <div data-testid="chat-blackbox" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="on-finish-log">{{ finishLog }}</span>
      <span data-testid="on-action-log">{{ actionLog }}</span>
      <span data-testid="variant-indicator">{{ messageListVariant }}</span>
      <span data-testid="model-change-log">{{ modelChangeLog }}</span>
      <button data-testid="toggle-message-variant" @click="toggleMessageListVariant">
        {{ messageListVariant === 'bubble' ? 'docs variant' : 'bubble variant' }}
      </button>
    </div>

    <TrChat :config="blackboxConfig" :callbacks="blackboxCallbacks" :preset-overrides="blackboxPresetOverrides" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '../../../../chat/src'
import type { ChatListVariant, ChatMessageActionPayload, ModelOption } from '../../../../chat/src/types'
import {
  createChatSceneConfig,
  sharedAttachmentsFeature,
  sharedBrand,
  sharedPrompts,
  sharedProviderFactories,
  sharedSenderActionsFeature,
  sharedWelcome,
} from './sharedDemoFixtures'

const finishLog = ref('')
const actionLog = ref('')
const modelChangeLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')

const blackboxConfig = createChatSceneConfig({
  ui: {
    brand: sharedBrand,
    welcome: sharedWelcome,
    prompts: sharedPrompts,
  },
  features: {
    attachments: sharedAttachmentsFeature,
    senderActions: sharedSenderActionsFeature,
    history: true,
    feedback: true,
  },
})

const blackboxCallbacks = {
  onFinish(message: { content?: string }) {
    finishLog.value = `finish:${message.content?.slice(0, 40) ?? ''}`
  },
  onError(error: Error) {
    finishLog.value = `error:${error.message}`
  },
  onMessageAction(payload: ChatMessageActionPayload) {
    actionLog.value = `action:${payload.action}:${payload.role ?? ''}:${payload.messageIndex ?? -1}`
  },
  onModelChange(model: ModelOption) {
    modelChangeLog.value = `model:${model.value}`
  },
}

const blackboxPresetOverrides = computed(() => ({
  providerFactories: sharedProviderFactories,
  placeholder: '请输入消息...',
  maxLength: 20,
  messageListVariant: messageListVariant.value,
}))

function toggleMessageListVariant() {
  messageListVariant.value = messageListVariant.value === 'bubble' ? 'docs' : 'bubble'
}
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
}

.status-bar span {
  padding: 2px 6px;
  background: #e8e8e8;
  border-radius: 3px;
}

.status-bar button {
  padding: 2px 8px;
  border: 1px solid #d0d7e2;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font: inherit;
}
</style>
