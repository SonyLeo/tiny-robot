import {
  assert,
  getChatRenderMessageIndex,
  getChatRenderSourceMessage,
  normalizeChatRenderMessages,
  runTest,
  unwrapChatRenderMessages,
} from './_helpers.mjs'

await runTest('normalizeChatRenderMessages annotates source messages with stable render indexes without cloning them', async () => {
  const messages = [
    { role: 'user', content: 'first', state: { optimistic: true } },
    { role: 'assistant', content: 'second', metadata: { transformed: true } },
  ]

  const normalized = normalizeChatRenderMessages(messages)

  assert.equal(normalized, messages)
  assert.equal(normalized[0], messages[0])
  assert.equal(normalized[1], messages[1])
  assert.equal(getChatRenderSourceMessage(normalized[0]), messages[0])
  assert.equal(getChatRenderSourceMessage(normalized[1]), messages[1])
  assert.equal(getChatRenderMessageIndex(normalized[0]), 0)
  assert.equal(getChatRenderMessageIndex(normalized[1]), 1)
  assert.equal(normalized[0].state, messages[0].state)
  assert.equal(normalized[1].metadata, messages[1].metadata)
})

await runTest('unwrapChatRenderMessages returns the original chat messages in order', async () => {
  const messages = [
    { role: 'assistant', content: 'alpha' },
    { role: 'assistant', content: 'beta' },
  ]

  const normalized = normalizeChatRenderMessages(messages)
  const unwrapped = unwrapChatRenderMessages(normalized)

  assert.equal(unwrapped[0], messages[0])
  assert.equal(unwrapped[1], messages[1])
})
