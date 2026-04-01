<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import type { PropType } from 'vue'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_MESSAGES_KEY, CHAT_UI_KEY, createChatUiContext } from '@/context'
import { useHistoryState } from './useHistoryState'
import { CHAT_MESSAGES, resolveChatMessages } from '@/messages'
import type { ChatMessagesOverrides, UseChatKitReturn } from '@/types'
import ChatHistoryContent from './ChatHistoryContent.vue'

defineOptions({ name: 'TrChatHistorySurface' })

const props = defineProps({
  chatKit: Object as PropType<UseChatKitReturn>,
  messages: Object as PropType<ChatMessagesOverrides>,
})
const injectedChatKit = inject(CHAT_KIT_KEY, null)
const resolvedChatKit = props.chatKit ?? injectedChatKit

if (!resolvedChatKit) {
  throw new Error('[TrChatHistorySurface] chatKit prop is required when used outside TrChat.Root')
}

const injectedMessages = inject(CHAT_MESSAGES_KEY, null)
const resolvedMessages = computed(() => {
  if (props.messages) {
    return resolveChatMessages(props.messages)
  }

  return injectedMessages?.value ?? CHAT_MESSAGES
})

const historyState = useHistoryState()
const surfaceUi = createChatUiContext({
  historyDisplay: 'surface',
  historyVisible: true,
  closableHistory: false,
})

provide(CHAT_KIT_KEY, resolvedChatKit)
provide(CHAT_MESSAGES_KEY, resolvedMessages)
provide(CHAT_UI_KEY, surfaceUi)
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
