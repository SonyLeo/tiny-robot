<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { computed, inject } from 'vue'
import { useChatFeedback } from '../composables/useChatFeedback'
import { CHAT_KIT_KEY, MESSAGE_ACTION_KEY } from '../context'
import type { ChatMessageActionPayload, UseChatKitReturn } from '../types'

const props = defineProps<{
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
  onActionClick?: (payload: ChatMessageActionPayload) => void
}>()

const emit = defineEmits<{
  edit: [content: string]
  'action-click': [payload: ChatMessageActionPayload]
}>()

const chatKit = inject<UseChatKitReturn | null>(CHAT_KIT_KEY, null)
const injectedActionHandler = inject(MESSAGE_ACTION_KEY, undefined)

const { feedbackActions, handleCopyAction, handleRefreshAction, userContent } = useChatFeedback({
  messages: props.messages,
  messageIndexes: props.messageIndexes,
  role: props.role,
  chatKit,
})

const primaryMessageIndex = computed(() => props.messageIndexes?.[0])
const primaryMessage = computed(() => {
  if (!props.messages?.length) return undefined
  return props.messages[props.messages.length - 1] as ChatMessage | undefined
})

const latestAssistantIndex = computed(() => {
  if (!chatKit) return undefined

  const allMessages = chatKit.messages.value
  for (let index = allMessages.length - 1; index >= 0; index--) {
    if (allMessages[index]?.role === 'assistant') {
      return index
    }
  }

  return undefined
})

const isEditing = computed(() => {
  if (!chatKit || primaryMessageIndex.value === undefined) return false
  return chatKit.isMessageEditing(primaryMessageIndex.value)
})

const isPendingAssistantTurn = computed(() => {
  if (!chatKit || props.role !== 'assistant') return false

  const latestIndex = latestAssistantIndex.value
  if (latestIndex === undefined) return false

  return props.messageIndexes.includes(latestIndex) && chatKit.status.value !== 'ready'
})

const hasError = computed(() => props.messages.some((message) => Boolean((message as ChatMessage).state?.error)))

const shouldRenderFeedback = computed(() => {
  if (props.role !== 'assistant') return false
  if (isEditing.value) return false
  if (hasError.value) return false
  if (isPendingAssistantTurn.value) return false
  return true
})

function emitAction(action: string) {
  const payload: ChatMessageActionPayload = {
    action,
    role: props.role,
    messages: props.messages as unknown as ChatMessage[],
    messageIndexes: props.messageIndexes,
    message: primaryMessage.value,
    messageIndex: primaryMessageIndex.value,
  }

  props.onActionClick?.(payload)
  injectedActionHandler?.(payload)
  emit('action-click', payload)
}

function handleAction(name: string) {
  if (name === 'copy') {
    handleCopyAction()
    emitAction(name)
    return
  }

  if (name === 'edit') {
    if (chatKit && primaryMessageIndex.value !== undefined) {
      chatKit.startEditMessage(primaryMessageIndex.value)
    }
    emit('edit', userContent.value)
    emitAction(name)
    return
  }

  if (name === 'refresh' && handleRefreshAction()) {
    emit('edit', userContent.value)
  }

  emitAction(name)
}
</script>

<template>
  <TrFeedback v-if="shouldRenderFeedback" :actions="feedbackActions" @action="handleAction" />
</template>

<style scoped>
:deep(.tr-feedback .tr-feedback__operations) {
  justify-content: flex-start !important;
  padding: 0 2px;
}
</style>
