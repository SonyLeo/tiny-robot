<script setup lang="ts">
import { provide } from 'vue'
import { CHAT_HISTORY_KEY } from '@/context'
import { useHistoryState } from '@/composables/useHistoryState'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistorySurface' })

const historyState = useHistoryState()
provide(CHAT_HISTORY_KEY, historyState)
</script>

<template>
  <div class="tr-chat-history-surface">
    <ChatHistoryContent />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-surface {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--chat-history-surface-border);
  border-radius: var(--chat-history-surface-radius);
  overflow: hidden;
  background: var(--chat-history-surface-bg);
  box-shadow: var(--chat-history-surface-shadow);
}
</style>
