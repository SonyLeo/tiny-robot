import { assert, createMemoryStorage, createRetryableProvider, createStreamingProvider, runTest, useChatKit, waitFor } from '../_helpers.mjs'

await runTest('useChatKit messageTransforms.onFinish can rewrite the final assistant message', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
    messageTransforms: {
      onFinish: ({ message }) => ({
        content: `transformed:${message.content}`,
        metadata: {
          transformed: true,
        },
      }),
    },
  })

  chatKit.sendMessage('transform-finish')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  assert.equal(chatKit.messages.value[1]?.content, 'transformed:reply:transform-finish')
  assert.equal(chatKit.messages.value[1]?.metadata?.transformed, true)
})

await runTest('useChatKit messageTransforms.onChunk can observe streaming chunks and annotate the current assistant message', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
    messageTransforms: {
      onChunk: ({ currentMessage }) => {
        currentMessage.metadata ??= {}
        const currentCount = typeof currentMessage.metadata.chunkCount === 'number' ? currentMessage.metadata.chunkCount : 0
        currentMessage.metadata.chunkCount = currentCount + 1
      },
    },
  })

  chatKit.sendMessage('transform-chunk')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  assert.equal(typeof chatKit.messages.value[1]?.metadata?.chunkCount, 'number')
  assert.equal(chatKit.messages.value[1]?.metadata?.chunkCount > 0, true)
})

await runTest('useChatKit messageTransforms stay compatible with retry flows', async () => {
  const chatKit = useChatKit({
    responseProvider: createRetryableProvider({
      failMessage: 'transform-retry',
      failOnce: true,
    }),
    storage: createMemoryStorage(),
    messageTransforms: {
      onFinish: ({ message }) => ({
        content: `transformed:${message.content}`,
      }),
    },
  })

  chatKit.sendMessage('transform-retry')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
  })

  assert.equal(await chatKit.retry(), true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  assert.equal(chatKit.messages.value[1]?.content, 'transformed:reply:transform-retry')
})

