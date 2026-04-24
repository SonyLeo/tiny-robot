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

const chatConversationModule = await jiti.import('../src/runtime/chat-kit/useChatConversation.ts')
const chatMessagesModule = await jiti.import('../src/runtime/chat-kit/useChatMessages.ts')
const chatRequestModule = await jiti.import('../src/runtime/chat-kit/useChatRequest.ts')
const chatAttachmentsModule = await jiti.import('../src/components/attachments/useChatAttachments.ts')
const chatKitModule = await jiti.import('../src/runtime/chat-kit/useChatKit.ts')
const chatFeedbackModule = await jiti.import('../src/components/feedback/useChatFeedback.ts')
const chatRenderMessagesModule = await jiti.import('../src/runtime/chat-kit/chatRenderMessages.ts')
const mcpManagerModule = await jiti.import('../src/components/mcp/useMcpManager.ts')
const modelSelectorModule = await jiti.import('../src/components/model-selector/useModelSelector.ts')
const adapterModule = await jiti.import('../src/runtime/config/index.ts')
const transportModule = await jiti.import('../src/runtime/config/openaiCompatibleTransport.ts')
const messagesModule = await jiti.import('../src/shared/messages/index.ts')
const providerChatKitModule = await jiti.import('../src/runtime/provider/resolveProviderChatKit.ts')
const messageIdentityModule = await jiti.import('../src/runtime/core/messageIdentity.ts')

export { assert, computed, nextTick, ref, shallowRef }

export const useChatConversation = chatConversationModule.useChatConversation
export const useChatMessages = chatMessagesModule.useChatMessages
export const useChatRequest = chatRequestModule.useChatRequest
export const useChatAttachments = chatAttachmentsModule.useChatAttachments
export const useChatKit = chatKitModule.useChatKit
export const useChatFeedback = chatFeedbackModule.useChatFeedback
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
export const getProviderChatKitResolution = providerChatKitModule.getProviderChatKitResolution
export const resolveProviderChatKit = providerChatKitModule.resolveProviderChatKit
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

