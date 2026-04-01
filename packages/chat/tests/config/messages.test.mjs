import { assert, CHAT_MESSAGES, resolveChatMessages, runTest } from '../_helpers.mjs'

await runTest('resolveChatMessages merges partial overrides without losing chat-owned defaults', async () => {
  const resolved = resolveChatMessages({
    header: {
      newChat: 'Create session',
    },
    sender: {
      placeholder: 'Ask anything',
    },
    error: {
      retry: 'Try again',
    },
  })

  assert.equal(resolved.header.newChat, 'Create session')
  assert.equal(resolved.sender.placeholder, 'Ask anything')
  assert.equal(resolved.error.retry, 'Try again')
  assert.equal(resolved.header.close, CHAT_MESSAGES.header.close)
  assert.equal(resolved.feedback.copy, CHAT_MESSAGES.feedback.copy)
})

await runTest('resolveChatMessages returns the shared defaults when no overrides are provided', async () => {
  assert.equal(resolveChatMessages(), CHAT_MESSAGES)
})

