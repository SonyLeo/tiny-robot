import {
  assert,
  createMemoryStorage,
  createStreamingProvider,
  getRootChatKitResolution,
  resolveRootChatKit,
  runTest,
  useChatKit,
} from '../_helpers.mjs'

await runTest('getRootChatKitResolution returns the provided chatKit when present', async () => {
  const providedChatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  const resolution = getRootChatKitResolution('TrChatRoot', {
    chatKit: providedChatKit,
  })

  assert.equal(resolution.providedChatKit, providedChatKit)
  assert.equal(resolution.chatKitOptions, undefined)
})

await runTest('getRootChatKitResolution derives useChatKit options from root props when responseProvider is present', async () => {
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

  const resolution = getRootChatKitResolution('TrChatRoot', {
    responseProvider,
    storage,
    initialMessages,
    messageTransforms,
    onFinish,
    onError,
  })

  assert.equal(resolution.providedChatKit, undefined)
  assert.equal(resolution.chatKitOptions?.responseProvider, responseProvider)
  assert.equal(resolution.chatKitOptions?.storage, storage)
  assert.equal(resolution.chatKitOptions?.messageTransforms, messageTransforms)
  assert.equal(resolution.chatKitOptions?.onFinish, onFinish)
  assert.equal(resolution.chatKitOptions?.onError, onError)
  assert.deepEqual(resolution.chatKitOptions?.initialMessages, initialMessages)
})

await runTest('resolveRootChatKit throws a component-scoped error when neither chatKit nor responseProvider is provided', async () => {
  assert.throws(
    () => resolveRootChatKit('TrChatRoot', {}),
    /\[TrChatRoot\] Either chatKit or responseProvider must be provided/,
  )
})

await runTest('resolveRootChatKit delegates chatKit creation through the shared helper path', async () => {
  const responseProvider = createStreamingProvider()
  const storage = createMemoryStorage()
  const created = { kind: 'mock-chat-kit' }
  const receivedOptions = []

  const chatKit = resolveRootChatKit(
    'TrChatRoot',
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

