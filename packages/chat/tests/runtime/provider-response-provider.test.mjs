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

await runTest(
  'getProviderRuntimeResolution also accepts transportAdapter as the transport-oriented alias',
  async () => {
    const transportAdapter = createStreamingProvider()
    const resolution = getProviderRuntimeResolution('TrChatProvider', {
      transportAdapter,
    })

    assert.equal(resolution.providerRuntimeOptions?.responseProvider, transportAdapter)
  },
)

await runTest(
  'getProviderRuntimeResolution rejects ambiguous provider props when transportAdapter and responseProvider are both present',
  async () => {
    const transportAdapter = createStreamingProvider()
    const responseProvider = createStreamingProvider()

    assert.throws(
      () =>
        getProviderRuntimeResolution('TrChatProvider', {
          transportAdapter,
          responseProvider,
        }),
      /\[TrChatProvider\] transportAdapter and responseProvider cannot be provided together/,
    )
  },
)

await runTest('resolveProviderRuntime throws a component-scoped error when transportAdapter and responseProvider are both missing', async () => {
  assert.throws(
    () => resolveProviderRuntime('TrChatProvider', {}),
    /\[TrChatProvider\] transportAdapter or responseProvider must be provided/,
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
