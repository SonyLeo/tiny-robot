import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { resolveRootPageBlackboxConfig } = await jiti.import('@/runtime/config/blackboxEntry.ts')

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
  }
}

function createLegacyConfig() {
  return {
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    defaults: {
      model: 'gpt-4.1-mini',
      systemPrompt: 'legacy-default-system',
    },
    ui: {
      brand: {
        title: 'Legacy Brand',
      },
    },
  }
}

await runTest('resolveRootPageBlackboxConfig accepts a serialized target TrChatConfig without reopening legacy config projection', async () => {
  const resolved = resolveRootPageBlackboxConfig(JSON.stringify(createTargetConfig()))

  assert.notEqual(resolved, null)
  assert.equal(resolved?.request.models[0]?.id, 'gpt-4.1-mini')
  assert.equal(resolved?.request.transport.endpoint, '/api/chat/completions')
})

await runTest('resolveRootPageBlackboxConfig keeps target TrChatConfig lifecycle untouched', async () => {
  const config = {
    ...createTargetConfig(),
    lifecycle: {
      afterReceive: () => undefined,
      error: () => undefined,
    },
  }

  const resolved = resolveRootPageBlackboxConfig(config)

  assert.equal(resolved, config)
})

await runTest('resolveRootPageBlackboxConfig keeps legacy ChatConfig objects on the scaffold fallback path', async () => {
  assert.equal(resolveRootPageBlackboxConfig(createLegacyConfig()), null)
  assert.equal(resolveRootPageBlackboxConfig(JSON.stringify(createLegacyConfig())), null)
})

await runTest('resolveRootPageBlackboxConfig rejects non-target inputs now that scaffold helper fallback is retired from the blackbox contract', async () => {
  assert.equal(resolveRootPageBlackboxConfig('{"legacy":true}'), null)
  assert.equal(resolveRootPageBlackboxConfig({ runtime: true }), null)
})
