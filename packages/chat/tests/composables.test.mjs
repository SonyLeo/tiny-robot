import {
  assert,
  computed,
  nextTick,
  ref,
  shallowRef,
  createMemoryStorage,
  createRetryableProvider,
  createStreamingProvider,
  runTest,
  useChatAttachments,
  useChatConversation,
  useChatKit,
  useChatMessages,
  useChatRequest,
  useModelSelector,
  waitFor,
} from './_helpers.mjs'

await runTest('useChatMessages manages edit state and resend flow', async () => {
  const messageList = ref([
    { role: 'user', content: 'first', state: {} },
    { role: 'assistant', content: 'second' },
    { role: 'assistant', content: 'third' },
  ])
  const resent = []

  const messageActions = useChatMessages({
    messages: computed(() => messageList.value),
    resendMessage: (content) => {
      resent.push(content)
    },
  })

  messageActions.startEditMessage(1)
  assert.equal(messageActions.isMessageEditing(1), true)

  messageActions.cancelEditMessage(1)
  assert.equal(messageActions.isMessageEditing(1), false)

  messageActions.editMessage(1, 'updated-second')
  assert.equal(messageList.value.length, 1)
  assert.deepEqual(resent, ['updated-second'])
})

await runTest('useChatRequest derives status, syncs providers, and proxies abort', async () => {
  const initialProvider = async function* () {}
  const nextProvider = async function* () {}
  let aborted = false

  const engine = {
    requestState: ref('idle'),
    processingState: ref(undefined),
    responseProvider: ref(initialProvider),
  }

  const request = useChatRequest({
    conversation: {
      activeConversation: computed(() => ({ engine })),
      abortActiveRequest: async () => {
        aborted = true
      },
    },
    responseProviderRef: shallowRef(initialProvider),
  })

  assert.equal(request.status.value, 'ready')

  engine.requestState.value = 'processing'
  engine.processingState.value = 'requesting'
  await nextTick()
  assert.equal(request.status.value, 'submitted')

  engine.processingState.value = 'completing'
  await nextTick()
  assert.equal(request.status.value, 'streaming')

  engine.requestState.value = 'error'
  await nextTick()
  assert.equal(request.status.value, 'error')

  request.updateResponseProvider(nextProvider)
  await nextTick()
  assert.equal(engine.responseProvider.value, nextProvider)

  await request.abort()
  assert.equal(aborted, true)
})

await runTest('useChatConversation bootstraps the first conversation from initial messages and fires onFinish', async () => {
  const finished = []
  const storage = createMemoryStorage()
  const conversation = useChatConversation({
    responseProviderRef: shallowRef(createStreamingProvider()),
    initialMessages: [{ role: 'system', content: 'seed-system-message' }],
    storage,
    onFinish: (message) => {
      finished.push(message)
    },
  })

  conversation.sendMessage('hello')

  await waitFor(() => {
    assert.equal(conversation.activeConversation.value?.engine.requestState.value, 'completed')
  })

  const messages = conversation.activeConversation.value?.engine.messages.value ?? []
  assert.equal(messages[0].content, 'seed-system-message')
  assert.equal(messages[1].content, 'hello')
  assert.equal(messages[2].content, 'reply:hello')
  assert.equal(finished.length, 1)
  assert.equal(finished[0].role, 'assistant')
})

await runTest('useChatConversation keeps manual createConversation empty and surfaces provider errors', async () => {
  const capturedErrors = []
  const conversation = useChatConversation({
    responseProviderRef: shallowRef(createStreamingProvider()),
    initialMessages: [{ role: 'system', content: 'seed-system-message' }],
    storage: createMemoryStorage(),
    onError: (error) => {
      capturedErrors.push(error.message)
    },
  })

  const createdConversation = conversation.createConversation({
    title: 'manual-conversation',
    useMessageOptions: {
      initialMessages: [{ role: 'system', content: 'should-not-leak' }],
    },
  })

  assert.equal(createdConversation.engine.messages.value.length, 0)

  conversation.sendMessage('boom')

  await waitFor(() => {
    assert.deepEqual(capturedErrors, ['boom'])
  })
})

await runTest('useChatKit exposes structured errors and annotates failed assistant messages', async () => {
  const chatKit = useChatKit({
    responseProvider: createRetryableProvider({
      failMessage: 'err',
      errorMessage: 'OpenAI API error 401: Unauthorized',
    }),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('err')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
  })

  assert.equal(chatKit.lastError.value?.type, 'auth')
  assert.equal(chatKit.lastError.value?.retryable, false)
  assert.equal(chatKit.lastError.value?.httpStatus, 401)
  assert.equal(chatKit.lastError.value?.statusCode, 401)
  assert.equal(chatKit.messages.value[1]?.role, 'assistant')
  assert.equal(chatKit.messages.value[1]?.state?.error?.message, 'OpenAI API error 401: Unauthorized')
})

await runTest('useChatKit retry removes the failed turn and resends the last user message', async () => {
  const chatKit = useChatKit({
    responseProvider: createRetryableProvider({
      failMessage: 'err',
      failOnce: true,
    }),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('err')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
  })

  assert.equal(chatKit.lastError.value?.type, 'provider')
  assert.equal(await chatKit.retry(), true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:err')
  })

  assert.equal(chatKit.lastError.value, null)
  assert.equal(chatKit.messages.value.length, 2)
})

await runTest('useChatKit marks optimistic messages during a pending turn and clears them after completion', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider({ initialDelay: 80 }),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('optimistic-turn')

  await waitFor(() => {
    assert.equal(chatKit.messages.value[0]?.state?.optimistic, true)
    assert.equal(chatKit.messages.value[1]?.state?.optimistic, true)
  })

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  assert.equal(chatKit.messages.value[0]?.state?.optimistic, undefined)
  assert.equal(chatKit.messages.value[1]?.state?.optimistic, undefined)
})

await runTest('useChatKit keeps optimistic and retry tracking stable for duplicate user content', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('same')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:same')
  })

  chatKit.updateResponseProvider(createStreamingProvider({ initialDelay: 80 }))
  chatKit.sendMessage('same')

  await waitFor(() => {
    assert.equal(chatKit.messages.value[2]?.state?.optimistic, true)
  })

  assert.equal(chatKit.messages.value[0]?.state?.optimistic, undefined)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  chatKit.updateResponseProvider(
    createRetryableProvider({
      failMessage: 'same',
      failOnce: true,
    }),
  )

  chatKit.sendMessage('same')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
  })

  assert.equal(await chatKit.retry(), true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.deepEqual(
      chatKit.messages.value.map((message) => message.content),
      ['same', 'reply:same', 'same', 'reply:same', 'same', 'reply:same'],
    )
  })
})

await runTest('useChatKit rolls edited history back when the resend fails', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('seed')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:seed')
  })

  chatKit.updateResponseProvider(
    createRetryableProvider({
      failMessage: 'edited-seed',
      errorMessage: 'Mock API Error: provider execution failed',
    }),
  )

  chatKit.editMessage(0, 'edited-seed')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'error')
  })

  assert.deepEqual(
    chatKit.messages.value.map((message) => message.content),
    ['seed', 'reply:seed'],
  )
  assert.equal(chatKit.lastError.value?.type, 'provider')
})


await runTest('useModelSelector falls back to the first enabled model and notifies change', async () => {
  const currentModel = ref('removed-model')
  const selected = []
  const models = ref([
    { value: 'disabled-model', providerId: 'openai', disabled: true },
    { value: 'ready-model', providerId: 'deepseek' },
  ])

  useModelSelector({
    currentModel,
    models,
    onChange: (model) => {
      selected.push(model.value)
    },
  })

  await nextTick()

  assert.equal(currentModel.value, 'ready-model')
  assert.deepEqual(selected, ['ready-model'])
})

await runTest('useModelSelector ignores disabled model selections', async () => {
  const currentModel = ref('ready-model')
  const models = ref([
    { value: 'ready-model', providerId: 'deepseek' },
    { value: 'disabled-model', providerId: 'openai', disabled: true },
  ])

  const selector = useModelSelector({
    currentModel,
    models,
  })

  await nextTick()

  selector.selectModel(models.value[1])

  assert.equal(currentModel.value, 'ready-model')
  assert.notEqual(selector.currentModelOption.value?.value, 'disabled-model')
})

await runTest('useModelSelector can sync a model without firing onChange', async () => {
  const currentModel = ref('ready-model')
  const selected = []
  const models = ref([
    { value: 'ready-model', providerId: 'deepseek' },
    { value: 'next-model', providerId: 'openai' },
  ])

  const selector = useModelSelector({
    currentModel,
    models,
    onChange: (model) => {
      selected.push(model.value)
    },
  })

  await nextTick()
  selected.length = 0

  selector.selectModel(models.value[1], { notifyChange: false })

  assert.equal(currentModel.value, 'next-model')
  assert.deepEqual(selected, [])
})

await runTest('useChatAttachments tracks selected files as attachment items', async () => {
  const attachments = useChatAttachments()
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

  attachments.addFiles([file])

  assert.equal(attachments.items.value.length, 1)
  assert.equal(attachments.items.value[0]?.name, 'hello.txt')

  attachments.clear()
  assert.equal(attachments.items.value.length, 0)
})

await runTest('useChatAttachments revokes owned object urls when items are removed', async () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL
  const revokedUrls = []
  let index = 0

  URL.createObjectURL = () => `blob:mock-${++index}`
  URL.revokeObjectURL = (url) => {
    revokedUrls.push(url)
  }

  try {
    const attachments = useChatAttachments()
    const fileA = new File(['a'], 'a.txt', { type: 'text/plain' })
    const fileB = new File(['b'], 'b.txt', { type: 'text/plain' })

    attachments.addFiles([fileA, fileB])
    const [itemA, itemB] = attachments.items.value

    attachments.removeItem(itemA)
    assert.deepEqual(revokedUrls, ['blob:mock-1'])

    attachments.setItems([itemB])
    assert.deepEqual(revokedUrls, ['blob:mock-1'])

    attachments.clear()
    assert.deepEqual(revokedUrls, ['blob:mock-1', 'blob:mock-2'])
  } finally {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  }
})

