/**
 * Stage 6 unit test coverage:
 *   6.1 sendMessage with attachments follows the optimistic-turn path
 *   6.6 conversation.regenerate edge cases
 */
import {
  assert,
  createMemoryStorage,
  createStreamingProvider,
  ensureRuntimeMessageId,
  useChatKit,
  waitFor,
  runTest,
} from '../_helpers.mjs'

// ---------------------------------------------------------------------------
// 6.1  sendMessage with attachments — optimistic turn marking
// ---------------------------------------------------------------------------

await runTest('useChatKit.sendMessage with attachments marks optimistic turn the same as plain sendMessage', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider({ initialDelay: 60 }),
    storage: createMemoryStorage(),
  })

  const attachments = [{ name: 'file.txt', size: 42, status: 'success' }]
  chatKit.sendMessage('hello-attach', { attachments })

  // While the request is in-flight the user message should be optimistic
  await waitFor(() => {
    assert.equal(chatKit.messages.value.length >= 1, true)
    const userMsg = chatKit.messages.value[0]
    assert.ok(userMsg, 'user message should exist')
    assert.equal(userMsg.state?.optimistic, true, 'user message should be optimistic')
  })

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  // After completion optimistic flag must be cleared (set to undefined, not true)
  assert.notEqual(chatKit.messages.value[0]?.state?.optimistic, true)
  assert.equal(chatKit.messages.value[1]?.content, 'reply:hello-attach')
})

await runTest('useChatKit.sendMessage with attachments optimistic state is consistent with plain sendMessage', async () => {
  // Plain send
  const plainKit = useChatKit({
    responseProvider: createStreamingProvider({ initialDelay: 60 }),
    storage: createMemoryStorage(),
  })
  plainKit.sendMessage('plain')

  // Attach send
  const attachKit = useChatKit({
    responseProvider: createStreamingProvider({ initialDelay: 60 }),
    storage: createMemoryStorage(),
  })
  attachKit.sendMessage('attach', { attachments: [{ name: 'a.txt', size: 1 }] })

  // Both should be optimistic while in-flight
  await waitFor(() => {
    assert.equal(plainKit.messages.value[0]?.state?.optimistic, true)
    assert.equal(attachKit.messages.value[0]?.state?.optimistic, true)
  })

  await waitFor(() => {
    assert.equal(plainKit.status.value, 'ready')
    assert.equal(attachKit.status.value, 'ready')
  })

  // Both should clear optimistic after completion (set to undefined, not true)
  assert.notEqual(plainKit.messages.value[0]?.state?.optimistic, true)
  assert.notEqual(attachKit.messages.value[0]?.state?.optimistic, true)
})

// ---------------------------------------------------------------------------
// 6.6  regenerate edge cases
// ---------------------------------------------------------------------------

await runTest('useChatKit.regenerate() with no argument re-generates the last assistant message', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('regen-last')
  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value[1]?.content, 'reply:regen-last')
  })

  const originalAssistantId = ensureRuntimeMessageId(chatKit.messages.value[1])
  const result = await chatKit.regenerate()

  assert.equal(result, true)
  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value.length, 2)
    assert.equal(chatKit.messages.value[1]?.content, 'reply:regen-last')
  })

  // A new assistant message should have been created (different id)
  assert.notEqual(ensureRuntimeMessageId(chatKit.messages.value[1]), originalAssistantId)
})

await runTest('useChatKit.regenerate(messageIndex) targeting a non-assistant message re-sends from that user message', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  chatKit.sendMessage('regen-user-target')
  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
  })

  // Index 0 is the user message — regenerate treats it as the target user turn
  // and re-sends from that point (this is the actual implementation behavior)
  const result = await chatKit.regenerate(0)
  assert.equal(result, true)

  await waitFor(() => {
    assert.equal(chatKit.status.value, 'ready')
    assert.equal(chatKit.messages.value.length, 2)
  })
})

await runTest('useChatKit.regenerate() on an empty conversation returns false', async () => {
  const chatKit = useChatKit({
    responseProvider: createStreamingProvider(),
    storage: createMemoryStorage(),
  })

  // No messages yet — must return false without throwing
  const result = await chatKit.regenerate()
  assert.equal(result, false)
})
