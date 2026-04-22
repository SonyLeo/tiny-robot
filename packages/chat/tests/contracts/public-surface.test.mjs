import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from '../_harness.mjs'

const chatIndexSource = readFileSync(fileURLToPath(new URL('../../src/index.ts', import.meta.url)), 'utf8')
const chatComponentsIndexSource = readFileSync(fileURLToPath(new URL('../../src/components/core/index.ts', import.meta.url)), 'utf8')
const chatTypesIndexSource = readFileSync(fileURLToPath(new URL('../../src/types/index.ts', import.meta.url)), 'utf8')
const chatCoreTypesSource = readFileSync(fileURLToPath(new URL('../../src/types/core.ts', import.meta.url)), 'utf8')
const chatSource = readFileSync(fileURLToPath(new URL('../../src/components/core/Chat.vue', import.meta.url)), 'utf8')
const blackboxEntrySource = readFileSync(
  fileURLToPath(new URL('../../src/runtime/config/blackboxEntry.ts', import.meta.url)),
  'utf8',
)
const chatPageSource = readFileSync(fileURLToPath(new URL('../../src/page/TrChatPage.vue', import.meta.url)), 'utf8')
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
const editInputRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/renderers/EditInputRenderer.vue', import.meta.url)),
  'utf8',
)
const errorRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/renderers/ErrorRenderer.vue', import.meta.url)),
  'utf8',
)
const defaultRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultRenderer.vue', import.meta.url)),
  'utf8',
)
const defaultHeaderRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultHeaderRegion.vue', import.meta.url)),
  'utf8',
)
const defaultBodyRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultBodyRegion.vue', import.meta.url)),
  'utf8',
)
const defaultFooterRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultFooterRegion.vue', import.meta.url)),
  'utf8',
)
const chatProviderSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/ChatProvider.vue', import.meta.url)),
  'utf8',
)
const chatWelcomeSource = readFileSync(fileURLToPath(new URL('../../src/components/core/ChatWelcome.vue', import.meta.url)), 'utf8')
const chatMessageListSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/ChatMessageList.vue', import.meta.url)),
  'utf8',
)
const chatHistorySource = readFileSync(fileURLToPath(new URL('../../src/components/history/ChatHistory.vue', import.meta.url)), 'utf8')

await runTest('TrChat compound source keeps the retained subcomponents', async () => {
  const retainedAssignments = [
    'TrChatFull.Root = TrChatRoot',
    'TrChatFull.Page = TrChatPage',
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
    'TrChatRoot',
    'TrChatPage',
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

  assert.equal(chatIndexSource.includes('createRuntimeFromConfig'), true)
})

await runTest('official page surface is exported as a dedicated TrChat.Page wrapper', async () => {
  assert.equal(chatIndexSource.includes('Page: typeof TrChatPage'), true)
  assert.equal(chatIndexSource.includes('export { TrChatRoot, TrChatPage }'), true)
  assert.equal(chatPageSource.includes('<ChatDefaultHeaderRegion'), true)
  assert.equal(chatPageSource.includes('<ChatDefaultBodyRegion'), true)
  assert.equal(chatPageSource.includes('<ChatDefaultFooterRegion'), true)
  assert.equal(chatPageSource.includes('<ChatWorkspaceLayout'), true)
  assert.equal(chatPageSource.includes('v-if="isWorkspaceShell"'), true)
  assert.equal(
    chatPageSource.includes('<ChatHistory :compatibility-relay="false" :enabled="historyInput?.enabled" :appearance="appearanceInput" />'),
    true,
  )
  assert.equal(defaultRendererSource.includes('<TrChatPage'), true)
  assert.equal(defaultRendererSource.includes('<slot :name="name" v-bind="slotProps ?? {}" />'), true)
})

await runTest('blackbox TrChat source keeps Root + Page explicit for target TrChatConfig while classifying compatibility callbacks as either supported lifecycle hooks or scaffold fallback', async () => {
  assert.equal(chatSource.includes('createRuntimeFromConfig'), true)
  assert.equal(chatSource.includes('resolveRootPageBlackboxConfig(props)'), true)
  assert.equal(chatSource.includes('!props.callbacks'), false)
  assert.equal(chatSource.includes('<TrChatRoot v-if="blackboxResolution"'), true)
  assert.equal(chatSource.includes('<TrChatPage>'), true)
  assert.equal(chatSource.includes('<ChatScaffold'), true)
  assert.equal(chatSource.includes('v-else'), true)
  assert.equal(blackboxEntrySource.includes('callbacks?.onBeforeSend'), true)
  assert.equal(blackboxEntrySource.includes('callbacks?.onMessageAction'), true)
  assert.equal(blackboxEntrySource.includes('callbacks?.onModelChange'), true)
  assert.equal(blackboxEntrySource.includes('afterReceive: chainHandlers'), true)
  assert.equal(blackboxEntrySource.includes('error: chainHandlers'), true)
})

await runTest('official page source consumes the narrow page-input boundary instead of raw scaffold preset slices', async () => {
  assert.equal(chatPageSource.includes('useChatPageInputs'), true)
  assert.equal(chatPageSource.includes('const headerInput = computed(() => pageInputs?.value.header)'), true)
  assert.equal(chatPageSource.includes('const layoutInput = computed(() => pageInputs?.value.layout)'), true)
  assert.equal(chatPageSource.includes('const historyInput = computed(() => pageInputs?.value.history)'), true)
  assert.equal(chatPageSource.includes('pageInputs?.value.shell'), true)
  assert.equal(chatPageSource.includes('pageInputs?.value.messageList'), true)
  assert.equal(chatPageSource.includes('pageInputs?.value.updateModel?.(model)'), true)
  assert.equal(chatPageSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatPageSource.includes('presetSlices.value.shell.shell'), false)
  assert.equal(chatPageSource.includes('presetSlices.value.messageList'), false)
  assert.equal(chatPageSource.includes('presetSlices.value.modelSelector'), false)
})

await runTest('default page path passes explicit primitive inputs instead of relying on scaffold lookups near the page owner', async () => {
  assert.equal(chatPageSource.includes(':header-input="headerInput"'), true)
  assert.equal(chatPageSource.includes(':show="layoutInput?.show"'), true)
  assert.equal(chatPageSource.includes(':appearance="appearanceInput"'), true)
  assert.equal(chatPageSource.includes(':enabled="historyInput?.enabled"'), true)
  assert.equal(chatPageSource.includes(':compatibility-relay="false" :enabled="historyInput?.enabled"'), true)
  assert.equal(defaultHeaderRegionSource.includes(':compatibility-relay="false"'), true)
  assert.equal(defaultBodyRegionSource.includes(':compatibility-relay="false"'), true)
  assert.equal(defaultHeaderRegionSource.includes(':title="headerInput?.title"'), true)
  assert.equal(defaultHeaderRegionSource.includes(':shell="shell"'), true)
  assert.equal(chatHeaderSource.includes('const shouldUseCompatibilityRelay = computed(() => props.compatibilityRelay !== false)'), true)
  assert.equal(chatHistorySource.includes('const shouldUseCompatibilityRelay = computed(() => props.compatibilityRelay !== false)'), true)
  assert.equal(chatWelcomeSource.includes('const shouldUseCompatibilityRelay = computed(() => props.compatibilityRelay !== false)'), true)
  assert.equal(chatMessageListSource.includes('const shouldUseCompatibilityRelay = computed(() => props.compatibilityRelay !== false)'), true)
})

await runTest('chat provider source no longer reads scaffold shell directly once callers pass shell explicitly', async () => {
  assert.equal(chatProviderSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatProviderSource.includes('const shell = computed(() => props.shell)'), true)
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

  assert.equal(chatCoreTypesSource.includes('messageIds: string[]'), true)
})

await runTest('renamed provider-facing type exports stay visible through the public entrypoints', async () => {
  const topLevelTypeExports = [
    'ChatRuntimeInput',
    'ChatConfigIntegrations',
    'TrChatConfig',
    'ChatPresetProviderSlice',
    'TrChatRootProps',
    'TrChatRuntimeInput',
    'TrChatProviderProps',
  ]

  topLevelTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })

  const chatTypesExports = [
    'ChatRuntimeInput',
    'TrChatConfig',
    'TrChatRootProps',
    'TrChatRuntimeInput',
    'TrChatProviderProps',
    'TrChatProviderSharedProps',
  ]

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

await runTest('message renderer source prefers runtime messageId hooks before legacy index fallback', async () => {
  assert.equal(editInputRendererSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(editInputRendererSource.includes('getRuntimeMessageId'), true)
  assert.equal(editInputRendererSource.includes('chatRuntime.message.commitEdit(messageId, localContent.value)'), true)
  assert.equal(errorRendererSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(errorRendererSource.includes('chatRuntime.conversation.retry(messageId.value)'), true)
})

await runTest('default page footer source keeps footer-extra as the only page-level footer slot', async () => {
  assert.equal(chatPageSource.includes("$slots['footer-extra']"), true)
  assert.equal(chatPageSource.includes('$slots.footer'), false)
  assert.equal(defaultRendererSource.includes('<TrChatPage'), true)
  assert.equal(defaultFooterRegionSource.includes('<slot name="footer-extra" />'), true)
  assert.equal(defaultFooterRegionSource.includes('<slot name="footer"'), false)
  assert.equal(defaultFooterRegionSource.includes('<ChatFooter v-else>'), true)
})

