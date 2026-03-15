import { computed, shallowRef, watchEffect } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatErrorInfo, ChatStatus, ResponseProvider, UseMessageResponseProvider } from '../types'

interface UseChatRequestOptions {
  conversation: Pick<UseConversationReturn, 'activeConversation' | 'abortActiveRequest'>
  responseProviderRef: ShallowRef<UseMessageResponseProvider>
}

function extractStatusCode(message: string): number | undefined {
  const matched = message.match(/\b(401|403|408|429|5\d{2})\b/)
  return matched ? Number(matched[1]) : undefined
}

function normalizeChatError(error: unknown): ChatErrorInfo {
  const normalizedError = error instanceof Error ? error : new Error(String(error))
  const message = normalizedError.message || 'Unknown error'
  const statusCode = extractStatusCode(message)
  const lowerCasedMessage = message.toLowerCase()

  if (statusCode === 401 || statusCode === 403 || lowerCasedMessage.includes('api key')) {
    return {
      type: 'auth',
      message,
      retryable: false,
      statusCode,
      originalError: error,
    }
  }

  if (statusCode === 429 || lowerCasedMessage.includes('rate limit')) {
    return {
      type: 'rate_limit',
      message,
      retryable: true,
      statusCode,
      originalError: error,
    }
  }

  if (statusCode && statusCode >= 500) {
    return {
      type: 'server',
      message,
      retryable: true,
      statusCode,
      originalError: error,
    }
  }

  if (lowerCasedMessage.includes('timeout') || lowerCasedMessage.includes('econnaborted')) {
    return {
      type: 'timeout',
      message,
      retryable: true,
      statusCode,
      originalError: error,
    }
  }

  if (
    lowerCasedMessage.includes('failed to fetch') ||
    lowerCasedMessage.includes('network') ||
    lowerCasedMessage.includes('fetch')
  ) {
    return {
      type: 'network',
      message,
      retryable: true,
      statusCode,
      originalError: error,
    }
  }

  if (lowerCasedMessage.includes('provider')) {
    return {
      type: 'provider',
      message,
      retryable: true,
      statusCode,
      originalError: error,
    }
  }

  return {
    type: 'unknown',
    message,
    retryable: true,
    statusCode,
    originalError: error,
  }
}

export function useChatRequest(options: UseChatRequestOptions) {
  const lastError = shallowRef<ChatErrorInfo | null>(null)

  const status = computed<ChatStatus>(() => {
    const engine = options.conversation.activeConversation.value?.engine
    if (!engine) return 'ready'

    const requestState = engine.requestState.value
    const processingState = engine.processingState.value

    if (requestState === 'error') return 'error'
    if (requestState === 'processing') {
      return processingState === 'completing' ? 'streaming' : 'submitted'
    }

    return 'ready'
  })

  function updateResponseProvider(provider: ResponseProvider): void {
    options.responseProviderRef.value = provider as UseMessageResponseProvider
  }

  function captureError(error: unknown): ChatErrorInfo {
    const normalizedError = normalizeChatError(error)
    lastError.value = normalizedError
    return normalizedError
  }

  function clearLastError(): void {
    lastError.value = null
  }

  watchEffect(() => {
    const engine = options.conversation.activeConversation.value?.engine
    if (engine) {
      engine.responseProvider.value = options.responseProviderRef.value
    }
  })

  async function abort(): Promise<void> {
    await options.conversation.abortActiveRequest()
  }

  return {
    status,
    lastError: computed(() => lastError.value) as ComputedRef<ChatErrorInfo | null>,
    updateResponseProvider,
    captureError,
    clearLastError,
    abort,
  }
}
