import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from '../_harness.mjs'

const chatIndexSource = readFileSync(fileURLToPath(new URL('../../src/index.ts', import.meta.url)), 'utf8')
const chatComponentsIndexSource = readFileSync(fileURLToPath(new URL('../../src/components/core/index.ts', import.meta.url)), 'utf8')
const chatTypesIndexSource = readFileSync(fileURLToPath(new URL('../../src/types/index.ts', import.meta.url)), 'utf8')
const chatCoreTypesSource = readFileSync(fileURLToPath(new URL('../../src/types/core.ts', import.meta.url)), 'utf8')
const chatKitSource = readFileSync(fileURLToPath(new URL('../../src/runtime/chat-kit/useChatKit.ts', import.meta.url)), 'utf8')
const chatSenderSource = readFileSync(fileURLToPath(new URL('../../src/components/core/ChatSender.vue', import.meta.url)), 'utf8')
const chatHeaderSource = readFileSync(fileURLToPath(new URL('../../src/components/core/ChatHeader.vue', import.meta.url)), 'utf8')
const workspaceShellSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/WorkspaceShell.vue', import.meta.url)),
  'utf8',
)
const workspaceSidebarRailSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceSidebarRail.vue', import.meta.url)),
  'utf8',
)
const workspaceRightPanelSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceRightPanel.vue', import.meta.url)),
  'utf8',
)
const modelSelectorSource = readFileSync(
  fileURLToPath(new URL('../../src/components/model-selector/ModelSelector.vue', import.meta.url)),
  'utf8',
)
const registrySource = readFileSync(fileURLToPath(new URL('../../src/runtime/config/registry.ts', import.meta.url)), 'utf8')
const configProjectionSource = readFileSync(
  fileURLToPath(new URL('../../src/runtime/config/configProjection.ts', import.meta.url)),
  'utf8',
)

await runTest('TrChat compound source keeps the retained subcomponents', async () => {
  const retainedAssignments = [
    'TrChatFull.Scaffold = TrChatScaffold',
    'TrChatFull.Provider = TrChatProvider',
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
    'TrChatFull.PresetProvider',
    'TrChatFull.WorkspacePanelHost',
    'TrChatFull.ContentNavigationHost',
    'TrChatFull.ConversationTurnNavigation',
    'TrChatAssistantOutline',
    'TrChatAssistantOutlineTrigger',
    'ChatAssistantOutlineItem',
    'TrChatAssistantOutlineProps',
    'TrChatAssistantOutlineTriggerProps',
    'TrChatPresetProvider',
    'TrChatWorkspacePanelHost',
    'TrChatContentNavigationHost',
    'TrChatConversationTurnNavigation',
  ]

  removedSurfaceTokens.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
  assert.equal(chatComponentsIndexSource.includes('AssistantOutline'), false)
  assert.equal(chatComponentsIndexSource.includes('AssistantOutlineTrigger'), false)
  assert.equal(chatComponentsIndexSource.includes('ChatProvider'), true)
  assert.equal(chatTypesIndexSource.includes("from './navigation'"), false)
  assert.equal(chatIndexSource.includes('TrChatFull.WorkspaceShell'), true)
  assert.equal(chatIndexSource.includes('TrChatFull.WorkspaceRightSheet'), true)
  assert.equal(chatIndexSource.includes('TrChatWorkspaceShell'), true)
  assert.equal(chatIndexSource.includes('TrChatWorkspaceRightSheet'), true)
  assert.equal(chatIndexSource.includes('TrChatFull.Provider'), true)
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
    'TrChatProvider',
  ]

  retainedExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })
})

await runTest('public source advertises chat message action contracts for extension work', async () => {
  const retainedTypeExports = [
    'ChatMessageActionContext',
    'ChatMessageActionDefinition',
    'ChatMessageActionPlacement',
    'ChatMessageActionsInput',
    'ChatMessageActionsMode',
    'ChatMessageActionRole',
    'ChatMessageTransformChunkContext',
    'ChatMessageTransformFinishContext',
    'ChatMessageTransforms',
    'ChatBubbleRenderers',
  ]

  retainedTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
    assert.equal(chatTypesIndexSource.includes(token), true)
  })
})

await runTest('renamed provider-facing type exports stay visible through the public entrypoints', async () => {
  const topLevelTypeExports = [
    'ChatConfigIntegrations',
    'ChatPresetProviderSlice',
    'TrChatRuntimeInput',
    'TrChatProviderProps',
  ]

  topLevelTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })

  const chatTypesExports = ['TrChatRuntimeInput', 'TrChatProviderProps', 'TrChatProviderSharedProps']

  chatTypesExports.forEach((token) => {
    assert.equal(chatTypesIndexSource.includes(token), true)
  })
})

await runTest('public runtime sendMessage surface stays single-argument while structuredData remains sender-local', async () => {
  assert.equal(chatCoreTypesSource.includes('sendMessage: (content: string) => void'), true)
  assert.equal(chatCoreTypesSource.includes('data?: StructuredData'), false)
  assert.equal(chatKitSource.includes('function sendMessage(content: string): void {'), true)
  assert.equal(chatKitSource.includes('_data?: StructuredData'), false)
  assert.equal(chatSenderSource.includes('structuredData: data,'), true)
  assert.equal(chatSenderSource.includes('chatKit.sendMessage(payload.text)'), true)
})

await runTest('workspace-facing source reads default copy from chat messages instead of hardcoded literals', async () => {
  assert.equal(chatHeaderSource.includes('chatMessages.workspace.toggleRightPanel'), true)
  assert.equal(chatHeaderSource.includes('Toggle workspace panel'), false)

  assert.equal(workspaceShellSource.includes('chatMessages.value.workspace.historyRailLabel'), true)
  assert.equal(workspaceShellSource.includes('chatMessages.value.workspace.previewRailLabel'), true)
  assert.equal(workspaceShellSource.includes('Expand left sidebar'), false)
  assert.equal(workspaceShellSource.includes('Expand right sidebar'), false)

  assert.equal(workspaceSidebarRailSource.includes('chatMessages.workspace.expandLeftSidebar'), true)
  assert.equal(workspaceSidebarRailSource.includes('chatMessages.workspace.historyRailLabel'), true)
  assert.equal(workspaceSidebarRailSource.includes('chatMessages.header.newChat'), true)
  assert.equal(workspaceSidebarRailSource.includes('Expand sidebar'), false)
  assert.equal(workspaceSidebarRailSource.includes('Create conversation'), false)

  assert.equal(workspaceRightPanelSource.includes('chatMessages.workspace.rightPanelTitle'), true)
  assert.equal(workspaceRightPanelSource.includes('chatMessages.workspace.closeRightPanel'), true)
  assert.equal(workspaceRightPanelSource.includes('Close right panel'), false)

  assert.equal(modelSelectorSource.includes('chatMessages.modelSelector.triggerLabel'), true)
  assert.equal(modelSelectorSource.includes('选择模型'), false)

  assert.equal(registrySource.includes('上传附件'), false)
  assert.equal(registrySource.includes('语音输入'), false)
  assert.equal(configProjectionSource.includes("railLabel: 'History'"), false)
  assert.equal(configProjectionSource.includes("railLabel: 'Preview'"), false)
})

