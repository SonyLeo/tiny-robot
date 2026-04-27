/**
 * Stage 6 unit test coverage:
 *   6.9 resolveChatMessages i18n partial override merging for mcp and sidebar groups
 */
import {
  assert,
  CHAT_MESSAGES,
  resolveChatMessages,
  runTest,
} from '../_helpers.mjs'

// ---------------------------------------------------------------------------
// 6.9  resolveChatMessages — mcp and sidebar group overrides
// ---------------------------------------------------------------------------

await runTest('resolveChatMessages partial override of mcp group does not affect other mcp fields', () => {
  const result = resolveChatMessages({
    mcp: {
      triggerLabel: 'Plugins',
    },
  })

  assert.equal(result.mcp.triggerLabel, 'Plugins')
  // Other mcp fields should retain defaults
  assert.equal(result.mcp.addPlugin, CHAT_MESSAGES.mcp.addPlugin)
  assert.equal(result.mcp.installPlugin, CHAT_MESSAGES.mcp.installPlugin)
  assert.equal(result.mcp.triggerActiveTitle, CHAT_MESSAGES.mcp.triggerActiveTitle)
  assert.equal(result.mcp.triggerInactiveTitle, CHAT_MESSAGES.mcp.triggerInactiveTitle)
})

await runTest('resolveChatMessages partial override of sidebar group does not affect other sidebar fields', () => {
  const result = resolveChatMessages({
    sidebar: {
      collapse: 'Collapse panel',
    },
  })

  assert.equal(result.sidebar.collapse, 'Collapse panel')
  // Other sidebar fields should retain defaults
  assert.equal(result.sidebar.close, CHAT_MESSAGES.sidebar.close)
  assert.equal(result.sidebar.emptyTitle, CHAT_MESSAGES.sidebar.emptyTitle)
  assert.equal(result.sidebar.emptyDescription, CHAT_MESSAGES.sidebar.emptyDescription)
})

await runTest('resolveChatMessages overriding mcp does not affect sidebar group', () => {
  const result = resolveChatMessages({
    mcp: {
      addPlugin: 'Add',
      installPlugin: 'Install',
    },
  })

  // sidebar should be untouched
  assert.deepEqual(result.sidebar, CHAT_MESSAGES.sidebar)
})

await runTest('resolveChatMessages overriding sidebar does not affect mcp group', () => {
  const result = resolveChatMessages({
    sidebar: {
      emptyTitle: 'Nothing here',
      emptyDescription: 'Check back later.',
    },
  })

  // mcp should be untouched
  assert.deepEqual(result.mcp, CHAT_MESSAGES.mcp)
})

await runTest('resolveChatMessages can override both mcp and sidebar in a single call', () => {
  const result = resolveChatMessages({
    mcp: { triggerLabel: 'Extensions' },
    sidebar: { close: 'Dismiss' },
  })

  assert.equal(result.mcp.triggerLabel, 'Extensions')
  assert.equal(result.mcp.addPlugin, CHAT_MESSAGES.mcp.addPlugin)
  assert.equal(result.sidebar.close, 'Dismiss')
  assert.equal(result.sidebar.emptyTitle, CHAT_MESSAGES.sidebar.emptyTitle)
})

await runTest('resolveChatMessages with no overrides returns the shared CHAT_MESSAGES defaults for mcp and sidebar', () => {
  const result = resolveChatMessages()

  assert.deepEqual(result.mcp, CHAT_MESSAGES.mcp)
  assert.deepEqual(result.sidebar, CHAT_MESSAGES.sidebar)
})
