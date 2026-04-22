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

await runTest('resolveRootPageBlackboxConfig keeps lifecycle-compatible callbacks on the Root + Page path', async () => {
  const onFinish = () => undefined
  const onError = () => undefined

  const resolved = resolveRootPageBlackboxConfig({
    config: createTargetConfig(),
    callbacks: {
      onFinish,
      onError,
    },
  })

  assert.notEqual(resolved, null)
  assert.equal(typeof resolved?.lifecycle?.afterReceive, 'function')
  assert.equal(typeof resolved?.lifecycle?.error, 'function')
})

await runTest('resolveRootPageBlackboxConfig composes config lifecycle hooks with compatibility callbacks without mutating the input config', async () => {
  const events = []
  const originalAfterReceive = (message) => {
    events.push(`config-after:${message.content}`)
  }
  const originalError = (error) => {
    events.push(`config-error:${error.message}`)
  }
  const config = {
    ...createTargetConfig(),
    lifecycle: {
      afterReceive: originalAfterReceive,
      error: originalError,
    },
  }
  const callbacks = {
    onFinish: (message) => {
      events.push(`callback-finish:${message.content}`)
    },
    onError: (error) => {
      events.push(`callback-error:${error.message}`)
    },
  }

  const resolved = resolveRootPageBlackboxConfig({
    config,
    callbacks,
  })

  assert.notEqual(resolved, null)
  assert.notEqual(resolved, config)
  assert.equal(config.lifecycle.afterReceive, originalAfterReceive)
  assert.equal(config.lifecycle.error, originalError)

  resolved.lifecycle.afterReceive({ role: 'assistant', content: 'reply:blackbox' })
  resolved.lifecycle.error(new Error('blackbox-boom'))

  assert.deepEqual(events, [
    'config-after:reply:blackbox',
    'callback-finish:reply:blackbox',
    'config-error:blackbox-boom',
    'callback-error:blackbox-boom',
  ])
})

await runTest('resolveRootPageBlackboxConfig keeps unsupported compatibility callbacks and other legacy entry props on the scaffold fallback', async () => {
  const config = createTargetConfig()

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onBeforeSend: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onMessageAction: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onModelChange: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      runtime: {
        selectedModel: 'gpt-4.1-mini',
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      presetOverrides: {},
    }),
    null,
  )
})
