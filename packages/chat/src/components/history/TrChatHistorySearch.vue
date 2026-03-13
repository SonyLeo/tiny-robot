<script setup lang="ts">
import { inject } from 'vue'
import { CHAT_HISTORY_KEY } from '../../context'

// 职责：仅负责搜索输入框的渲染
const historyState = inject(CHAT_HISTORY_KEY)!
</script>

<template>
  <div class="tr-chat-history-search">
    <input v-model="historyState.searchQuery.value" type="text" placeholder="搜索会话..." class="search-input" />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-search {
  padding: 16px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--tr-color-primary);
  }
}
</style>
