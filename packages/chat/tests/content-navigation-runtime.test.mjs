import {
  assert,
  coerceContentNavigationItemId,
  resolveAssistantOutlineItems,
  resolveConversationTurnNavigationItems,
  runTest,
  slugifyAssistantOutlineHeading,
} from './_helpers.mjs'

function shouldRenderContentNavigation(items, minItems) {
  const threshold = minItems ?? 2
  return (items?.length ?? 0) >= threshold
}

await runTest('content navigation runtime hides the host below the minimum item threshold', async () => {
  assert.equal(shouldRenderContentNavigation([], 2), false)
  assert.equal(shouldRenderContentNavigation([{ id: 'turn-0', label: 'First turn' }], 2), false)
  assert.equal(
    shouldRenderContentNavigation(
      [
        { id: 'turn-0', label: 'First turn' },
        { id: 'turn-2', label: 'Second turn' },
      ],
      2,
    ),
    true,
  )
})

await runTest('content navigation runtime coerces active ids back to the first valid item', async () => {
  const items = [
    { id: 'turn-0', label: 'First turn' },
    { id: 'turn-2', label: 'Second turn' },
  ]

  assert.equal(coerceContentNavigationItemId({ items, requestedId: 'turn-2' }), 'turn-2')
  assert.equal(coerceContentNavigationItemId({ items, requestedId: 'missing' }), 'turn-0')
  assert.equal(coerceContentNavigationItemId({ items: [], requestedId: 'missing' }), undefined)
})

await runTest('turn navigation runtime indexes non-empty user turns with stable labels', async () => {
  const items = resolveConversationTurnNavigationItems([
    { role: 'system', content: 'ignore system message' },
    { role: 'user', content: 'First user turn' },
    { role: 'assistant', content: 'First reply' },
    {
      role: 'user',
      content:
        'Second user turn with a very long message that should be shortened once it crosses the navigation label limit.',
      metadata: { model: 'demo-model' },
    },
    { role: 'user', content: '   ' },
  ])

  assert.equal(items.length, 2)
  assert.deepEqual(items[0], {
    id: 'turn-1',
    label: 'First user turn',
    description: undefined,
    messageIndex: 1,
    role: 'user',
  })
  assert.equal(items[1].id, 'turn-3')
  assert.equal(items[1].description, 'model:demo-model')
  assert.equal(items[1].messageIndex, 3)
  assert.equal(items[1].role, 'user')
  assert.equal(items[1].label.endsWith('...'), true)
  assert.equal(items[1].label.length <= 75, true)
  assert.equal(items[1].label.startsWith('Second user turn with a very long message'), true)
})

await runTest('assistant outline runtime normalizes stable heading slugs', async () => {
  assert.equal(slugifyAssistantOutlineHeading('Workspace Shell Rollout'), 'workspace-shell-rollout')
  assert.equal(slugifyAssistantOutlineHeading('  中文 标题  '), '中文-标题')
  assert.equal(slugifyAssistantOutlineHeading(''), 'heading')
})

await runTest('assistant outline runtime maps heading entries into host items', async () => {
  const items = resolveAssistantOutlineItems([
    { id: 'assistant-outline-rollout', text: 'Workspace Shell Rollout', level: 1 },
    {
      id: 'assistant-outline-content-navigation',
      text: 'Add content navigation after the shell container stabilizes and the appearance model lands cleanly.',
      level: 2,
    },
  ])

  assert.equal(items.length, 2)
  assert.deepEqual(items[0], {
    id: 'assistant-outline-rollout',
    headingId: 'assistant-outline-rollout',
    label: 'Workspace Shell Rollout',
    description: undefined,
    level: 1,
  })
  assert.equal(items[1].headingId, 'assistant-outline-content-navigation')
  assert.equal(items[1].level, 2)
  assert.equal(items[1].label.endsWith('...'), true)
  assert.equal(items[1].label.length <= 72, true)
})
