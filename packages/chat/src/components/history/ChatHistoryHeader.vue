<script setup lang="ts">
import { inject } from 'vue'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_UI_KEY } from '../../context'
import { CHAT_MESSAGES } from '../../messages'

const historyState = inject(CHAT_HISTORY_KEY)!
const chatKit = inject(CHAT_KIT_KEY)!
const { showHistoryDrawer } = inject(CHAT_UI_KEY)!

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
      {{ CHAT_MESSAGES.history.newSession }}
    </button>
    <button class="manage-btn" :class="{ active: historyState.isManagementMode.value }" @click="handleToggleManagement">
      {{ historyState.isManagementMode.value ? CHAT_MESSAGES.history.done : CHAT_MESSAGES.history.manage }}
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--tr-border-color-default);
  flex-shrink: 0;
  gap: 8px;
}

.btn-base {
  padding: 8px 16px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 12px;
  background: var(--tr-container-bg-default);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--tr-container-bg-hover);
    border-color: var(--tr-color-primary);
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
    background: var(--tr-color-primary-light);
    border-color: var(--tr-color-primary);
    color: var(--tr-color-primary);
  }
}
</style>
