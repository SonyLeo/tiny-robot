import {
  assert,
  createRuntimeFromConfig,
  createMemoryStorage,
  createStreamingProvider,
  ensureRuntimeMessageId,
  useChatFeedback,
  useChatFeedbackWithFallbackRuntime,
  useRuntimeFeedbackEnabled,
  useChatKit,
  waitFor,
  runTest,
} from '../_helpers.mjs'
import { createSSRApp } from 'vue'

function runWithAppContext(fn) {
  const app = createSSRApp({})
  return app.runWithContext(fn)
}

await runTest('useChatFeedback merges built-in and custom message actions into feedback actions and operations', async () => {
  const storage = createMemoryStorage()
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage,
  })

  chatKit.sendMessage('message-actions')

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  let customActionLog = ''
  const messageActions = (context) => [
    {
      id: 'save-case',
      label: 'Save Case',
      placement: 'operations',
      roles: ['assistant'],
      order: 10,
      onClick: () => {
        customActionLog = `${context.role}:${context.messageId}:${context.messageIds.join('|')}:${context.conversationId}`
      },
    },
    {
      id: 'bookmark',
      label: 'Bookmark',
      placement: 'actions',
      roles: ['assistant'],
      order: 150,
    },
    {
      id: 'user-only',
      label: 'User Only',
      placement: 'operations',
      roles: ['user'],
    },
  ]

  const feedback = runWithAppContext(() =>
    useChatFeedbackWithFallbackRuntime({
      messages: [chatKit.messages.value[1]],
      messageIndexes: [1],
      role: 'assistant',
      fallbackRuntime: chatKit,
      messageActions,
    }),
  )

  assert.deepEqual(
    feedback.feedbackActions.value.map((action) => action.name),
    ['copy', 'bookmark', 'refresh'],
  )
  assert.deepEqual(
    feedback.feedbackOperations.value.map((action) => action.name),
    ['save-case'],
  )

  await feedback.getActionDefinition('save-case')?.onClick?.(feedback.actionContext.value)
  const assistantMessageId = ensureRuntimeMessageId(chatKit.messages.value[1])
  assert.equal(
    customActionLog,
    `assistant:${assistantMessageId}:${assistantMessageId}:${chatKit.activeConversationId.value}`,
  )
  assert.deepEqual(feedback.actionContext.value.messageIds, [assistantMessageId])
})

await runTest('useChatFeedback replace mode keeps only custom actions', async () => {
  const feedback = runWithAppContext(() =>
    useChatFeedback({
      messages: [{ role: 'assistant', content: 'replace-mode' }],
      messageIndexes: [0],
      role: 'assistant',
      messageActionsMode: 'replace',
      messageActions: [
        {
          id: 'custom-only',
          label: 'Custom Only',
          placement: 'operations',
        },
      ],
    }),
  )

  assert.deepEqual(feedback.feedbackActions.value ?? [], [])
  assert.deepEqual(
    feedback.feedbackOperations.value.map((action) => action.name),
    ['custom-only'],
  )
})

await runTest('useChatFeedback built-in actions prefer runtime messageId paths when runtime is available', async () => {
  const assistantMessage = {
    role: 'assistant',
    content: 'runtime-assisted',
    state: {},
  }
  const userMessage = {
    role: 'user',
    content: 'runtime-user',
    state: {},
  }
  const assistantMessageId = ensureRuntimeMessageId(assistantMessage)
  const userMessageId = ensureRuntimeMessageId(userMessage)
  const calls = []

  const runtime = {
    conversation: {
      messages: { value: [] },
      status: { value: 'ready' },
      send: () => undefined,
      abort: () => undefined,
      retry: async (messageId) => {
        calls.push(['retry', messageId])
        return true
      },
      regenerate: async (messageId) => {
        calls.push(['regenerate', messageId])
        return true
      },
    },
    sender: {
      draft: { value: '' },
      pendingAttachments: { value: [] },
      canSend: { value: true },
      setDraft: () => undefined,
      send: () => undefined,
      addPendingAttachments: () => undefined,
      setPendingAttachments: () => undefined,
      removePendingAttachment: () => undefined,
      clearPendingAttachments: () => undefined,
    },
    message: {
      getViewState: (messageId) => ({
        status: 'done',
        error:
          messageId === assistantMessageId && calls.some(([kind]) => kind === 'force-retry')
            ? { retryable: true }
            : undefined,
        editing: false,
        optimistic: false,
      }),
      getActions: () => [],
      startEdit: (messageId) => {
        calls.push(['startEdit', messageId])
      },
      cancelEdit: () => undefined,
      commitEdit: () => true,
      copy: async (messageId) => {
        calls.push(['copy', messageId])
      },
    },
  }

  const userFeedback = runWithAppContext(() =>
    useChatFeedback({
      messages: [userMessage],
      messageIndexes: [0],
      role: 'user',
      runtime,
    }),
  )

  await userFeedback.getActionDefinition('copy')?.onClick?.(userFeedback.actionContext.value)
  await userFeedback.getActionDefinition('edit')?.onClick?.(userFeedback.actionContext.value)

  const assistantFeedback = runWithAppContext(() =>
    useChatFeedback({
      messages: [assistantMessage],
      messageIndexes: [1],
      role: 'assistant',
      runtime,
    }),
  )

  assert.deepEqual(
    assistantFeedback.feedbackActions.value.map((action) => action.name),
    ['copy', 'refresh'],
  )

  await assistantFeedback.getActionDefinition('copy')?.onClick?.(assistantFeedback.actionContext.value)
  await assistantFeedback.getActionDefinition('refresh')?.onClick?.(assistantFeedback.actionContext.value)

  calls.push(['force-retry', assistantMessageId])
  await assistantFeedback.getActionDefinition('refresh')?.onClick?.(assistantFeedback.actionContext.value)

  assert.deepEqual(calls, [
    ['copy', userMessageId],
    ['startEdit', userMessageId],
    ['copy', assistantMessageId],
    ['regenerate', assistantMessageId],
    ['force-retry', assistantMessageId],
    ['retry', assistantMessageId],
  ])
  assert.equal(userFeedback.actionContext.value.messageId, userMessageId)
  assert.deepEqual(userFeedback.actionContext.value.messageIds, [userMessageId])
  assert.equal(assistantFeedback.actionContext.value.messageId, assistantMessageId)
  assert.deepEqual(assistantFeedback.actionContext.value.messageIds, [assistantMessageId])
})

await runTest('useChatFeedback falls back to runtime-owned action definitions and actionMode when messageActions are not passed explicitly', async () => {
  const assistantMessage = {
    role: 'assistant',
    content: 'runtime-action-source',
    state: {},
  }
  const assistantMessageId = ensureRuntimeMessageId(assistantMessage)
  let customActionLog = ''

  const runtime = {
    conversation: {
      messages: { value: [] },
      status: { value: 'ready' },
      send: () => undefined,
      abort: () => undefined,
      retry: async () => true,
      regenerate: async () => true,
    },
    sender: {
      draft: { value: '' },
      pendingAttachments: { value: [] },
      canSend: { value: true },
      setDraft: () => undefined,
      send: () => undefined,
      addPendingAttachments: () => undefined,
      setPendingAttachments: () => undefined,
      removePendingAttachment: () => undefined,
      clearPendingAttachments: () => undefined,
    },
    message: {
      getViewState: () => ({
        status: 'done',
        editing: false,
        optimistic: false,
      }),
      getActions: (messageId) => [
        {
          id: 'save-case',
          label: 'Save Case',
          placement: 'operations',
          roles: ['assistant'],
          onClick: () => {
            customActionLog = messageId
          },
        },
      ],
      startEdit: () => undefined,
      cancelEdit: () => undefined,
      commitEdit: () => true,
      copy: async () => undefined,
      config: {
        actionMode: 'replace',
      },
    },
  }

  const feedback = runWithAppContext(() =>
    useChatFeedback({
      messages: [assistantMessage],
      messageIndexes: [0],
      role: 'assistant',
      runtime,
    }),
  )

  assert.deepEqual(feedback.feedbackActions.value, [])
  assert.deepEqual(
    feedback.feedbackOperations.value.map((action) => action.name),
    ['save-case'],
  )

  await feedback.getActionDefinition('save-case')?.onClick?.(feedback.actionContext.value)
  assert.equal(customActionLog, assistantMessageId)
  assert.equal(feedback.actionContext.value.messageId, assistantMessageId)
})

await runTest('useRuntimeFeedbackEnabled prefers explicit enablement and otherwise falls back to runtime-owned feedback config', async () => {
  const runtimeEnabled = {
    message: {
      config: {
        feedback: {
          enabled: true,
        },
      },
    },
  }
  const runtimeDisabled = {
    message: {
      config: {
        feedback: {
          enabled: false,
        },
      },
    },
  }

  const explicitDisabled = runWithAppContext(() =>
    useRuntimeFeedbackEnabled({
      enabled: false,
      runtime: runtimeEnabled,
    }),
  )
  const fallbackDisabled = runWithAppContext(() =>
    useRuntimeFeedbackEnabled({
      runtime: runtimeDisabled,
    }),
  )
  const fallbackDefault = runWithAppContext(() =>
    useRuntimeFeedbackEnabled({
      runtime: null,
    }),
  )

  assert.equal(explicitDisabled.value, false)
  assert.equal(fallbackDisabled.value, false)
  assert.equal(fallbackDefault.value, true)
})

await runTest('createRuntimeFromConfig keeps message action settings on the runtime-owned message config', async () => {
  const actionDefinitions = [
    {
      id: 'save-case',
      label: 'Save Case',
      placement: 'operations',
      roles: ['assistant'],
    },
  ]

  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    messages: {
      feedback: {
        enabled: true,
      },
      actions: actionDefinitions,
      actionMode: 'replace',
    },
  })

  assert.equal(runtime.message?.config?.feedback?.enabled, true)
  assert.equal(runtime.message?.getActions('assistant-message-id'), actionDefinitions)
  assert.equal(runtime.message?.config?.actionMode, 'replace')
})

