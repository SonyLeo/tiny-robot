<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { computed, inject } from 'vue'
import { useChatFeedback } from '@/composables/useChatFeedback'
import { CHAT_KIT_KEY, MESSAGE_ACTION_KEY } from '@/context'
import type { ChatMessageActionPayload, UseChatKitReturn } from '@/types'

defineOptions({ name: 'TrChatFeedback' })

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
  if (isEditing.value) return false
  if (props.role === 'assistant') {
    if (hasError.value) return false
    if (isPendingAssistantTurn.value) return false
    return true
  }

  if (props.role === 'user') {
    return true
  }

  return true
})

const feedbackClass = computed(() => ({
  'tr-chat-feedback--assistant': props.role === 'assistant',
  'tr-chat-feedback--user': props.role === 'user',
}))

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
  <div v-if="shouldRenderFeedback" class="tr-chat-feedback" :class="feedbackClass" data-testid="chat-feedback">
    <TrFeedback :actions="feedbackActions" @action="handleAction" />
  </div>
</template>

<style scoped>
:global(.tr-chat-feedback) {
  margin-top: 8px;
}

:global(.tr-bubble[data-role='assistant'] .tr-chat-feedback) {
  align-self: flex-start;
}

:global(.tr-bubble[data-role='assistant'] .tr-chat-feedback .tr-feedback__operations) {
  justify-content: flex-start;
  padding: 0 2px;
}

:global(.tr-bubble[data-role='user'] .tr-chat-feedback) {
  align-self: flex-end;
  opacity: 0;
  transform: translateY(-2px);
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

:global(.tr-bubble[data-role='user']:hover .tr-chat-feedback),
:global(.tr-bubble[data-role='user']:focus-within .tr-chat-feedback) {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

:global(.tr-bubble[data-role='user'] .tr-chat-feedback .tr-feedback__operations) {
  justify-content: flex-end;
  padding: 0 2px;
}
</style>
