import {
  assert,
  createChatAdapterFromConfig,
  createMemoryStorage,
  createPresetChatProps,
  createPresetChatSlices,
  createStreamingProvider,
  useChatFeedback,
  useChatKit,
  waitFor,
  runTest,
} from './_helpers.mjs'
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
        customActionLog = `${context.role}:${context.messageIndex}:${context.conversationId}`
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
    useChatFeedback({
      messages: [chatKit.messages.value[1]],
      messageIndexes: [1],
      role: 'assistant',
      chatKit,
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
  assert.equal(customActionLog, `assistant:1:${chatKit.activeConversationId.value}`)
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

await runTest('createPresetChatSlices projects message action settings through the message list slice', async () => {
  const actionDefinitions = [
    {
      id: 'save-case',
      label: 'Save Case',
      placement: 'operations',
      roles: ['assistant'],
    },
  ]

  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      feedback: true,
    },
  })

  const presetProps = createPresetChatProps(adapter, {
    showFeedback: true,
    messageActions: actionDefinitions,
    messageActionsMode: 'replace',
  })
  const slices = createPresetChatSlices(presetProps)

  assert.equal(slices.messageList.showFeedback, true)
  assert.equal(slices.messageList.messageActions, actionDefinitions)
  assert.equal(slices.messageList.messageActionsMode, 'replace')
})
