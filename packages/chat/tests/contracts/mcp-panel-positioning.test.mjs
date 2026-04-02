import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { assert, runTest } from '../_helpers.mjs'

const chatMcpPanelPath = fileURLToPath(new URL('../../src/components/mcp/ChatMcpPanel.vue', import.meta.url))
const chatMcpPanelSource = readFileSync(chatMcpPanelPath, 'utf8')

await runTest('ChatMcpPanel source scopes the MCP panel to the nearest chat container when available', async () => {
  assert.equal(chatMcpPanelSource.includes("closest('.tr-chat')"), true)
  assert.equal(chatMcpPanelSource.includes('<Teleport :to="teleportTarget" :disabled="!panelHostElement">'), true)
})

await runTest('ChatMcpPanel source keeps absolute positioning overrides for scoped MCP layers', async () => {
  assert.equal(chatMcpPanelSource.includes('.tr-chat-mcp-panel-layer.is-scoped'), true)
  assert.equal(chatMcpPanelSource.includes('position: absolute !important;'), true)
})
