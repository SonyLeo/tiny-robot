import {
  assert,
  createMemoryStorage,
  createStreamingProvider,
  getProviderRuntimeResolution,
  resolveProviderRuntime,
  runTest,
} from '../_helpers.mjs'

await runTest(
  'getProviderRuntimeResolution derives provider-facing runtime options from provider props when responseProvider is present',
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

    const resolution = getProviderRuntimeResolution('TrChatProvider', {
      responseProvider,
      storage,
      initialMessages,
      messageTransforms,
      onFinish,
      onError,
    })

    assert.equal(resolution.providerRuntimeOptions?.responseProvider, responseProvider)
    assert.equal(resolution.providerRuntimeOptions?.storage, storage)
    assert.equal(resolution.providerRuntimeOptions?.messageTransforms, messageTransforms)
    assert.equal(resolution.providerRuntimeOptions?.onFinish, onFinish)
    assert.equal(resolution.providerRuntimeOptions?.onError, onError)
    assert.deepEqual(resolution.providerRuntimeOptions?.initialMessages, initialMessages)
  },
)

await runTest('resolveProviderRuntime throws a component-scoped error when responseProvider is missing', async () => {
  assert.throws(
    () => resolveProviderRuntime('TrChatProvider', {}),
    /\[TrChatProvider\] responseProvider must be provided/,
  )
})

await runTest('resolveProviderRuntime delegates runtime creation through the shared helper path', async () => {
  const responseProvider = createStreamingProvider()
  const storage = createMemoryStorage()
  const created = { kind: 'mock-chat-kit' }
  const receivedOptions = []

  const providerRuntime = resolveProviderRuntime(
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

  assert.equal(providerRuntime, created)
  assert.equal(receivedOptions.length, 1)
  assert.equal(receivedOptions[0].responseProvider, responseProvider)
  assert.equal(receivedOptions[0].storage, storage)
})
