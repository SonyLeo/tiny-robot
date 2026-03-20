<template>
  <div data-testid="chat-blackbox" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="on-finish-log">{{ finishLog }}</span>
      <span data-testid="on-action-log">{{ actionLog }}</span>
      <span data-testid="variant-indicator">{{ messageListVariant }}</span>
      <button data-testid="toggle-message-variant" @click="toggleMessageListVariant">
        {{ messageListVariant === 'bubble' ? 'docs variant' : 'bubble variant' }}
      </button>
    </div>

    <TrChat
      :brand="sharedBrand"
      :welcome="sharedWelcome"
      :prompts="sharedPrompts"
      :attachments-feature="sharedAttachmentsFeature"
      :sender-actions-feature="sharedSenderActionsFeature"
      :models="sharedModels"
      :provider-factories="sharedProviderFactories"
      default-model="openai-test"
      placeholder="请输入消息..."
      :max-length="20"
      show-history
      show-feedback
      :message-list-variant="messageListVariant"
      :on-finish="handleFinish"
      :on-error="handleError"
      :on-message-action="handleMessageAction"
      v-model:fullscreen="isFullscreen"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat } from '../../../../chat/src'
import type { ChatListVariant, ChatMessageActionPayload } from '../../../../chat/src/types'
import {
  sharedAttachmentsFeature,
  sharedBrand,
  sharedModels,
  sharedPrompts,
  sharedProviderFactories,
  sharedSenderActionsFeature,
  sharedWelcome,
} from './sharedDemoFixtures'

const finishLog = ref('')
const actionLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')
const isFullscreen = ref(false)

function handleFinish(msg: { content?: string }) {
  finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
}

function handleError(err: Error) {
  finishLog.value = `error:${err.message}`
}

function handleMessageAction(payload: ChatMessageActionPayload) {
  actionLog.value = `action:${payload.action}:${payload.role ?? ''}:${payload.messageIndex ?? -1}`
}

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
