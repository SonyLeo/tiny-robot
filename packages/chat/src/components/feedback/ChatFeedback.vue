<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import { getChatRenderSourceMessage } from '@/runtime/chat-kit/chatRenderMessages'
import { useChatFeedbackWithFallbackRuntime, useRuntimeFeedbackEnabled } from './useChatFeedback'
import { getChatMessageError, isChatMessageEditing } from '@/runtime/chat-kit/chatMessageState'
import { CHAT_KIT_KEY, CHAT_RUNTIME_KEY, MESSAGE_ACTION_KEY, MESSAGE_ACTIONS_KEY } from '@/shared/context'
import type { ChatMessageActionPayload, ChatRuntime, TrChatMessageListProps } from '@/types'
import type { UseChatKitReturn } from '@/types/core'
import { triStateBooleanProp } from '@/shared/utils'

defineOptions({ name: 'TrChatFeedback' })

const props = defineProps({
  messages: {
    type: Array as () => BubbleMessage[],
    required: true,
  },
  messageIndexes: {
    type: Array as () => number[],
    required: true,
  },
  role: String,
  enabled: triStateBooleanProp,
  messageActions: null as unknown as PropType<TrChatMessageListProps['messageActions']>,
  messageActionsMode: String as PropType<TrChatMessageListProps['messageActionsMode']>,
  onActionClick: Function as PropType<(payload: ChatMessageActionPayload) => void>,
})

const emit = defineEmits<{
  edit: [content: string]
  'action-click': [payload: ChatMessageActionPayload]
}>()

const chatKit = inject<UseChatKitReturn | null>(CHAT_KIT_KEY, null)
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const injectedActionHandler = inject(MESSAGE_ACTION_KEY, undefined)
const injectedActionConfig = inject(MESSAGE_ACTIONS_KEY, null)

const { feedbackActions, feedbackOperations, getActionDefinition, actionContext, messageIds, userContent } =
  useChatFeedbackWithFallbackRuntime({
    messages: props.messages,
    messageIndexes: props.messageIndexes,
    role: props.role,
    fallbackRuntime: chatKit,
    runtime: chatRuntime,
    messageActions: props.messageActions ?? injectedActionConfig?.messageActions.value,
    messageActionsMode: props.messageActionsMode ?? injectedActionConfig?.messageActionsMode.value,
  })

const primaryMessageIndex = computed(() => props.messageIndexes?.[0])
const feedbackEnabled = useRuntimeFeedbackEnabled({
  enabled: props.enabled,
  runtime: chatRuntime,
})
const primaryMessage = computed(() => {
  if (!props.messages?.length) return undefined
  return getChatRenderSourceMessage(props.messages[props.messages.length - 1] as ChatMessage) as ChatMessage | undefined
})
const primarySourceError = computed(() => getChatMessageError(primaryMessage.value))
const primarySourceEditing = computed(() => isChatMessageEditing(primaryMessage.value))
const primarySourceStreaming = computed(() => Boolean(primaryMessage.value?.loading))

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
  if (actionContext.value.messageId && chatRuntime) {
    const runtimeEditing = chatRuntime.message.getViewState(actionContext.value.messageId)?.editing
    if (runtimeEditing !== undefined) {
      return Boolean(runtimeEditing)
    }
  }

  if (primarySourceEditing.value) {
    return true
  }

  if (!chatKit || primaryMessageIndex.value === undefined) return false
  return Boolean(chatKit.isMessageEditing(primaryMessageIndex.value))
})

const isPendingAssistantTurn = computed(() => {
  if (props.role !== 'assistant') return false

  if (actionContext.value.messageId && chatRuntime) {
    const status = chatRuntime.message.getViewState(actionContext.value.messageId)?.status
    if (status !== undefined) {
      return status === 'pending' || status === 'streaming'
    }
  }

  if (primarySourceStreaming.value) return true

  if (!chatKit) return false

  const latestIndex = latestAssistantIndex.value
  if (latestIndex === undefined) return false

  return props.messageIndexes.includes(latestIndex) && chatKit.status.value !== 'ready'
})

const hasError = computed(() => {
  if (actionContext.value.messageId && chatRuntime) {
    const runtimeError = chatRuntime.message.getViewState(actionContext.value.messageId)?.error
    if (runtimeError !== undefined) {
      return Boolean(runtimeError)
    }
  }

  if (primarySourceError.value) {
    return true
  }

  return props.messages.some((message) => Boolean(getChatMessageError(message as ChatMessage)))
})

const shouldRenderFeedback = computed(() => {
  if (!feedbackEnabled.value) return false
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

function emitAction(action: string, placement: 'actions' | 'operations' = 'actions') {
  const payload: ChatMessageActionPayload = {
    action,
    placement,
    role: props.role,
    messages: props.messages.map(
      (message) => getChatRenderSourceMessage(message as ChatMessage) ?? (message as ChatMessage),
    ),
    messageIds: messageIds.value,
    messageIndexes: props.messageIndexes,
    message: primaryMessage.value,
    messageIndex: primaryMessageIndex.value,
    messageId: actionContext.value.messageId,
    conversationId: chatKit?.activeConversationId.value ?? undefined,
  }

  props.onActionClick?.(payload)
  injectedActionHandler?.(payload)
  emit('action-click', payload)
}

async function triggerAction(name: string, placement: 'actions' | 'operations' = 'actions') {
  const actionDefinition = getActionDefinition(name, placement) ?? getActionDefinition(name)
  if (actionDefinition?.onClick) {
    try {
      await actionDefinition.onClick(actionContext.value)
    } catch (error) {
      console.error(`[TrChatFeedback] message action "${name}" failed`, error)
    }
  }

  if (name === 'edit') {
    emit('edit', userContent.value)
  }

  emitAction(name, placement)
}
</script>

<template>
  <div v-if="shouldRenderFeedback" class="tr-chat-feedback" :class="feedbackClass" data-testid="chat-feedback">
    <TrFeedback
      :actions="feedbackActions"
      :operations="feedbackOperations"
      @action="triggerAction"
      @operation="(name) => triggerAction(name, 'operations')"
    />
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
