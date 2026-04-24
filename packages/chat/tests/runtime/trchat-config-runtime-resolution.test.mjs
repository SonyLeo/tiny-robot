import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { assert, nextTick, ref, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { useTrChatConfigRuntimeResolution } = await jiti.import('@/runtime/config/useTrChatConfigRuntimeResolution.ts')

function createTargetConfig({ title = 'TrChat continuity', content = 'continuity-seed' } = {}) {
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
      initialMessages: [{ role: 'user', content }],
    },
    ui: {
      brand: {
        title,
      },
    },
  }
}

await runTest('useTrChatConfigRuntimeResolution keeps the current runtime when the target config is replaced with an equivalent value', async () => {
  const configRef = ref(createTargetConfig())
  const createdConfigs = []

  const runtimeResolution = useTrChatConfigRuntimeResolution(() => configRef.value, {
    createRuntime(config) {
      createdConfigs.push(config)
      return {
        runtime: { id: `runtime-${createdConfigs.length}` },
        ui: { brand: { title: config.ui?.brand?.title } },
      }
    },
  })

  const firstResolution = runtimeResolution.value
  configRef.value = createTargetConfig()

  await nextTick()

  assert.equal(createdConfigs.length, 1)
  assert.equal(runtimeResolution.value, firstResolution)
})

await runTest('useTrChatConfigRuntimeResolution recreates the runtime once the target config meaningfully changes', async () => {
  const configRef = ref(createTargetConfig())
  const createdConfigs = []

  const runtimeResolution = useTrChatConfigRuntimeResolution(() => configRef.value, {
    createRuntime(config) {
      createdConfigs.push(config)
      return {
        runtime: { id: `runtime-${createdConfigs.length}` },
        ui: { brand: { title: config.ui?.brand?.title } },
      }
    },
  })

  const firstResolution = runtimeResolution.value
  configRef.value = createTargetConfig({ title: 'Changed title' })

  await nextTick()

  assert.equal(createdConfigs.length, 2)
  assert.notEqual(runtimeResolution.value, firstResolution)
})
