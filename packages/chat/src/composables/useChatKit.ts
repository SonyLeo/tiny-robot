import { computed, shallowRef, watchEffect } from 'vue'
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

interface OptimisticTurnContext {
  conversationId: string
  userContent: string
  userMessage: ChatMessage | null
  assistantMessage: ChatMessage | null
}

interface EditRollbackContext {
  conversationId: string
  messageIndex: number
  removedMessages: ChatMessage[]
}

function ensureMessageState(message: ChatMessage) {
  message.state ??= {}
  return message.state
}

function setMessageOptimistic(message: ChatMessage | null, isOptimistic: boolean) {
  if (!message) return

  const state = ensureMessageState(message)
  state.optimistic = isOptimistic || undefined
}

function findLatestUserMessage(messages: ChatMessage[], userContent: string): ChatMessage | null {
  return (
    [...messages]
      .reverse()
      .find(
        (message) => message.role === 'user' && typeof message.content === 'string' && message.content === userContent,
      ) ?? null
  )
}

function findAssistantMessageForTurn(messages: ChatMessage[], userMessage: ChatMessage | null): ChatMessage | null {
  if (!userMessage) return null

  const userIndex = messages.findIndex((message) => message === userMessage)
  if (userIndex === -1) return null

  return (
    messages
      .slice(userIndex + 1)
      .find((message) => message.loading || message.role === 'assistant' || message.role === '') ?? null
  )
}

export function useChatKit(options: UseChatKitOptions): UseChatKitReturn {
  const responseProviderRef = shallowRef<UseMessageResponseProvider>(
    options.responseProvider as UseMessageResponseProvider,
  )
  const retryContext = shallowRef<RetryContext | null>(null)
  const optimisticTurn = shallowRef<OptimisticTurnContext | null>(null)
  const editRollbackContext = shallowRef<EditRollbackContext | null>(null)

  function clearFailureState() {
    retryContext.value = null
    request.clearLastError()
  }

  function clearOptimisticTurn() {
    if (!optimisticTurn.value) return

    setMessageOptimistic(optimisticTurn.value.userMessage, false)
    setMessageOptimistic(optimisticTurn.value.assistantMessage, false)
    optimisticTurn.value = null
  }

  function clearPendingEditRollback() {
    editRollbackContext.value = null
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
        editRollbackContext.value &&
        currentConversationId &&
        editRollbackContext.value.conversationId === currentConversationId
      ) {
        const activeMessages = conversation.activeConversation.value?.engine.messages.value
        if (activeMessages) {
          activeMessages.splice(
            editRollbackContext.value.messageIndex,
            activeMessages.length - editRollbackContext.value.messageIndex,
            ...editRollbackContext.value.removedMessages,
          )
        }
        clearPendingEditRollback()
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

  function resendMessage(content: string) {
    conversation.sendMessage(content)
    markOptimisticTurn(content)
  }

  const messageActions = useChatMessages({
    messages,
    resendMessage,
    onOptimisticEdit: ({ messageIndex, removedMessages }) => {
      const currentConversationId = conversation.activeConversationId.value
      if (!currentConversationId) return

      clearFailureState()
      clearPendingEditRollback()
      editRollbackContext.value = {
        conversationId: currentConversationId,
        messageIndex,
        removedMessages,
      }
    },
  })

  function markOptimisticTurn(content: string) {
    const currentConversationId = conversation.activeConversationId.value
    const activeMessages = conversation.activeConversation.value?.engine.messages.value
    if (!currentConversationId || !activeMessages) return

    const userMessage = findLatestUserMessage(activeMessages, content)
    if (!userMessage) return

    const assistantMessage = findAssistantMessageForTurn(activeMessages, userMessage)
    setMessageOptimistic(userMessage, true)
    setMessageOptimistic(assistantMessage, true)

    optimisticTurn.value = {
      conversationId: currentConversationId,
      userContent: content,
      userMessage,
      assistantMessage,
    }
  }

  watchEffect(() => {
    if (!optimisticTurn.value) return

    const currentConversationId = conversation.activeConversationId.value
    const activeMessages = conversation.activeConversation.value?.engine.messages.value ?? []
    if (!currentConversationId || currentConversationId !== optimisticTurn.value.conversationId) {
      clearOptimisticTurn()
      return
    }

    if (!optimisticTurn.value.userMessage) {
      optimisticTurn.value.userMessage = findLatestUserMessage(activeMessages, optimisticTurn.value.userContent)
      setMessageOptimistic(optimisticTurn.value.userMessage, true)
    }

    if (!optimisticTurn.value.assistantMessage) {
      optimisticTurn.value.assistantMessage = findAssistantMessageForTurn(
        activeMessages,
        optimisticTurn.value.userMessage,
      )
      setMessageOptimistic(optimisticTurn.value.assistantMessage, true)
    }

    if (request.status.value === 'ready' || request.status.value === 'error') {
      clearOptimisticTurn()
    }

    if (request.status.value === 'ready') {
      clearPendingEditRollback()
    }
  })

  function sendMessage(content: string, _data?: StructuredData): void {
    if (!content.trim()) return
    clearFailureState()
    resendMessage(content)
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
    resendMessage(currentRetryContext.userContent)
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
