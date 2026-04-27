/**
 * Stage 6 unit test coverage:
 *   6.7 createRootBootstrapState fallback chatKit behavior
 */
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { computed } from 'vue'
import {
  assert,
  createMemoryStorage,
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

const { createRootBootstrapState } = await jiti.import('../../src/entry/createRootBootstrapState.ts')

function makeBootstrap(config = {}) {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      transport: { type: 'openai-compatible', endpoint: '/api/chat' },
    },
    ...config,
  })

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => ui),
  )

  return { runtime, ui, bootstrap }
}

// ---------------------------------------------------------------------------
// 6.7  fallback chatKit — sendMessage proxies to runtime.sender.send
// ---------------------------------------------------------------------------

await runTest('createRootBootstrapState fallback chatKit.sendMessage proxies to runtime.sender.send', async () => {
  const sent = []
  const { bootstrap } = makeBootstrap()

  // Patch sender.send to capture calls
  const chatKit = bootstrap.chatKit.value
  const originalSend = chatKit.sendMessage.bind(chatKit)
  let captured = null

  // We verify by actually sending and checking conversation state
  // (the fallback chatKit.sendMessage calls runtime.sender.send({ text }))
  const { runtime } = makeBootstrap()
  const bootstrapReal = createRootBootstrapState(
    computed(() => runtime),
    computed(() => undefined),
  )

  const calls = []
  const originalSenderSend = runtime.sender.send.bind(runtime.sender)
  runtime.sender.send = async (input) => {
    calls.push(input)
    return originalSenderSend(input)
  }

  bootstrapReal.chatKit.value.sendMessage('proxy-test')

  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.text, 'proxy-test')
})

await runTest('createRootBootstrapState fallback chatKit.retry proxies to runtime.conversation.retry', async () => {
  const retryCalls = []
  const { runtime } = makeBootstrap()

  const originalRetry = runtime.conversation.retry.bind(runtime.conversation)
  runtime.conversation.retry = async (...args) => {
    retryCalls.push(args)
    return originalRetry(...args)
  }

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => undefined),
  )

  await bootstrap.chatKit.value.retry()
  assert.equal(retryCalls.length, 1)
})

await runTest('createRootBootstrapState fallback chatKit.regenerate proxies to runtime.conversation.regenerate', async () => {
  const regenerateCalls = []
  const { runtime } = makeBootstrap()

  const originalRegenerate = runtime.conversation.regenerate.bind(runtime.conversation)
  runtime.conversation.regenerate = async (...args) => {
    regenerateCalls.push(args)
    return originalRegenerate(...args)
  }

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => undefined),
  )

  await bootstrap.chatKit.value.regenerate()
  assert.equal(regenerateCalls.length, 1)
})

await runTest('createRootBootstrapState fallback chatKit.startEditMessage proxies to runtime.message.startEdit', async () => {
  const startEditCalls = []
  const { runtime } = makeBootstrap()

  // We need at least one message to edit
  const { runtime: runtimeWithMsg } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      transport: { type: 'openai-compatible', endpoint: '/api/chat' },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'edit-me' }],
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 10))

  const originalStartEdit = runtimeWithMsg.message.startEdit.bind(runtimeWithMsg.message)
  runtimeWithMsg.message.startEdit = (...args) => {
    startEditCalls.push(args)
    return originalStartEdit(...args)
  }

  const bootstrap = createRootBootstrapState(
    computed(() => runtimeWithMsg),
    computed(() => undefined),
  )

  bootstrap.chatKit.value.startEditMessage(0)
  assert.equal(startEditCalls.length, 1)
})

await runTest('createRootBootstrapState fallback chatKit.cancelEditMessage proxies to runtime.message.cancelEdit', async () => {
  const cancelEditCalls = []
  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      transport: { type: 'openai-compatible', endpoint: '/api/chat' },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'cancel-edit-me' }],
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 10))

  const originalCancelEdit = runtime.message.cancelEdit.bind(runtime.message)
  runtime.message.cancelEdit = (...args) => {
    cancelEditCalls.push(args)
    return originalCancelEdit(...args)
  }

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => undefined),
  )

  bootstrap.chatKit.value.cancelEditMessage(0)
  assert.equal(cancelEditCalls.length, 1)
})
