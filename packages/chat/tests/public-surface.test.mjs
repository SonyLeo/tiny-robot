import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from './_harness.mjs'

const chatIndexSource = readFileSync(fileURLToPath(new URL('../src/index.ts', import.meta.url)), 'utf8')
const chatComponentsIndexSource = readFileSync(
  fileURLToPath(new URL('../src/components/chat/index.ts', import.meta.url)),
  'utf8',
)
const chatTypesIndexSource = readFileSync(fileURLToPath(new URL('../src/types/index.ts', import.meta.url)), 'utf8')

await runTest('TrChat compound source keeps the retained subcomponents', async () => {
  const retainedAssignments = [
    'TrChatFull.Scaffold = TrChatScaffold',
    'TrChatFull.Root = TrChatRoot',
    'TrChatFull.Layout = TrChatLayout',
    'TrChatFull.Header = TrChatHeader',
    'TrChatFull.Welcome = TrChatWelcome',
    'TrChatFull.MessageList = TrChatMessageList',
    'TrChatFull.Footer = TrChatFooter',
    'TrChatFull.Attachments = TrChatAttachments',
    'TrChatFull.Sender = TrChatSender',
    'TrChatFull.History = TrChatHistory',
    'TrChatFull.HistorySurface = TrChatHistorySurface',
  ]

  retainedAssignments.forEach((assignment) => {
    assert.match(chatIndexSource, new RegExp(assignment.replaceAll('.', '\\.')))
  })
})

await runTest('public source no longer exposes removed workspace/preset branches and keeps named helper exports', async () => {
  const removedSurfaceTokens = [
    'TrChatFull.AssistantOutline',
    'TrChatFull.AssistantOutlineTrigger',
    'TrChatFull.PresetRoot',
    'TrChatFull.WorkspaceShell',
    'TrChatFull.WorkspacePanelHost',
    'TrChatFull.ContentNavigationHost',
    'TrChatFull.ConversationTurnNavigation',
    'TrChatAssistantOutline',
    'TrChatAssistantOutlineTrigger',
    'ChatAssistantOutlineItem',
    'TrChatAssistantOutlineProps',
    'TrChatAssistantOutlineTriggerProps',
    'TrChatPresetRoot',
    'TrChatWorkspaceShell',
    'TrChatWorkspacePanelHost',
    'TrChatContentNavigationHost',
    'TrChatConversationTurnNavigation',
    "from './components/workspace'",
    'from \'./workspace\'',
  ]

  removedSurfaceTokens.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
  assert.equal(chatComponentsIndexSource.includes('AssistantOutline'), false)
  assert.equal(chatComponentsIndexSource.includes('AssistantOutlineTrigger'), false)
  assert.equal(chatComponentsIndexSource.includes('ChatPresetRoot'), false)
  assert.equal(chatTypesIndexSource.includes("from './navigation'"), false)
  assert.equal(chatTypesIndexSource.includes("from './workspace'"), false)
})

await runTest('named exports still advertise the retained scaffold and helper surface', async () => {
  const retainedExports = [
    'TrModelSelector',
    'TrChatScaffold',
    'TrChatFeedback',
    'TrChatMcpPanel',
    'TrChatLayout',
    'TrChatAttachments',
    'TrChatHistorySurface',
    'createPresetConsumptionFromAgentPreset',
  ]

  retainedExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })
})
