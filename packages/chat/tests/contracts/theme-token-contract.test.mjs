import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { assert, runTest } from '../_helpers.mjs'

const chatVariablesPath = fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url))
const chatVariablesSource = readFileSync(chatVariablesPath, 'utf8')

const forbiddenDarkOverrides = [
  '--tr-bubble-box-bg',
  '--tr-bubble-box-border',
  '--tr-bubble-text-color',
  '--tr-sender-bg-color',
  '--tr-sender-text-color',
  '--tr-sender-placeholder-color',
  '--tr-sender-button-hover-bg',
  '--tr-prompt-bg',
  '--tr-prompt-bg-hover',
  '--tr-prompt-bg-active',
  '--tr-prompt-shadow',
  '--tr-prompt-title-color',
  '--tr-prompt-description-color',
  '--tr-history-item-hover-bg',
  '--tr-history-item-selected-bg',
  '--tr-history-item-selected-color',
  '--tr-history-item-action-bg-hover',
  '--tr-history-item-editor-border-color',
  '--tr-history-menu-list-bg',
  '--tr-history-menu-list-bg-hover',
  '--tr-history-menu-list-box-shadow',
]

function getDarkChatBlock(source) {
  const marker = "[data-tr-color-mode='dark'].tr-chat,"
  const markerIndex = source.indexOf(marker)
  assert.notEqual(markerIndex, -1)

  const openBraceIndex = source.indexOf('{', markerIndex)
  assert.notEqual(openBraceIndex, -1)

  let depth = 0
  let closeBraceIndex = -1
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') {
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        closeBraceIndex = index
        break
      }
    }
  }

  assert.notEqual(closeBraceIndex, -1)
  return source.slice(openBraceIndex, closeBraceIndex + 1)
}

await runTest('chat dark token contract does not override component-level tr tokens in the tr-chat dark block', async () => {
  const darkChatBlock = getDarkChatBlock(chatVariablesSource)

  forbiddenDarkOverrides.forEach((token) => {
    assert.equal(darkChatBlock.includes(token), false)
  })
})

await runTest('chat drawer token contract aligns drawer background with chat panel surfaces', async () => {
  assert.equal(chatVariablesSource.includes('--chat-drawer-bg: var(--chat-panel-bg, var(--chat-surface-bg));'), true)
})

