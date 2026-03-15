import { computed, shallowRef } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseChatKitOptions, UseChatKitReturn, UseMessageResponseProvider } from '../types'
import type { StructuredData } from '@opentiny/tiny-robot'
import { useChatConversation } from './useChatConversation'
import { useChatMessages } from './useChatMessages'
import { useChatRequest } from './useChatRequest'

interface RetryContext {
  conversationId: string
  userContent: string
  failedTurnStartIndex: number
}

export function useChatKit(options: UseChatKitOptions): UseChatKitReturn {
  const responseProviderRef = shallowRef<UseMessageResponseProvider>(
    options.responseProvider as UseMessageResponseProvider,
  )
  const retryContext = shallowRef<RetryContext | null>(null)

  function clearFailureState() {
    retryContext.value = null
    request.clearLastError()
  }

  const conversation = useChatConversation({
    plugins: options.plugins,
    storage: options.storage,
    initialMessages: options.initialMessages,
    onFinish: options.onFinish,
    onError: options.onError,
    onTurnError: ({ context, error }) => {
      const normalizedError = request.captureError(error)
      const currentConversationId = conversation.activeConversationId.value
      const userMessage = context.currentTurn.find(
        (message) => message.role === 'user' && typeof message.content === 'string' && message.content.trim(),
      )
      const failedAssistantMessage = [...context.currentTurn].reverse().find((message) => message !== userMessage)

      if (failedAssistantMessage) {
        failedAssistantMessage.role = failedAssistantMessage.role || 'assistant'
        failedAssistantMessage.loading = undefined
        failedAssistantMessage.state = {
          ...(failedAssistantMessage.state ?? {}),
          error: normalizedError,
        }
      }

      if (
        currentConversationId &&
        userMessage &&
        typeof userMessage.content === 'string' &&
        normalizedError.retryable
      ) {
        retryContext.value = {
          conversationId: currentConversationId,
          userContent: userMessage.content,
          failedTurnStartIndex: context.messages.findIndex((message) => message === userMessage),
        }
      } else {
        retryContext.value = null
      }
    },
    responseProviderRef,
  })

  const request = useChatRequest({
    conversation,
    responseProviderRef,
  })

  const messages = computed<ChatMessage[]>(() => conversation.activeConversation.value?.engine.messages.value ?? [])

  const messageActions = useChatMessages({
    messages,
    resendMessage: conversation.sendMessage,
  })

  function sendMessage(content: string, _data?: StructuredData): void {
    if (!content.trim()) return
    clearFailureState()
    conversation.sendMessage(content)
  }

  async function retry(): Promise<boolean> {
    const currentRetryContext = retryContext.value
    const currentError = request.lastError.value

    if (!currentRetryContext || !currentError?.retryable) {
      return false
    }

    if (conversation.activeConversationId.value !== currentRetryContext.conversationId) {
      const switchedConversation = await conversation.switchConversation(currentRetryContext.conversationId)
      if (!switchedConversation) {
        return false
      }
    }

    const activeMessages = conversation.activeConversation.value?.engine.messages.value
    if (!activeMessages) {
      return false
    }

    if (
      currentRetryContext.failedTurnStartIndex >= 0 &&
      activeMessages[currentRetryContext.failedTurnStartIndex]?.content === currentRetryContext.userContent
    ) {
      activeMessages.splice(currentRetryContext.failedTurnStartIndex)
    }

    clearFailureState()
    conversation.sendMessage(currentRetryContext.userContent)
    return true
  }

  return {
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    createConversation: conversation.createConversation,
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    abortActiveRequest: conversation.abortActiveRequest,
    messages,
    status: request.status,
    lastError: request.lastError,
    sendMessage,
    updateResponseProvider: request.updateResponseProvider,
    abort: request.abort,
    retry,
    startEditMessage: messageActions.startEditMessage,
    cancelEditMessage: messageActions.cancelEditMessage,
    isMessageEditing: messageActions.isMessageEditing,
    editMessage: messageActions.editMessage,
  }
}
