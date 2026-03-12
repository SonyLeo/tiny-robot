<script setup lang="ts">
import { inject } from 'vue'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_UI_KEY } from '../context'

// 职责：仅负责头部按钮的渲染和事件分发
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
    <button class="new-session-btn" @click="handleCreateNewSession"><IconNewSession /> 新建会话</button>
    <button class="manage-btn" :class="{ active: historyState.isManagementMode.value }" @click="handleToggleManagement">
      {{ historyState.isManagementMode.value ? '完成' : '管理' }}
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--tr-border-color-default);
  flex-shrink: 0;
  gap: 8px;
}

.new-session-btn {
  flex: 4;
  padding: 8px 16px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--tr-container-bg-hover);
    border-color: var(--tr-color-primary);
  }
}

.manage-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
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

  &.active {
    background: var(--tr-color-primary-light);
    border-color: var(--tr-color-primary);
    color: var(--tr-color-primary);
  }
}
</style>
