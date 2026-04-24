import {
  assert,
  createMemoryStorage,
  createStreamingProvider,
  getProviderChatKitResolution,
  resolveProviderChatKit,
  runTest,
} from '../_helpers.mjs'

await runTest(
  'getProviderChatKitResolution derives useChatKit options from provider props when responseProvider is present',
  async () => {
    const responseProvider = createStreamingProvider()
    const onFinish = () => {}
    const onError = () => {}
    const messageTransforms = {
      onFinish: () => ({
        content: 'transformed',
      }),
    }
    const storage = createMemoryStorage()
    const initialMessages = [{ role: 'system', content: 'seed' }]

    const resolution = getProviderChatKitResolution('TrChatProvider', {
      responseProvider,
      storage,
      initialMessages,
      messageTransforms,
      onFinish,
      onError,
    })

    assert.equal(resolution.chatKitOptions?.responseProvider, responseProvider)
    assert.equal(resolution.chatKitOptions?.storage, storage)
    assert.equal(resolution.chatKitOptions?.messageTransforms, messageTransforms)
    assert.equal(resolution.chatKitOptions?.onFinish, onFinish)
    assert.equal(resolution.chatKitOptions?.onError, onError)
    assert.deepEqual(resolution.chatKitOptions?.initialMessages, initialMessages)
  },
)

await runTest('resolveProviderChatKit throws a component-scoped error when responseProvider is missing', async () => {
  assert.throws(
    () => resolveProviderChatKit('TrChatProvider', {}),
    /\[TrChatProvider\] responseProvider must be provided/,
  )
})

await runTest('resolveProviderChatKit delegates chatKit creation through the shared helper path', async () => {
  const responseProvider = createStreamingProvider()
  const storage = createMemoryStorage()
  const created = { kind: 'mock-chat-kit' }
  const receivedOptions = []

  const chatKit = resolveProviderChatKit(
    'TrChatProvider',
    {
      responseProvider,
      storage,
    },
    (options) => {
      receivedOptions.push(options)
      return created
    },
  )

  assert.equal(chatKit, created)
  assert.equal(receivedOptions.length, 1)
  assert.equal(receivedOptions[0].responseProvider, responseProvider)
  assert.equal(receivedOptions[0].storage, storage)
})
