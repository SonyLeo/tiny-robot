import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { computed, nextTick, ref, shallowRef } from 'vue'
import createJiti from 'jiti'
import { expectThrowsAsync, runTest } from './_harness.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../src', import.meta.url)),
    '@opentiny/tiny-robot-svgs': fileURLToPath(new URL('../../svgs/dist/tiny-robot-svgs.js', import.meta.url)),
  },
})

const chatConversationModule = await jiti.import('../src/composables/useChatConversation.ts')
const chatMessagesModule = await jiti.import('../src/composables/useChatMessages.ts')
const chatRequestModule = await jiti.import('../src/composables/useChatRequest.ts')
const chatAttachmentsModule = await jiti.import('../src/composables/useChatAttachments.ts')
const chatKitModule = await jiti.import('../src/composables/useChatKit.ts')
const mcpManagerModule = await jiti.import('../src/composables/useMcpManager.ts')
const modelSelectorModule = await jiti.import('../src/composables/useModelSelector.ts')
const adapterModule = await jiti.import('../src/adapters/index.ts')
const transportModule = await jiti.import('../src/adapters/openaiCompatibleTransport.ts')
const presetsModule = await jiti.import('../src/presets/index.ts')
const messagesModule = await jiti.import('../src/messages.ts')
const capabilitiesModule = await jiti.import('../src/capabilities.ts')
const rootChatKitModule = await jiti.import('../src/helpers/resolveRootChatKit.ts')

export { assert, computed, nextTick, ref, shallowRef }

export const useChatConversation = chatConversationModule.useChatConversation
export const useChatMessages = chatMessagesModule.useChatMessages
export const useChatRequest = chatRequestModule.useChatRequest
export const useChatAttachments = chatAttachmentsModule.useChatAttachments
export const useChatKit = chatKitModule.useChatKit
export const useMcpManager = mcpManagerModule.useMcpManager
export const useModelSelector = modelSelectorModule.useModelSelector

export const loadChatConfig = adapterModule.loadChatConfig
export const createChatAdapterFromConfig = adapterModule.createChatAdapterFromConfig
export const createChatCliCapabilitySurface = adapterModule.createChatCliCapabilitySurface
export const createPresetChatProps = adapterModule.createPresetChatProps
export const createPresetChatSlices = adapterModule.createPresetChatSlices
export const CHAT_CLI_CONSUMABLE_FEATURE_KEYS = adapterModule.CHAT_CLI_CONSUMABLE_FEATURE_KEYS
export const CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS = adapterModule.CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS
export const CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS = adapterModule.CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS
export const resolveChatFeatures = adapterModule.resolveChatFeatures
export const resolveAgentPreset = presetsModule.resolveAgentPreset
export const createChatAdapterFromAgentPreset = presetsModule.createChatAdapterFromAgentPreset
export const createPresetConsumptionFromAgentPreset = presetsModule.createPresetConsumptionFromAgentPreset
export const BUILT_IN_AGENT_PRESETS = presetsModule.BUILT_IN_AGENT_PRESETS
export const BUILT_IN_SKILL_PACKS = presetsModule.BUILT_IN_SKILL_PACKS
export const getBuiltInAgentPreset = presetsModule.getBuiltInAgentPreset
export const getBuiltInSkillPack = presetsModule.getBuiltInSkillPack

export const CHAT_MESSAGES = messagesModule.CHAT_MESSAGES
export const resolveChatMessages = messagesModule.resolveChatMessages
export const createChatCapabilityManifest = capabilitiesModule.createChatCapabilityManifest
export const CHAT_CAPABILITY_MANIFEST = capabilitiesModule.CHAT_CAPABILITY_MANIFEST
export const getRootChatKitResolution = rootChatKitModule.getRootChatKitResolution
export const resolveRootChatKit = rootChatKitModule.resolveRootChatKit
export const ChatProviderError = transportModule.ChatProviderError
export const createOpenAICompatibleResponseProvider = transportModule.createOpenAICompatibleResponseProvider
export { expectThrowsAsync, runTest }

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

