import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { resolveTrChatConfigEntry, resolveTrChatConfigEntryInput } = await jiti.import(
  '@/runtime/config/trchatConfigEntry.ts',
)

function createTargetConfig() {
  return {
    request: {
      models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    lifecycle: {
      afterReceive: ({ message }) => message,
    },
    conversation: {
      initialMessages: [{ role: 'assistant', content: 'target baseline' }],
    },
  }
}

function createLegacyConfig() {
  return {
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
  }
}

function createSerializableTargetConfig() {
  return {
    request: {
      models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: [{ role: 'assistant', content: 'target baseline' }],
    },
  }
}

await runTest('resolveTrChatConfigEntry accepts a serialized target TrChatConfig without reopening legacy config projection', async () => {
  const resolved = resolveTrChatConfigEntry(JSON.stringify(createTargetConfig()))

  assert.equal(resolved?.request.defaultModelId, 'gpt-4.1-mini')
  assert.equal(resolved?.request.transport.type, 'openai-compatible')
  assert.deepEqual(resolved?.conversation?.initialMessages, createTargetConfig().conversation.initialMessages)
})

await runTest('resolveTrChatConfigEntry keeps target TrChatConfig lifecycle untouched', async () => {
  const config = createTargetConfig()
  const resolved = resolveTrChatConfigEntry(config)

  assert.equal(typeof resolved?.lifecycle?.afterReceive, 'function')
  assert.equal(resolved?.lifecycle?.afterReceive, config.lifecycle.afterReceive)
})

await runTest('resolveTrChatConfigEntryInput keeps a stable cache key across equivalent serialized target-config values', async () => {
  const serializedInput = JSON.stringify(createSerializableTargetConfig())
  const firstResolution = resolveTrChatConfigEntryInput(serializedInput)
  const secondResolution = resolveTrChatConfigEntryInput(serializedInput)

  assert.equal(firstResolution?.key, secondResolution?.key)
  assert.deepEqual(firstResolution?.config, secondResolution?.config)
})

await runTest('resolveTrChatConfigEntryInput preserves object-only lifecycle hooks without requiring serialized parity', async () => {
  const objectResolution = resolveTrChatConfigEntryInput(createTargetConfig())
  const serializedResolution = resolveTrChatConfigEntryInput(JSON.stringify(createSerializableTargetConfig()))

  assert.equal(typeof objectResolution?.config.lifecycle?.afterReceive, 'function')
  assert.deepEqual(objectResolution?.config.request, serializedResolution?.config.request)
  assert.deepEqual(objectResolution?.config.conversation, serializedResolution?.config.conversation)
})

await runTest('resolveTrChatConfigEntry keeps legacy ChatConfig objects on the scaffold fallback path', async () => {
  assert.equal(resolveTrChatConfigEntry(createLegacyConfig()), null)
  assert.equal(resolveTrChatConfigEntry(JSON.stringify(createLegacyConfig())), null)
})

await runTest('resolveTrChatConfigEntry rejects non-target inputs now that scaffold helper fallback is retired from the TrChat entry contract', async () => {
  assert.equal(resolveTrChatConfigEntry('{"legacy":true}'), null)
  assert.equal(resolveTrChatConfigEntry({ runtime: true }), null)
})
