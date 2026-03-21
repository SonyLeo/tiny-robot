<script setup lang="ts">
import { inject } from 'vue'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_UI_KEY } from '@/context'
import { useResolvedChatMessages } from '@/messages'

const historyState = inject(CHAT_HISTORY_KEY)!
const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!
const chatMessages = useResolvedChatMessages()

function handleCreateNewSession() {
  chatKit.createConversation()
  showHistoryDrawer.value = false
}

function handleToggleManagement() {
  historyState.isManagementMode.value = !historyState.isManagementMode.value
  if (!historyState.isManagementMode.value) {
    historyState.clearSelection()
  }
}
</script>

<template>
  <div class="tr-chat-history-header">
    <button class="new-session-btn" @click="handleCreateNewSession">
      <IconNewSession />
      {{ chatMessages.history.newSession }}
    </button>
    <button class="manage-btn" :class="{ active: historyState.isManagementMode.value }" @click="handleToggleManagement">
      {{ historyState.isManagementMode.value ? chatMessages.history.done : chatMessages.history.manage }}
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: none;
  flex-shrink: 0;
  gap: 8px;
}

.btn-base {
  padding: 8px 16px;
  border: 1px solid var(--chat-history-control-border);
  border-radius: 12px;
  background: var(--chat-history-control-bg);
  color: var(--chat-history-control-text);
  box-shadow: var(--chat-history-control-shadow);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--chat-history-control-bg-hover);
    border-color: var(--chat-history-control-border-hover);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--chat-history-control-active-border);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--chat-history-control-active-border) 35%, transparent),
      var(--chat-history-control-shadow);
  }
}

.new-session-btn {
  .btn-base();
  flex: 4;
  gap: 8px;
}

.manage-btn {
  .btn-base();
  flex: 1;

  &.active {
    background: var(--chat-history-control-active-bg);
    border-color: var(--chat-history-control-active-border);
    color: var(--chat-history-control-active-text);
    box-shadow: var(--chat-history-control-active-shadow);
  }
}
</style>
