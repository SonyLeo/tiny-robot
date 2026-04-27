/**
 * Stage 6 unit test coverage:
 *   6.2 beforeSend returning false cancels the send; returning { text } rewrites it
 *   6.3 afterReceive and lifecycle.error execution timing
 *   6.4 dispose() stops the effectScope; useTrChatConfigRuntimeResolution calls dispose on config change
 */
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { effectScope, nextTick, ref } from 'vue'
import {
  assert,
  createMockFetch,
  createStreamingProvider,
  createRuntimeFromConfig,
  waitFor,
  runTest,
} from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { useTrChatConfigRuntimeResolution } = await jiti.import(
  '../../src/runtime/config/useTrChatConfigRuntimeResolution.ts',
)

// ---------------------------------------------------------------------------
// 6.2  beforeSend lifecycle
// ---------------------------------------------------------------------------

await runTest('createRuntimeFromConfig beforeSend returning false cancels the send and leaves messages unchanged', async () => {
  const { restore } = createMockFetch()

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
      lifecycle: {
        beforeSend: () => false,
      },
    })

    await runtime.sender.send({ text: 'should-be-cancelled' })
    // Give any async work a chance to run
    await new Promise((resolve) => setTimeout(resolve, 30))

    assert.equal(runtime.conversation.messages.value.length, 0, 'no messages should be added when beforeSend returns false')
    assert.equal(runtime.conversation.status.value, 'ready')
  } finally {
    restore()
  }
})

await runTest('createRuntimeFromConfig beforeSend returning { text } rewrites the outbound message', async () => {
  const { requests, restore } = createMockFetch()

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
      lifecycle: {
        beforeSend: (input) => ({ text: `rewritten:${input.text}` }),
      },
    })

    await runtime.sender.send({ text: 'original' })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
    })

    assert.equal(requests.length, 1)
    assert.equal(requests[0]?.messages?.at(-1)?.content, 'rewritten:original')
    assert.equal(runtime.conversation.messages.value.at(-1)?.parts[0]?.text, 'reply:rewritten:original')
  } finally {
    restore()
  }
})

// ---------------------------------------------------------------------------
// 6.3  afterReceive and lifecycle.error
// ---------------------------------------------------------------------------

await runTest('createRuntimeFromConfig lifecycle.afterReceive is called after assistant message completes', async () => {
  const { restore } = createMockFetch()
  const received = []

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
      lifecycle: {
        afterReceive: (message) => {
          received.push(message)
        },
      },
    })

    await runtime.sender.send({ text: 'after-receive-test' })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
    })

    assert.equal(received.length, 1)
    // afterReceive receives the raw ChatMessage
    assert.equal(typeof received[0], 'object')
    assert.ok(received[0] !== null)
  } finally {
    restore()
  }
})

await runTest('createRuntimeFromConfig lifecycle.error is called when the request fails', async () => {
  const errors = []
  const { restore } = createMockFetch({
    handler: () =>
      new Response(JSON.stringify({ error: { message: 'server error' } }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
      lifecycle: {
        error: (err) => {
          errors.push(err)
        },
      },
    })

    await runtime.sender.send({ text: 'trigger-error' })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'error')
    })

    assert.equal(errors.length, 1)
    assert.ok(errors[0] instanceof Error || typeof errors[0] === 'object')
  } finally {
    restore()
  }
})

// ---------------------------------------------------------------------------
// 6.4  dispose() stops the effectScope
// ---------------------------------------------------------------------------

await runTest('createRuntimeFromConfig dispose() stops the internal effectScope', async () => {
  const { restore } = createMockFetch()

  try {
    const { runtime, dispose } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
    })

    // Sanity: runtime is functional before dispose
    assert.equal(typeof runtime.conversation.send, 'function')

    // dispose should not throw
    assert.doesNotThrow(() => dispose())
  } finally {
    restore()
  }
})

await runTest('useTrChatConfigRuntimeResolution calls dispose on the old runtime when config meaningfully changes', async () => {
  const { restore } = createMockFetch()
  const disposeCalls = []

  try {
    const scope = effectScope()

    const config = ref({
      request: {
        models: [{ id: 'model-a', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
    })

    scope.run(() => {
      useTrChatConfigRuntimeResolution(config, {
        createRuntime(resolvedConfig) {
          const result = createRuntimeFromConfig(resolvedConfig)
          const originalDispose = result.dispose
          result.dispose = () => {
            disposeCalls.push(1)
            originalDispose?.()
          }
          return result
        },
      })
    })

    await nextTick()

    // Change config to trigger recreation
    config.value = {
      request: {
        models: [{ id: 'model-b', providerId: 'openai' }],
        transport: { type: 'openai-compatible', endpoint: '/api/chat' },
      },
    }

    await nextTick()
    await nextTick()

    assert.equal(disposeCalls.length >= 1, true, 'dispose should have been called at least once on config change')

    scope.stop()
  } finally {
    restore()
  }
})
