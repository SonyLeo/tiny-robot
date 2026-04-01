import { computed, h } from 'vue'
import { useClipboard } from '@vueuse/core'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { useResolvedChatMessages } from '@/messages'
import { getChatRenderSourceMessage, unwrapChatRenderMessages } from '@/composables/chatRenderMessages'
import type {
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  UseChatKitReturn,
} from '@/types'

export interface UseChatFeedbackOptions {
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
  chatKit?: UseChatKitReturn | null
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
}

export function useChatFeedback(options: UseChatFeedbackOptions) {
  const { messages, messageIndexes, role, chatKit = null } = options
  const sourceMessages = computed(() => unwrapChatRenderMessages(messages as unknown as ChatMessage[]))
  const { copy } = useClipboard()
  const chatMessages = useResolvedChatMessages()
  const messageActionMode = computed<ChatMessageActionsMode>(() => options.messageActionsMode ?? 'append')

  const lastContent = computed(() => {
    const last = [...sourceMessages.value].reverse().find((message) => message.role === 'assistant' || !message.role)
    if (!last?.content) {
      return ''
    }
    return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
  })

  const lastUserContent = computed(() => {
    if (!chatKit) {
      return ''
    }

    const allMessages = chatKit.messages.value
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
    chatKit ? chatKit.status.value === 'streaming' || chatKit.status.value === 'submitted' : false,
  )

  const actionContext = computed<ChatMessageActionContext>(() => {
    const primaryMessageIndex = messageIndexes[0]
    const primaryMessage = getChatRenderSourceMessage(sourceMessages.value[sourceMessages.value.length - 1])

    return {
      role,
      messages: sourceMessages.value,
      messageIndexes,
      message: primaryMessage as ChatMessage | undefined,
      messageIndex: primaryMessageIndex,
      chatKit,
      conversationId: chatKit?.activeConversationId.value ?? undefined,
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
          onClick: () => {
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
            if (chatKit && context.messageIndex !== undefined) {
              chatKit.startEditMessage(context.messageIndex)
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
        onClick: () => {
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
        when: () => Boolean(chatKit && !isStreaming.value && lastUserContent.value),
        onClick: async () => {
          if (!chatKit || isStreaming.value || !lastUserContent.value) {
            return
          }

          if (chatKit.lastError.value?.retryable) {
            await chatKit.retry()
            return
          }

          chatKit.sendMessage(lastUserContent.value)
        },
      },
    ]
  })

  const customActions = computed<ChatMessageActionDefinition[]>(() => {
    const { messageActions } = options
    if (!messageActions) {
      return []
    }

    return typeof messageActions === 'function' ? messageActions(actionContext.value) : messageActions
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
    userContent,
  }
}
