import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { computed, nextTick, ref, shallowRef } from 'vue'
import createJiti from 'jiti'

// Use jiti so the unit guardrails can import chat source files directly without a build step.
const jiti = createJiti(import.meta.url, {
  alias: {
    '@opentiny/tiny-robot-svgs': fileURLToPath(new URL('../../svgs/dist/tiny-robot-svgs.js', import.meta.url)),
  },
})
const { useChatConversation } = await jiti.import('../src/composables/useChatConversation.ts')
const { useChatMessages } = await jiti.import('../src/composables/useChatMessages.ts')
const { useChatRequest } = await jiti.import('../src/composables/useChatRequest.ts')
const { useChatAttachments } = await jiti.import('../src/composables/useChatAttachments.ts')
const { useChatKit } = await jiti.import('../src/composables/useChatKit.ts')
const { useModelSelector } = await jiti.import('../src/composables/useModelSelector.ts')
const { loadChatConfig, createChatAdapterFromConfig, createPresetChatProps, resolveChatFeatures } = await jiti.import(
  '../src/adapters/index.ts',
)

function createChunk({ content, role, finishReason = null, model = 'mock-model' }) {
  return {
    id: `mock-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role,
          content,
        },
        logprobs: null,
        finish_reason: finishReason,
      },
    ],
  }
}

function createStreamingProvider({ initialDelay = 0 } = {}) {
  return async function* responseProvider(requestBody) {
    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

    if (lastMessage === 'boom') {
      throw new Error('boom')
    }

    const reply = `reply:${lastMessage}`

    if (initialDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay))
    }

    let isFirstChunk = true
    for (const char of reply) {
      yield createChunk({
        content: char,
        role: isFirstChunk ? 'assistant' : undefined,
      })
      isFirstChunk = false
    }

    yield createChunk({
      content: undefined,
      role: undefined,
      finishReason: 'stop',
    })
  }
}

function createRetryableProvider({ failMessage = 'err', failOnce = false, errorMessage = 'Mock API Error: provider execution failed' } = {}) {
  const failureCount = new Map()

  return async function* responseProvider(requestBody) {
    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

    if (lastMessage === failMessage) {
      const currentFailureCount = failureCount.get(lastMessage) ?? 0
      failureCount.set(lastMessage, currentFailureCount + 1)

      if (!failOnce || currentFailureCount === 0) {
        throw new Error(errorMessage)
      }
    }

    yield* createStreamingProvider()(requestBody)
  }
}

function createMemoryStorage() {
  const conversations = []
  const messageMap = new Map()

  return {
    saveConversation(conversation) {
      const index = conversations.findIndex((item) => item.id === conversation.id)
      const record = { ...conversation }

      if (index === -1) {
        conversations.unshift(record)
      } else {
        conversations[index] = record
      }
    },
    loadConversations() {
      return conversations.map((conversation) => ({ ...conversation }))
    },
    saveMessages(conversationId, messages) {
      messageMap.set(
        conversationId,
        messages.map((message) => ({
          ...message,
          state: message.state ? { ...message.state } : message.state,
          metadata: message.metadata ? { ...message.metadata } : message.metadata,
        })),
      )
    },
    loadMessages(conversationId) {
      return messageMap.get(conversationId)?.map((message) => ({ ...message })) ?? []
    },
    deleteConversation(conversationId) {
      const index = conversations.findIndex((item) => item.id === conversationId)
      if (index !== -1) {
        conversations.splice(index, 1)
      }
      messageMap.delete(conversationId)
    },
  }
}

async function waitFor(assertion, { timeout = 1500, interval = 20 } = {}) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeout) {
    try {
      const result = assertion()
      await nextTick()
      return result
    } catch {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  return assertion()
}

async function runTest(name, fn) {
  try {
    await fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

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

await runTest('useModelSelector falls back to the first selectable model and syncs the provider', async () => {
  const currentModel = ref('removed-model')
  const selected = []
  const providerCalls = []
  const providerA = () => {}
  const providerB = () => {}
  const models = ref([
    { value: 'disabled-model', provider: 'openai', disabled: true },
    { value: 'ready-model', provider: 'deepseek' },
  ])
  const providerFactories = ref([
    {
      match: (model) => model.value === 'ready-model',
      createProvider: (model) => {
        providerCalls.push(model.value)
        return providerB
      },
    },
    {
      match: (model) => model.value === 'other-model',
      createProvider: () => providerA,
    },
  ])

  useModelSelector({
    currentModel,
    models,
    providerFactories,
    chatKit: {
      updateResponseProvider(provider) {
        assert.equal(provider, providerB)
      },
    },
    onChange: (model) => {
      selected.push(model.value)
    },
  })

  await nextTick()

  assert.equal(currentModel.value, 'ready-model')
  assert.deepEqual(providerCalls, ['ready-model'])
  assert.deepEqual(selected, ['ready-model'])
})

await runTest('useModelSelector keeps the current model when the next model has no matching provider factory', async () => {
  const currentModel = ref('ready-model')
  const providerCalls = []
  const readyProvider = () => {}
  const models = ref([
    { value: 'ready-model', provider: 'deepseek' },
    { value: 'missing-factory-model', provider: 'openai' },
  ])
  const providerFactories = ref([
    {
      match: (model) => model.value === 'ready-model',
      createProvider: (model) => {
        providerCalls.push(model.value)
        return readyProvider
      },
    },
  ])

  const selector = useModelSelector({
    currentModel,
    models,
    providerFactories,
    chatKit: {
      updateResponseProvider(provider) {
        assert.equal(provider, readyProvider)
      },
    },
  })

  await nextTick()
  providerCalls.length = 0

  selector.selectModel(models.value[1])

  assert.equal(currentModel.value, 'ready-model')
  assert.deepEqual(providerCalls, [])
  assert.notEqual(selector.currentModelOption.value?.value, 'missing-factory-model')
})

await runTest('loadChatConfig normalizes feature config and createPresetChatProps consumes resolved feature defaults', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      attachments: {
        upload: {
          accept: '.pdf',
          multiple: false,
        },
      },
      senderActions: {
        voice: {
          enabled: true,
          tooltip: '语音输入',
          size: 'small',
          autoInsert: false,
        },
        wordCount: true,
        defaultActions: {
          clear: {
            tooltip: '清空',
          },
        },
      },
      history: {
        props: {
          selected: 'conversation-1',
        },
      },
      feedback: true,
    },
  })

  assert.deepEqual(config.features, {
    attachments: {
      enabled: undefined,
      upload: {
        enabled: undefined,
        accept: '.pdf',
        multiple: false,
        maxCount: undefined,
        maxSize: undefined,
        tooltip: undefined,
        tooltipPlacement: undefined,
      },
      list: undefined,
    },
    senderActions: {
      enabled: undefined,
      upload: undefined,
      voice: {
        enabled: true,
        tooltip: '语音输入',
        tooltipPlacement: undefined,
        size: 'small',
        speechConfig: undefined,
        autoInsert: false,
        onButtonClick: undefined,
        icon: undefined,
        recordingIcon: undefined,
      },
      wordCount: true,
      defaultActions: {
        clear: {
          tooltip: '清空',
        },
      },
    },
    history: {
      enabled: undefined,
      props: {
        selected: 'conversation-1',
      },
    },
    feedback: true,
  })

  const adapter = createChatAdapterFromConfig(config)

  assert.deepEqual(adapter.resolvedFeatures.enabledKeys, ['attachments', 'senderActions', 'history', 'feedback'])
  assert.equal(adapter.resolvedFeatures.entries.attachments.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.senderActions.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.history.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.feedback.enabled, true)

  const presetProps = createPresetChatProps(adapter)

  assert.equal(presetProps.attachmentsFeature?.enabled, true)
  assert.equal(presetProps.attachmentsFeature?.upload?.accept, '.pdf')
  assert.equal(presetProps.attachmentsFeature?.upload?.multiple, false)
  assert.equal(presetProps.attachmentsFeature?.list?.variant, 'card')
  assert.equal(presetProps.senderActionsFeature?.voice?.enabled, true)
  assert.equal(presetProps.senderActionsFeature?.voice?.tooltip, '语音输入')
  assert.equal(presetProps.senderActionsFeature?.voice?.size, 'small')
  assert.equal(presetProps.senderActionsFeature?.voice?.autoInsert, false)
  assert.equal(presetProps.senderActionsFeature?.wordCount, true)
  assert.equal(presetProps.senderActionsFeature?.defaultActions?.clear?.tooltip, '清空')
  assert.equal(presetProps.showHistory, true)
  assert.equal(presetProps.showFeedback, true)
  assert.deepEqual(presetProps.historyProps, {
    selected: 'conversation-1',
  })
})

await runTest('createPresetChatProps lets explicit overrides win over resolved feature defaults', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      attachments: true,
      senderActions: {
        wordCount: true,
      },
      history: true,
      feedback: true,
    },
  })

  const presetProps = createPresetChatProps(adapter, {
    attachmentsFeature: {
      enabled: true,
      upload: {
        accept: 'image/*',
      },
    },
    senderActionsFeature: {
      wordCount: false,
    },
    showHistory: false,
    showFeedback: false,
  })

  assert.equal(presetProps.attachmentsFeature?.upload?.accept, 'image/*')
  assert.equal(presetProps.senderActionsFeature?.wordCount, false)
  assert.equal(presetProps.showHistory, false)
  assert.equal(presetProps.showFeedback, false)
})

await runTest('resolveChatFeatures keeps attachments and senderActions outputs independent for runtime composition', async () => {
  const resolved = resolveChatFeatures({
    attachments: {
      upload: {
        accept: '.txt',
        multiple: true,
      },
    },
    senderActions: {
      upload: {
        enabled: false,
      },
      voice: {
        enabled: true,
        tooltip: '语音输入',
      },
    },
  })

  assert.deepEqual(resolved.enabledKeys, ['attachments', 'senderActions'])
  assert.equal(resolved.entries.attachments.presetProps.attachmentsFeature?.upload?.accept, '.txt')
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.upload?.enabled, false)
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.voice?.enabled, true)
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.voice?.tooltip, '语音输入')
})

await runTest('createPresetChatProps lets suggestions feature override legacy ui.prompts and explicit disable clears prompts', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
    },
    features: {
      suggestions: {
        welcome: [
          { label: 'feature prompt 1', description: 'feature prompt 1' },
          { label: 'feature prompt 2', description: 'feature prompt 2' },
        ],
      },
    },
  })

  const presetProps = createPresetChatProps(adapter)
  assert.equal(presetProps.prompts?.length, 2)
  assert.equal(presetProps.prompts?.[0]?.label, 'feature prompt 1')
  assert.equal(adapter.resolvedFeatures.entries.suggestions.enabled, true)

  const disabledAdapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
    },
    features: {
      suggestions: false,
    },
  })

  const disabledPresetProps = createPresetChatProps(disabledAdapter)
  assert.deepEqual(disabledPresetProps.prompts, [])
  assert.equal(disabledAdapter.resolvedFeatures.entries.suggestions.enabled, false)
})

await runTest('resolveChatFeatures keeps disabled features out of preset props', async () => {
  const resolved = resolveChatFeatures({
    attachments: false,
    senderActions: false,
    suggestions: false,
    history: false,
    feedback: {
      enabled: false,
    },
  })

  assert.deepEqual(resolved.enabledKeys, [])
  assert.deepEqual(resolved.presetProps, {})
  assert.equal(resolved.entries.attachments.enabled, false)
  assert.equal(resolved.entries.senderActions.enabled, false)
  assert.equal(resolved.entries.suggestions.enabled, false)
  assert.equal(resolved.entries.history.enabled, false)
  assert.equal(resolved.entries.feedback.enabled, false)
})

await runTest('loadChatConfig rejects invalid feature shapes', async () => {
  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          history: {
            props: 'invalid',
          },
        },
      }),
    /features\.history\.props must be an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          senderActions: 'invalid',
        },
      }),
    /features\.senderActions must be a boolean or an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          suggestions: 'invalid',
        },
      }),
    /features\.suggestions must be a boolean or an object/,
  )
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
