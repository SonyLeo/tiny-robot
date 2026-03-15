import assert from 'node:assert/strict'
import { computed, nextTick, ref, shallowRef } from 'vue'
import createJiti from 'jiti'

// Use jiti so the unit guardrails can import chat source files directly without a build step.
const jiti = createJiti(import.meta.url)
const { useChatConversation } = await jiti.import('../src/composables/useChatConversation.ts')
const { useChatMessages } = await jiti.import('../src/composables/useChatMessages.ts')
const { useChatRequest } = await jiti.import('../src/composables/useChatRequest.ts')
const { useChatKit } = await jiti.import('../src/composables/useChatKit.ts')

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

function createStreamingProvider() {
  return async function* responseProvider(requestBody) {
    const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

    if (lastMessage === 'boom') {
      throw new Error('boom')
    }

    const reply = `reply:${lastMessage}`

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
