import { computed, type ComputedRef, h, type Ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { useResolvedChatMessages } from '@/shared/messages'
import { getChatRenderSourceMessage, unwrapChatRenderMessages } from '@/runtime/chat-kit/chatRenderMessages'
import { ensureRuntimeMessageId } from '@/runtime/core/messageIdentity'
import type {
  ChatErrorInfo,
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatRuntime,
  ChatStatus,
} from '@/types'

export interface UseChatFeedbackOptions {
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
  runtime?: ChatRuntime | null
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
}

interface ChatFeedbackFallbackRuntime {
  activeConversationId: Readonly<Ref<string | null>>
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>
  lastError: ComputedRef<ChatErrorInfo | null>
  startEditMessage: (messageIndex: number) => void
  retry: () => Promise<boolean>
  regenerate: (messageIndex?: number) => Promise<boolean>
}

export interface UseChatFeedbackWithFallbackRuntimeOptions extends UseChatFeedbackOptions {
  fallbackRuntime?: ChatFeedbackFallbackRuntime | null
}

export function useRuntimeFeedbackEnabled(options: { enabled?: boolean; runtime?: ChatRuntime | null }) {
  return computed(() => options.enabled ?? options.runtime?.message.config?.feedback?.enabled ?? true)
}

function createChatFeedbackState(options: UseChatFeedbackWithFallbackRuntimeOptions) {
  const { messages, messageIndexes, role, fallbackRuntime = null, runtime = null } = options
  const sourceMessages = computed(() => unwrapChatRenderMessages(messages as unknown as ChatMessage[]))
  const { copy } = useClipboard()
  const chatMessages = useResolvedChatMessages()
  const runtimeActionMode = computed<ChatMessageActionsMode | undefined>(() => runtime?.message.config?.actionMode)
  const messageActionMode = computed<ChatMessageActionsMode>(
    () => options.messageActionsMode ?? runtimeActionMode.value ?? 'append',
  )
  const primaryMessage = computed(() =>
    getChatRenderSourceMessage(sourceMessages.value[sourceMessages.value.length - 1]),
  )
  const messageIds = computed(() =>
    sourceMessages.value
      .map((message) => ensureRuntimeMessageId(message))
      .filter((messageId): messageId is string => Boolean(messageId)),
  )
  const primaryMessageId = computed(() =>
    primaryMessage.value ? ensureRuntimeMessageId(primaryMessage.value) : undefined,
  )
  const primaryViewState = computed(() =>
    runtime && primaryMessageId.value ? runtime.message.getViewState(primaryMessageId.value) : undefined,
  )

  const lastContent = computed(() => {
    const last = [...sourceMessages.value].reverse().find((message) => message.role === 'assistant' || !message.role)
    if (!last?.content) {
      return ''
    }
    return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
  })

  const lastUserContent = computed(() => {
    if (!fallbackRuntime) {
      return ''
    }

    const allMessages = fallbackRuntime.messages.value
    const firstIndex = messageIndexes[0] ?? 0
    for (let index = firstIndex - 1; index >= 0; index--) {
      if (allMessages[index]?.role === 'user') {
        const content = allMessages[index].content
        return typeof content === 'string' ? content : ''
      }
    }

    return ''
  })

  const userContent = computed(() => {
    const userMessage = sourceMessages.value.find((message) => message.role === 'user')
    if (!userMessage?.content) {
      return ''
    }
    return typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content)
  })

  const isStreaming = computed(() =>
    primaryViewState.value
      ? primaryViewState.value.status === 'streaming' || primaryViewState.value.status === 'pending'
      : fallbackRuntime
        ? fallbackRuntime.status.value === 'streaming' || fallbackRuntime.status.value === 'submitted'
        : false,
  )

  const actionContext = computed<ChatMessageActionContext>(() => {
    const primaryMessageIndex = messageIndexes[messageIndexes.length - 1]

    return {
      role,
      messages: sourceMessages.value,
      messageIds: messageIds.value,
      messageIndexes,
      message: primaryMessage.value as ChatMessage | undefined,
      messageIndex: primaryMessageIndex,
      messageId: primaryMessageId.value,
      runtime,
      conversationId: runtime ? undefined : (fallbackRuntime?.activeConversationId.value ?? undefined),
    }
  })

  const builtInActions = computed<ChatMessageActionDefinition[]>(() => {
    if (role === 'user') {
      return [
        {
          id: 'copy',
          label: chatMessages.value.feedback.copy,
          icon: 'copy',
          placement: 'actions',
          roles: ['user'],
          order: 100,
          onClick: async () => {
            if (runtime && primaryMessageId.value) {
              await runtime.message.copy(primaryMessageId.value)
              return
            }

            copy(userContent.value)
          },
        },
        {
          id: 'edit',
          label: chatMessages.value.feedback.edit,
          icon: h(IconEditPen),
          placement: 'actions',
          roles: ['user'],
          order: 200,
          onClick: (context) => {
            if (runtime && context.messageId) {
              runtime.message.startEdit(context.messageId)
              return
            }

            if (fallbackRuntime && context.messageIndex !== undefined) {
              fallbackRuntime.startEditMessage(context.messageIndex)
            }
          },
        },
      ]
    }

    if (role !== 'assistant') {
      return []
    }

    return [
      {
        id: 'copy',
        label: chatMessages.value.feedback.copy,
        icon: 'copy',
        placement: 'actions',
        roles: ['assistant'],
        order: 100,
        onClick: async () => {
          if (runtime && primaryMessageId.value) {
            await runtime.message.copy(primaryMessageId.value)
            return
          }

          copy(lastContent.value)
        },
      },
      {
        id: 'refresh',
        label: chatMessages.value.feedback.regenerate,
        icon: 'refresh',
        placement: 'actions',
        roles: ['assistant'],
        order: 200,
        when: () =>
          Boolean(
            (runtime && primaryMessageId.value) || (fallbackRuntime && !isStreaming.value && lastUserContent.value),
          ),
        onClick: async (context) => {
          if (runtime && context.messageId) {
            const viewState = runtime.message.getViewState(context.messageId)
            if (viewState?.error?.retryable) {
              await runtime.conversation.retry(context.messageId)
              return
            }

            await runtime.conversation.regenerate(context.messageId)
            return
          }

          if (!fallbackRuntime || isStreaming.value || !lastUserContent.value) {
            return
          }

          if (fallbackRuntime.lastError.value?.retryable) {
            await fallbackRuntime.retry()
            return
          }

          await fallbackRuntime.regenerate(context.messageIndex)
        },
      },
    ]
  })

  const customActions = computed<ChatMessageActionDefinition[]>(() => {
    const { messageActions } = options
    if (messageActions) {
      return typeof messageActions === 'function' ? messageActions(actionContext.value) : messageActions
    }

    if (runtime?.message.getActions && primaryMessageId.value) {
      return runtime.message.getActions(primaryMessageId.value) ?? []
    }

    return []
  })

  const resolvedActions = computed<ChatMessageActionDefinition[]>(() => {
    const actionSource =
      messageActionMode.value === 'replace' ? customActions.value : [...builtInActions.value, ...customActions.value]

    const deduped = new Map<string, ChatMessageActionDefinition>()
    actionSource.forEach((action) => {
      deduped.set(action.id, action)
    })

    return [...deduped.values()]
      .filter((action) => {
        const actionRoles = action.roles
        if (actionRoles?.length && (!role || !actionRoles.includes(role as never))) {
          return false
        }

        if (action.when && action.when(actionContext.value) === false) {
          return false
        }

        return true
      })
      .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER))
  })

  const feedbackActions = computed<FeedbackProps['actions']>(() =>
    resolvedActions.value
      .filter((action) => (action.placement ?? 'actions') === 'actions')
      .map((action) => ({
        name: action.id,
        label: action.label,
        icon: action.icon,
      })),
  )

  const feedbackOperations = computed<FeedbackProps['operations']>(() =>
    resolvedActions.value
      .filter((action) => action.placement === 'operations')
      .map((action) => ({
        name: action.id,
        label: action.label,
      })),
  )

  function getActionDefinition(actionId: string, placement?: 'actions' | 'operations') {
    return resolvedActions.value.find(
      (action) => action.id === actionId && (placement === undefined || (action.placement ?? 'actions') === placement),
    )
  }

  return {
    feedbackActions,
    feedbackOperations,
    getActionDefinition,
    actionContext,
    messageIds,
    userContent,
  }
}

export function useChatFeedback(options: UseChatFeedbackOptions) {
  return createChatFeedbackState(options)
}

export function useChatFeedbackWithFallbackRuntime(options: UseChatFeedbackWithFallbackRuntimeOptions) {
  return createChatFeedbackState(options)
}
