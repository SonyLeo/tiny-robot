import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import {
  assert,
  createMemoryStorage,
  createMockClipboard,
  createRetryableProvider,
  createStreamingProvider,
  ensureRuntimeMessageId,
  getRuntimeMessageId,
  runTest,
  useChatKit,
  waitFor,
} from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createMessageRuntimeFromChatKit } = await jiti.import('../../src/runtime/config/createRuntimeFromConfig.ts')

await runTest('useChatKit preserves source user messageId across edit, retry, and regenerate flows', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('seed')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:seed')
  })

  const originalEditedUserId = ensureRuntimeMessageId(chatKit.messages.value[0])
  const originalEditedAssistantId = ensureRuntimeMessageId(chatKit.messages.value[1])

  chatKit.editMessage(0, 'edited-seed')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[0]?.content, 'edited-seed')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:edited-seed')
  })

  assert.equal(getRuntimeMessageId(chatKit.messages.value[0]), originalEditedUserId)
  assert.notEqual(getRuntimeMessageId(chatKit.messages.value[1]), originalEditedAssistantId)

  chatKit.updateResponseProvider(
    createRetryableProvider({
      failMessage: 'err',
      failOnce: true,
    }),
  )
  chatKit.sendMessage('err')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
    assert.equal(chatKit.messages.value[3]?.role, 'assistant')
  })

  const retryUserId = ensureRuntimeMessageId(chatKit.messages.value[2])
  const failedAssistantId = ensureRuntimeMessageId(chatKit.messages.value[3])

  assert.equal(await chatKit.retry(), true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[2]?.content, 'err')
    assert.equal(chatKit.messages.value[3]?.content, 'reply:err')
  })

  assert.equal(getRuntimeMessageId(chatKit.messages.value[2]), retryUserId)
  assert.notEqual(getRuntimeMessageId(chatKit.messages.value[3]), failedAssistantId)

  chatKit.updateResponseProvider(createStreamingProvider())
  chatKit.sendMessage('regen')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[5]?.content, 'reply:regen')
  })

  const regenerateUserId = ensureRuntimeMessageId(chatKit.messages.value[4])
  const regenerateAssistantId = ensureRuntimeMessageId(chatKit.messages.value[5])

  assert.equal(await chatKit.regenerate(5), true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[4]?.content, 'regen')
    assert.equal(chatKit.messages.value[5]?.content, 'reply:regen')
  })

  assert.equal(getRuntimeMessageId(chatKit.messages.value[4]), regenerateUserId)
  assert.notEqual(getRuntimeMessageId(chatKit.messages.value[5]), regenerateAssistantId)
})

await runTest('createMessageRuntimeFromChatKit exposes canonical view-state and copy/edit flows by messageId', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider({ initialDelay: 80 }),
    storage: createMemoryStorage(),
  })
  const messageRuntime = createMessageRuntimeFromChatKit(chatKit, {
    messages: {
      feedback: {
        enabled: true,
      },
    },
  })

  const { copied, restore: restoreClipboard } = createMockClipboard()

  try {
    chatKit.sendMessage('hello')

    await waitFor(() => {
      const userId = ensureRuntimeMessageId(chatKit.messages.value[0])
      const assistantId = ensureRuntimeMessageId(chatKit.messages.value[1])

      assert.equal(messageRuntime.getViewState(userId)?.status, 'pending')
      assert.equal(messageRuntime.getViewState(userId)?.optimistic, true)
      assert.equal(messageRuntime.getViewState(assistantId)?.status, 'streaming')
    })

    await waitFor(() => {
      assert.equal(chatKit.status.value, 'ready')
      assert.equal(chatKit.messages.value[1]?.content, 'reply:hello')
    })

    const userId = ensureRuntimeMessageId(chatKit.messages.value[0])
    const assistantId = ensureRuntimeMessageId(chatKit.messages.value[1])

    messageRuntime.startEdit(userId)
    assert.equal(messageRuntime.getViewState(userId)?.editing, true)

    messageRuntime.cancelEdit(userId)
    assert.equal(messageRuntime.getViewState(userId)?.editing, false)

    await messageRuntime.copy(assistantId)
    assert.deepEqual(copied, ['reply:hello'])

    chatKit.updateResponseProvider(
      createRetryableProvider({
        failMessage: 'boom',
        errorMessage: 'Mock API Error: provider execution failed',
      }),
    )
    chatKit.sendMessage('boom')

    await waitFor(() => {
      assert.equal(chatKit.status.value, 'error')
      const failedAssistantId = ensureRuntimeMessageId(chatKit.messages.value[3])
      const viewState = messageRuntime.getViewState(failedAssistantId)

      assert.equal(viewState?.status, 'error')
      assert.equal(viewState?.capabilities?.retryable, true)
      assert.equal(viewState?.capabilities?.feedbackable, true)
    })
  } finally {
    restoreClipboard()
  }
})
