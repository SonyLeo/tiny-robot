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

await runTest('public source keeps removed legacy branches absent while retaining current workspace surface', async () => {
  const removedSurfaceTokens = [
    'TrChatFull.AssistantOutline',
    'TrChatFull.AssistantOutlineTrigger',
    'TrChatFull.PresetRoot',
    'TrChatFull.WorkspacePanelHost',
    'TrChatFull.ContentNavigationHost',
    'TrChatFull.ConversationTurnNavigation',
    'TrChatAssistantOutline',
    'TrChatAssistantOutlineTrigger',
    'ChatAssistantOutlineItem',
    'TrChatAssistantOutlineProps',
    'TrChatAssistantOutlineTriggerProps',
    'TrChatPresetRoot',
    'TrChatWorkspacePanelHost',
    'TrChatContentNavigationHost',
    'TrChatConversationTurnNavigation',
  ]

  removedSurfaceTokens.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
  assert.equal(chatComponentsIndexSource.includes('AssistantOutline'), false)
  assert.equal(chatComponentsIndexSource.includes('AssistantOutlineTrigger'), false)
  assert.equal(chatComponentsIndexSource.includes('ChatPresetRoot'), false)
  assert.equal(chatTypesIndexSource.includes("from './navigation'"), false)
  assert.equal(chatIndexSource.includes('TrChatFull.WorkspaceShell'), true)
  assert.equal(chatIndexSource.includes('TrChatFull.WorkspaceRightSheet'), true)
  assert.equal(chatIndexSource.includes('TrChatWorkspaceShell'), true)
  assert.equal(chatIndexSource.includes('TrChatWorkspaceRightSheet'), true)
  assert.equal(chatIndexSource.includes("from './components/workspace'"), true)
  assert.equal(chatTypesIndexSource.includes("from './workspace'"), true)
})

await runTest('named exports still advertise the retained scaffold and helper surface', async () => {
  const retainedExports = [
    'TrMcpTrigger',
    'TrModelSelector',
    'TrChatScaffold',
    'TrChatFeedback',
    'TrChatMcpPanel',
    'TrChatLayout',
    'TrChatWorkspaceLayout',
    'TrChatAttachments',
    'TrChatHistorySurface',
    'TrChatWorkspaceShell',
    'TrChatWorkspaceRightSheet',
    'createPresetConsumptionFromAgentPreset',
  ]

  retainedExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })
})
