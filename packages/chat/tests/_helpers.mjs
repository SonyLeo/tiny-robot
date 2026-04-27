import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { computed, nextTick, ref, shallowRef } from 'vue'
import createJiti from 'jiti'
import { expectThrowsAsync, runTest, resolveTestDir } from './_harness.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../src', import.meta.url)),
    '@opentiny/tiny-robot-svgs': fileURLToPath(new URL('../../svgs/dist/tiny-robot-svgs.js', import.meta.url)),
  },
})

const chatConversationModule = await jiti.import('../src/runtime/engine/useChatConversation.ts')
const chatMessagesModule = await jiti.import('../src/runtime/engine/useChatMessages.ts')
const chatRequestModule = await jiti.import('../src/runtime/engine/useChatRequest.ts')
const chatAttachmentsModule = await jiti.import('../src/components/attachments/useChatAttachments.ts')
const chatKitModule = await jiti.import('../src/runtime/engine/useChatKit.ts')
const chatFeedbackModule = await jiti.import('../src/components/feedback/useChatFeedback.ts')
const chatRenderMessagesModule = await jiti.import('../src/runtime/engine/chatRenderMessages.ts')
const mcpManagerModule = await jiti.import('../src/components/mcp/useMcpManager.ts')
const modelSelectorModule = await jiti.import('../src/components/model-selector/useModelSelector.ts')
const adapterModule = await jiti.import('../src/runtime/config/index.ts')
const transportModule = await jiti.import('../src/runtime/transport/openaiCompatibleTransport.ts')
const messagesModule = await jiti.import('../src/shared/messages/index.ts')
const providerRuntimeModule = await jiti.import('../src/runtime/config/resolveProviderRuntime.ts')
const messageIdentityModule = await jiti.import('../src/runtime/core/messageIdentity.ts')

export { assert, computed, nextTick, ref, shallowRef }

export const useChatConversation = chatConversationModule.useChatConversation
export const useChatMessages = chatMessagesModule.useChatMessages
export const useChatRequest = chatRequestModule.useChatRequest
export const useChatAttachments = chatAttachmentsModule.useChatAttachments
export const useChatKit = chatKitModule.useChatKit
export const useChatFeedback = chatFeedbackModule.useChatFeedback
export const useChatFeedbackWithFallbackRuntime = chatFeedbackModule.useChatFeedbackWithFallbackRuntime
export const useRuntimeFeedbackEnabled = chatFeedbackModule.useRuntimeFeedbackEnabled
export const normalizeChatRenderMessages = chatRenderMessagesModule.normalizeChatRenderMessages
export const getChatRenderSourceMessage = chatRenderMessagesModule.getChatRenderSourceMessage
export const getChatRenderMessageIndex = chatRenderMessagesModule.getChatRenderMessageIndex
export const unwrapChatRenderMessages = chatRenderMessagesModule.unwrapChatRenderMessages
export const useMcpManager = mcpManagerModule.useMcpManager
export const useModelSelector = modelSelectorModule.useModelSelector

export const createRuntimeFromConfig = adapterModule.createRuntimeFromConfig
export const resolveChatFeatures = adapterModule.resolveChatFeatures

export const CHAT_MESSAGES = messagesModule.CHAT_MESSAGES
export const resolveChatMessages = messagesModule.resolveChatMessages
export const getProviderRuntimeResolution = providerRuntimeModule.getProviderRuntimeResolution
export const resolveProviderRuntime = providerRuntimeModule.resolveProviderRuntime
export const getRuntimeMessageId = messageIdentityModule.getRuntimeMessageId
export const ensureRuntimeMessageId = messageIdentityModule.ensureRuntimeMessageId
export const ChatProviderError = transportModule.ChatProviderError
export const createOpenAICompatibleResponseProvider = transportModule.createOpenAICompatibleResponseProvider
export { expectThrowsAsync, runTest, resolveTestDir }

export function createChunk({ content, role, finishReason = null, model = 'mock-model' }) {
  return {
    id: `mock-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role,
          content,
        },
        logprobs: null,
        finish_reason: finishReason,
      },
    ],
  }
}

export function createStreamingProvider({ initialDelay = 0 } = {}) {
  return async function* responseProvider(requestBody) {
    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

    if (lastMessage === 'boom') {
      throw new Error('boom')
    }

    const reply = `reply:${lastMessage}`

    if (initialDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay))
    }

    let isFirstChunk = true
    for (const char of reply) {
      yield createChunk({
        content: char,
        role: isFirstChunk ? 'assistant' : undefined,
      })
      isFirstChunk = false
    }

    yield createChunk({
      content: undefined,
      role: undefined,
      finishReason: 'stop',
    })
  }
}

export function createRetryableProvider({
  failMessage = 'err',
  failOnce = false,
  errorMessage = 'Mock API Error: provider execution failed',
} = {}) {
  const failureCount = new Map()

  return async function* responseProvider(requestBody) {
    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

    if (lastMessage === failMessage) {
      const currentFailureCount = failureCount.get(lastMessage) ?? 0
      failureCount.set(lastMessage, currentFailureCount + 1)

      if (!failOnce || currentFailureCount === 0) {
        throw new Error(errorMessage)
      }
    }

    yield* createStreamingProvider()(requestBody)
  }
}

export function createMemoryStorage() {
  const conversations = []
  const messageMap = new Map()

  return {
    saveConversation(conversation) {
      const index = conversations.findIndex((item) => item.id === conversation.id)
      const record = { ...conversation }

      if (index === -1) {
        conversations.unshift(record)
      } else {
        conversations[index] = record
      }
    },
    loadConversations() {
      return conversations.map((conversation) => ({ ...conversation }))
    },
    saveMessages(conversationId, messages) {
      messageMap.set(
        conversationId,
        messages.map((message) => ({
          ...message,
          state: message.state ? { ...message.state } : message.state,
          metadata: message.metadata ? { ...message.metadata } : message.metadata,
        })),
      )
    },
    loadMessages(conversationId) {
      return messageMap.get(conversationId)?.map((message) => ({ ...message })) ?? []
    },
    deleteConversation(conversationId) {
      const index = conversations.findIndex((item) => item.id === conversationId)
      if (index !== -1) {
        conversations.splice(index, 1)
      }
      messageMap.delete(conversationId)
    },
  }
}

export async function waitFor(assertion, { timeout = 1500, interval = 20 } = {}) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeout) {
    try {
      const result = assertion()
      await nextTick()
      return result
    } catch {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  return assertion()
}


/**
 * Creates a mock fetch that simulates an OpenAI-compatible SSE streaming endpoint.
 *
 * Returns { fetch, requests, restore } where:
 * - fetch: the mock function (also installed on globalThis.fetch)
 * - requests: array collecting every parsed request body
 * - restore: call this in `finally` to restore the original fetch
 *
 * Options:
 * - handler(requestBody): optional custom handler; return a Response to override
 *   the default streaming behavior. If it returns undefined the default SSE
 *   reply is used.
 */
export function createMockFetch({ handler } = {}) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const requests = []
  const encoder = new TextEncoder()

  const mockFetch = async (_input, init) => {
    const requestBody = JSON.parse(String(init?.body ?? '{}'))
    requests.push(requestBody)

    if (handler) {
      const custom = await handler(requestBody)
      if (custom) return custom
    }

    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''
    const reply = `reply:${lastMessage}`
    const chunks = [
      `data: ${JSON.stringify({
        id: `mock-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: 0,
        model: requestBody.model ?? 'mock-model',
        choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
      })}\n\n`,
      `data: ${JSON.stringify({
        id: `mock-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: 0,
        model: requestBody.model ?? 'mock-model',
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      })}\n\n`,
      'data: [DONE]\n\n',
    ]

    return new Response(
      new ReadableStream({
        start(controller) {
          chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
          controller.close()
        },
      }),
      { status: 200, headers: { 'content-type': 'text/event-stream' } },
    )
  }

  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: mockFetch })

  function restore() {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }

  return { fetch: mockFetch, requests, restore }
}

/**
 * Creates a mock runtime object suitable for useChatFeedback and similar
 * consumers that expect { conversation, sender, message } sub-runtimes.
 *
 * Every method is a no-op by default. Pass partial overrides to customise
 * individual sub-runtimes or methods.
 */
export function createMockRuntime(overrides = {}) {
  const { conversation = {}, sender = {}, message = {} } = overrides

  return {
    conversation: {
      messages: { value: [] },
      status: { value: 'ready' },
      send: () => undefined,
      abort: () => undefined,
      retry: async () => true,
      regenerate: async () => true,
      ...conversation,
    },
    sender: {
      draft: { value: '' },
      pendingAttachments: { value: [] },
      canSend: { value: true },
      setDraft: () => undefined,
      send: () => undefined,
      addPendingAttachments: () => undefined,
      setPendingAttachments: () => undefined,
      removePendingAttachment: () => undefined,
      clearPendingAttachments: () => undefined,
      ...sender,
    },
    message: {
      getViewState: () => ({ status: 'done', editing: false, optimistic: false }),
      getActions: () => [],
      startEdit: () => undefined,
      cancelEdit: () => undefined,
      commitEdit: () => true,
      copy: async () => undefined,
      ...message,
    },
  }
}

/**
 * Installs a mock navigator.clipboard on globalThis and returns
 * { copied, restore } where `copied` is an array collecting every
 * writeText call.
 */
export function createMockClipboard() {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const copied = []

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (value) => {
          copied.push(value)
        },
      },
    },
  })

  function restore() {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'navigator', originalDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'navigator')
    }
  }

  return { copied, restore }
}
