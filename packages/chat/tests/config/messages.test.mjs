import { assert, CHAT_MESSAGES, resolveChatMessages, runTest } from '../_helpers.mjs'

await runTest('resolveChatMessages merges partial overrides without losing chat-owned defaults', async () => {
  const resolved = resolveChatMessages({
    header: {
      newChat: 'Create session',
    },
    sender: {
      placeholder: 'Ask anything',
    },
    workspace: {
      rightPanelTitle: 'Workspace panel',
    },
    modelSelector: {
      triggerLabel: 'Choose model',
    },
    attachments: {
      uploadTooltip: 'Upload file',
    },
    senderActions: {
      voiceTooltip: 'Voice input',
    },
    error: {
      retry: 'Try again',
    },
  })

  assert.equal(resolved.header.newChat, 'Create session')
  assert.equal(resolved.sender.placeholder, 'Ask anything')
   assert.equal(resolved.workspace.rightPanelTitle, 'Workspace panel')
   assert.equal(resolved.modelSelector.triggerLabel, 'Choose model')
   assert.equal(resolved.attachments.uploadTooltip, 'Upload file')
   assert.equal(resolved.senderActions.voiceTooltip, 'Voice input')
  assert.equal(resolved.error.retry, 'Try again')
  assert.equal(resolved.header.close, CHAT_MESSAGES.header.close)
   assert.equal(resolved.workspace.historyRailLabel, CHAT_MESSAGES.workspace.historyRailLabel)
  assert.equal(resolved.feedback.copy, CHAT_MESSAGES.feedback.copy)
})

await runTest('resolveChatMessages returns the shared defaults when no overrides are provided', async () => {
  assert.equal(resolveChatMessages(), CHAT_MESSAGES)
})

