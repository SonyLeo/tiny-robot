import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from '../_harness.mjs'

const chatIndexSource = readFileSync(fileURLToPath(new URL('../../src/index.ts', import.meta.url)), 'utf8')
const chatComponentsIndexSource = readFileSync(fileURLToPath(new URL('../../src/components/index.ts', import.meta.url)), 'utf8')
const chatTypesIndexSource = readFileSync(fileURLToPath(new URL('../../src/types/index.ts', import.meta.url)), 'utf8')
const chatCoreTypesSource = readFileSync(fileURLToPath(new URL('../../src/types/core.ts', import.meta.url)), 'utf8')
const chatUiTypesSource = readFileSync(fileURLToPath(new URL('../../src/types/component.ts', import.meta.url)), 'utf8')
const chatRootTypesSource = readFileSync(fileURLToPath(new URL('../../src/types/config.ts', import.meta.url)), 'utf8')
const chatSource = readFileSync(fileURLToPath(new URL('../../src/entry/TrChat.vue', import.meta.url)), 'utf8')
const trChatConfigEntrySource = readFileSync(
  fileURLToPath(new URL('../../src/runtime/config/trchatConfigEntry.ts', import.meta.url)),
  'utf8',
)
const chatPageSource = readFileSync(fileURLToPath(new URL('../../src/entry/TrChatPage.vue', import.meta.url)), 'utf8')
const chatPageContentSource = readFileSync(fileURLToPath(new URL('../../src/components/page-regions/ChatPageContent.vue', import.meta.url)), 'utf8')
const chatRootSource = readFileSync(fileURLToPath(new URL('../../src/entry/TrChatRoot.vue', import.meta.url)), 'utf8')
const rootBootstrapProviderSource = readFileSync(
  fileURLToPath(new URL('../../src/entry/RootBootstrapProvider.vue', import.meta.url)),
  'utf8',
)
const internalSource = readFileSync(fileURLToPath(new URL('../../src/internal.ts', import.meta.url)), 'utf8')
const sharedContextSource = readFileSync(fileURLToPath(new URL('../../src/shared/context/index.ts', import.meta.url)), 'utf8')
const chatKitSource = readFileSync(fileURLToPath(new URL('../../src/runtime/engine/useChatKit.ts', import.meta.url)), 'utf8')
const chatSenderSource = readFileSync(fileURLToPath(new URL('../../src/components/ChatSender.vue', import.meta.url)), 'utf8')
const chatAttachmentsSource = readFileSync(
  fileURLToPath(new URL('../../src/components/attachments/ChatAttachments.vue', import.meta.url)),
  'utf8',
)
const chatLayoutSource = readFileSync(fileURLToPath(new URL('../../src/components/ChatLayout.vue', import.meta.url)), 'utf8')
const chatHeaderSource = readFileSync(fileURLToPath(new URL('../../src/components/ChatHeader.vue', import.meta.url)), 'utf8')
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
const workspaceLayoutSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceLayout.vue', import.meta.url)),
  'utf8',
)
const modelSelectorSource = readFileSync(
  fileURLToPath(new URL('../../src/components/model-selector/ModelSelector.vue', import.meta.url)),
  'utf8',
)
const registrySource = readFileSync(fileURLToPath(new URL('../../src/runtime/features/registry.ts', import.meta.url)), 'utf8')
const editInputRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/renderers/EditInputRenderer.vue', import.meta.url)),
  'utf8',
)
const errorRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/renderers/ErrorRenderer.vue', import.meta.url)),
  'utf8',
)
const defaultHeaderRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/page-regions/ChatDefaultHeaderRegion.vue', import.meta.url)),
  'utf8',
)
const defaultBodyRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/page-regions/ChatDefaultBodyRegion.vue', import.meta.url)),
  'utf8',
)
const chatFeedbackSource = readFileSync(
  fileURLToPath(new URL('../../src/components/feedback/ChatFeedback.vue', import.meta.url)),
  'utf8',
)
const defaultFooterRegionSource = readFileSync(
  fileURLToPath(new URL('../../src/components/page-regions/ChatDefaultFooterRegion.vue', import.meta.url)),
  'utf8',
)
const chatProviderSource = readFileSync(
  fileURLToPath(new URL('../../src/entry/TrChatProvider.vue', import.meta.url)),
  'utf8',
)
const chatWelcomeSource = readFileSync(fileURLToPath(new URL('../../src/components/ChatWelcome.vue', import.meta.url)), 'utf8')
const chatMessageListSource = readFileSync(
  fileURLToPath(new URL('../../src/components/ChatMessageList.vue', import.meta.url)),
  'utf8',
)
const chatHistorySource = readFileSync(fileURLToPath(new URL('../../src/components/history/ChatHistory.vue', import.meta.url)), 'utf8')
const providerResolutionSource = readFileSync(
  fileURLToPath(new URL('../../src/runtime/config/resolveProviderRuntime.ts', import.meta.url)),
  'utf8',
)

await runTest('TrChat compound source keeps the retained subcomponents', async () => {
  const retainedAssignments = [
    'TrChatFull.Root = TrChatRoot',
    'TrChatFull.Page = TrChatPage',
    'TrChatFull.Provider = TrChatProvider',
    'TrChatFull.Layout = TrChatLayout',
    'TrChatFull.Header = TrChatHeader',
    'TrChatFull.Welcome = TrChatWelcome',
    'TrChatFull.MessageList = TrChatMessageList',
    'TrChatFull.Footer = TrChatFooter',
    'TrChatFull.Attachments = TrChatAttachments',
    'TrChatFull.Sender = TrChatSender',
    'TrChatFull.History = TrChatHistory',
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

await runTest('named exports keep the retained standalone advanced surface while pruning duplicate flat aliases', async () => {
  const retainedExports = [
    'TrMcpTrigger',
    'TrChatFeedback',
  ]

  retainedExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })

  const removedDuplicateAliases = [
    'export { TrChatRoot, TrChatPage }',
    '\n  TrChatProvider,\n',
    '\n  TrChatLayout,\n',
    '\n  TrChatWorkspaceLayout,\n',
    '\n  TrChatAttachments,\n',
    '\n  TrChatWorkspaceShell,\n',
    '\n  TrChatWorkspaceRightSheet,\n',
    'TrModelSelector',
    'TrChatMcpPanel',
  ]

  removedDuplicateAliases.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })

  assert.equal(chatIndexSource.includes('createRuntimeFromConfig'), true)
  assert.equal(chatIndexSource.includes('useChatKit'), false)
  assert.equal(chatIndexSource.includes('loadChatConfig'), false)
  assert.equal(chatIndexSource.includes('createChatAdapterFromConfig'), false)
  assert.equal(chatIndexSource.includes('createPresetChatProps'), false)
  assert.equal(chatIndexSource.includes('createPresetChatSlices'), false)
})

await runTest('package root prunes low-level helper, renderer, and registry exports from the promoted surface', async () => {
  const removedRootExports = [
    'useChatAttachments',
    'useDefaultBubbleConfig',
    'useModelSelector',
    'useChatFeedback',
    'useFloatingDropdown',
    'useKeyboardNavigation',
    'useHistoryState',
    'useSlotFilter',
    'MarkStreamRenderer',
    'ErrorRenderer',
    'EditInputRenderer',
    'ToolCallsRenderer',
    'ToolCallRenderer',
    'AttachmentsRenderer',
    'CHAT_FEATURE_REGISTRY',
    'resolveChatFeatures',
    'KNOWN_PROVIDERS',
  ]

  removedRootExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })

  const removedRootTypeExports = [
    'UseDefaultBubbleConfigOptions',
    'UseModelSelectorOptions',
    'UseChatAttachmentsReturn',
    'UseChatAttachmentsOptions',
    'ChatAttachmentsFeatureConfig',
    'ChatAttachmentsFeatureResolution',
    'BuiltInChatFeatureKey',
    'ChatFeatureConfigMap',
    'ChatFeatureInput',
    'ChatMcpFeatureConfig',
    'ChatMcpFeatureResolution',
    'ChatFeaturePresetProps',
    'ChatFeedbackFeatureConfig',
    'ChatFeedbackFeatureResolution',
    'ChatHistoryFeatureConfig',
    'ChatHistoryFeatureOptions',
    'ChatHistoryFeatureResolution',
    'ChatSenderActionsFeatureConfig',
    'ChatSenderActionsFeatureResolution',
    'ChatWelcomePromptsFeatureConfig',
    'ChatWelcomePromptsFeatureOptions',
    'ChatWelcomePromptsFeatureResolution',
    'ResolvedChatFeatures',
    'KnownProvider',
  ]

  removedRootTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
})

await runTest('official page surface is exported as a dedicated TrChat.Page wrapper', async () => {
  assert.equal(chatIndexSource.includes('Page: typeof TrChatPage'), true)
  assert.equal(chatIndexSource.includes('export { TrChatRoot, TrChatPage }'), false)
  assert.equal(chatUiTypesSource.includes('export interface TrChatPageProps {'), true)
  assert.equal(chatUiTypesSource.includes('messageListVariant?: ChatListVariant'), true)
  assert.equal(chatUiTypesSource.includes("export interface TrChatPageEmits {"), true)
  assert.equal(chatUiTypesSource.includes('export interface TrChatPageSlots {'), true)
  assert.match(chatUiTypesSource, /'message-list'\?:\s*\(props: TrChatPageMessageListSlotProps\) => unknown/)
  assert.match(chatUiTypesSource, /sender\?:\s*\(props: TrChatPageSenderSlotProps\) => unknown/)
  assert.equal(chatUiTypesSource.includes("'header-extra'?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("'footer-extra'?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("'left-rail'?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("'mobile-left'?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("'mobile-right'?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("export interface TrChatPageMessageListSlotProps {"), true)
  assert.equal(chatUiTypesSource.includes('messages: ReadonlyRef<ChatMessage[]>'), true)
  assert.equal(chatUiTypesSource.includes("export interface TrChatPageSenderSlotProps {"), true)
  assert.equal(chatUiTypesSource.includes('send: (content: string) => void'), true)
  assert.equal(chatUiTypesSource.includes('abort: () => Promise<void>'), true)
  assert.equal(chatUiTypesSource.includes('status: ReadonlyRef<ChatStatus>'), true)
  assert.equal(chatUiTypesSource.includes('lastError: ReadonlyRef<ChatErrorInfo | null>'), true)
  assert.equal(chatUiTypesSource.includes('retry: () => Promise<boolean>'), true)
  assert.equal(chatPageSource.includes('const props = defineProps<TrChatPageProps>()'), true)
  assert.equal(chatPageSource.includes('const emit = defineEmits<TrChatPageEmits>()'), true)
  assert.equal(chatPageSource.includes('defineSlots<TrChatPageSlots>()'), true)
  assert.equal(chatPageSource.includes('useAttrs()'), false)
  assert.equal(chatPageSource.includes('attrs[\'message-list-variant\']'), false)
  assert.equal(chatPageSource.includes('props.messageListVariant'), true)
  assert.equal(chatPageSource.includes('<ChatPageContent'), true)
  assert.equal(chatPageSource.includes('<ChatWorkspaceLayout'), true)
  assert.equal(chatPageSource.includes('v-if="isWorkspaceShell"'), true)
  assert.equal(
    chatPageSource.includes('<ChatHistory :enabled="historyInput?.enabled" :appearance="appearanceInput" />'),
    true,
  )
  assert.equal(chatSource.includes('<TrChatPage'), true)
  assert.equal(chatSource.includes('<slot :name="name" v-bind="slotProps ?? {}" />'), true)
})

await runTest('TrChat source keeps Root + Page explicit for target TrChatConfig while classifying compatibility callbacks as either supported lifecycle hooks or scaffold fallback', async () => {
  assert.equal(chatSource.includes('useTrChatConfigRuntimeResolution(() => props.config)'), true)
  assert.equal(chatSource.includes('<TrChatRoot :runtime="runtimeResolution.runtime" :ui="runtimeResolution.ui">'), true)
  assert.equal(chatSource.includes('<TrChatPage>'), true)
  assert.equal(chatRootTypesSource.includes('export type TrChatConfigEntryInput = TrChatConfig | string'), true)
  assert.equal(chatUiTypesSource.includes('config: TrChatConfigEntryInput'), true)
  assert.equal(chatUiTypesSource.includes('config: unknown'), false)
  assert.equal(chatIndexSource.includes('TrChatConfigEntryInput'), true)
  assert.equal(chatTypesIndexSource.includes('TrChatConfigEntryInput'), true)
  assert.equal(chatSource.includes('<ChatScaffold'), false)
  assert.equal(chatSource.includes('v-else'), false)
  assert.equal(trChatConfigEntrySource.includes('JSON.parse(value)'), true)
  assert.equal(trChatConfigEntrySource.includes('isTargetTrChatConfig(resolvedConfig)'), true)
  assert.equal(trChatConfigEntrySource.includes('stableSerialize'), true)
  assert.equal(trChatConfigEntrySource.includes('resolveTrChatConfigEntryInput'), true)
  assert.equal(trChatConfigEntrySource.includes('mergeLifecycleCompatibleCallbacks'), false)
  assert.equal(trChatConfigEntrySource.includes('hasUnsupportedBlackboxCallbacks'), false)
})

await runTest('root bootstrap source no longer provides internal scaffold context or runtime bridge hints', async () => {
  assert.equal(chatRootSource.includes('CHAT_SCAFFOLD_KEY'), false)
  assert.equal(chatRootSource.includes('provide(CHAT_SCAFFOLD_KEY'), false)
  assert.equal(sharedContextSource.includes('export const CHAT_SCAFFOLD_KEY'), false)
  assert.equal(sharedContextSource.includes('export function useChatScaffoldContext'), false)
  assert.equal(internalSource.includes('CHAT_SCAFFOLD_KEY'), false)
  assert.equal(internalSource.includes('useChatScaffoldContext'), false)
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
  assert.equal(chatPageContentSource.includes(':show="layoutInput?.show"'), true)
  assert.equal(chatPageSource.includes(':appearance="appearanceInput"'), true)
  assert.equal(chatPageSource.includes(':enabled="historyInput?.enabled"'), true)
  assert.equal(chatPageSource.includes(':compatibility-relay="false"'), false)
  assert.equal(chatPageSource.includes(':model-selector-input="modelSelectorInput"'), true)
  assert.equal(defaultHeaderRegionSource.includes(':compatibility-relay="false"'), false)
  assert.equal(defaultBodyRegionSource.includes(':compatibility-relay="false"'), false)
  assert.equal(defaultHeaderRegionSource.includes(':title="headerInput?.title"'), true)
  assert.equal(defaultHeaderRegionSource.includes(':shell="shell"'), true)
  assert.equal(chatHeaderSource.includes('useChatPageInputs'), true)
  assert.equal(chatHeaderSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatMessageListSource.includes('useChatPageInputs'), true)
  assert.equal(chatMessageListSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatWelcomeSource.includes('useChatPageInputs'), true)
  assert.equal(chatWelcomeSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatHistorySource.includes('useChatPageInputs'), true)
  assert.equal(chatHistorySource.includes('useChatScaffoldContext'), false)
  assert.equal(chatHeaderSource.includes('const headerInput = computed(() => pageInputs?.value.header)'), true)
  assert.equal(chatMessageListSource.includes('const messageListInput = computed(() => pageInputs?.value.messageList)'), true)
  assert.equal(chatWelcomeSource.includes('const welcomeInput = computed(() => pageInputs?.value.welcome)'), true)
  assert.equal(chatHistorySource.includes('const historyInput = computed(() => pageInputs?.value.history)'), true)
})

await runTest('leaf primitive prop types stay aligned with the currently supported explicit surface', async () => {
  assert.equal(chatUiTypesSource.includes('showClose?: boolean'), true)
  assert.equal(chatUiTypesSource.includes('shell?: ChatWorkspaceShellConfig'), true)
  assert.equal(chatUiTypesSource.includes("roleConfigs?: BubbleListProps['roleConfigs']"), true)
  assert.equal(chatUiTypesSource.includes('export type TrChatMessageListForwardedProps = Omit<'), true)
  assert.equal(chatUiTypesSource.includes('export type TrChatMessageListSlots = BubbleListSlots'), true)
  assert.equal(chatUiTypesSource.includes('bubbleListProps?: Partial<TrChatMessageListForwardedProps>'), true)
  assert.equal(chatUiTypesSource.includes("extensions?: SenderProps['extensions']"), true)
  assert.equal(chatUiTypesSource.includes('export type TrChatSenderForwardedProps = Omit<'), true)
  assert.equal(chatUiTypesSource.includes('senderProps?: Partial<TrChatSenderForwardedProps>'), true)
  assert.equal(chatUiTypesSource.includes('export interface TrChatHeaderEmits {'), true)
  assert.equal(chatUiTypesSource.includes("export interface TrChatHeaderSlots {"), true)
  assert.equal(chatUiTypesSource.includes('export interface TrChatHistoryProps {'), true)
  assert.equal(chatUiTypesSource.includes("title?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes("extra?: () => unknown"), true)
  assert.equal(chatUiTypesSource.includes('export interface TrChatWelcomeEmits {'), true)
  assert.equal(chatUiTypesSource.includes("export interface TrChatSenderSlots {"), true)
  assert.equal(chatUiTypesSource.includes("'footer-right'?: (props?: TrChatSenderFooterRightSlotProps) => unknown"), true)

  assert.equal(chatHeaderSource.includes('showClose: triStateBooleanProp'), true)
  assert.equal(chatHeaderSource.includes('shell: Object as PropType<ChatWorkspaceShellConfig | undefined>'), true)
  assert.equal(chatHeaderSource.includes('defineEmits<TrChatHeaderEmits>()'), true)
  assert.equal(chatHeaderSource.includes('defineSlots<TrChatHeaderSlots>()'), true)
  assert.equal(chatWelcomeSource.includes('const props = defineProps<TrChatWelcomeProps>()'), true)
  assert.equal(chatWelcomeSource.includes('const emit = defineEmits<TrChatWelcomeEmits>()'), true)
  assert.equal(chatHistorySource.includes('const props = defineProps<TrChatHistoryProps>()'), true)

  assert.equal(chatMessageListSource.includes("roleConfigs: null as unknown as PropType<BubbleListProps['roleConfigs']>"), true)
  assert.equal(chatMessageListSource.includes('defineSlots<TrChatMessageListSlots>()'), true)
  assert.equal(
    chatMessageListSource.includes(
      'bubbleListProps: Object as PropType<Partial<TrChatMessageListForwardedProps> | undefined>',
    ),
    true,
  )
  assert.equal(chatMessageListSource.includes('const bubbleListForwardedProps = computed(() => props.bubbleListProps ?? {})'), true)
  assert.equal(chatMessageListSource.includes('const bubbleListDomAttrs = computed(() =>'), true)
  assert.equal(chatMessageListSource.includes('const mergedBubbleListBindings = computed(() => ({'), true)
  assert.equal(chatMessageListSource.includes('Object.entries(attrs).filter(([name]) => isDomAttr(name))'), true)
  assert.equal(chatMessageListSource.includes('...attrs'), false)
  assert.equal(chatMessageListSource.includes('props.roleConfigs ?? bubbleConfig?.roleConfigs.value'), true)

  assert.equal(chatSenderSource.includes("extensions: null as unknown as PropType<SenderProps['extensions']>"), true)
  assert.equal(
    chatSenderSource.includes('senderProps: Object as PropType<Partial<TrChatSenderForwardedProps> | undefined>'),
    true,
  )
  assert.equal(chatSenderSource.includes('const senderForwardedProps = computed(() => props.senderProps ?? {})'), true)
  assert.equal(chatSenderSource.includes('const senderDomAttrs = computed(() =>'), true)
  assert.equal(chatSenderSource.includes('const forwardedSenderBindings = computed(() => ({'), true)
  assert.equal(chatSenderSource.includes('Object.entries(attrs).filter(([name]) => isDomAttr(name))'), true)
  assert.equal(chatSenderSource.includes('...attrs'), false)
  assert.equal(chatSenderSource.includes(':default-actions="senderDefaultActions"'), true)
  assert.equal(chatSenderSource.includes(':show-word-limit="senderWordCount"'), true)
  assert.equal(chatSenderSource.includes(':extensions="props.extensions"'), true)
  assert.equal(chatSenderSource.includes('defineSlots<TrChatSenderSlots>()'), true)
})

await runTest('chat provider source no longer reads scaffold shell directly once callers pass shell explicitly', async () => {
  assert.equal(chatProviderSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatProviderSource.includes('const shell = computed(() => props.shell)'), true)
})

await runTest('public provider source is narrowed to responseProvider while root keeps private chatKit bootstrap wiring internal', async () => {
  assert.equal(chatUiTypesSource.includes('type TrChatProviderPropsB'), false)
  assert.equal(chatCoreTypesSource.includes('type TrChatProviderTransportSource ='), true)
  assert.equal(chatCoreTypesSource.includes('export type TrChatProviderRuntimeOptions = TrChatProviderTransportSource & TrChatProviderRuntimeOptionsBase'), true)
  assert.equal(chatUiTypesSource.includes('export type TrChatProviderProps = TrChatProviderSharedProps & TrChatProviderRuntimeOptions'), true)
  assert.equal(chatCoreTypesSource.includes('export type ChatTransportAdapter = ResponseProvider'), true)
  assert.equal(chatUiTypesSource.includes('UseChatKitOptions'), false)
  assert.equal(providerResolutionSource.includes('const hasTransportAdapter ='), true)
  assert.equal(providerResolutionSource.includes('const hasResponseProvider ='), true)
  assert.equal(providerResolutionSource.includes('transportAdapter and responseProvider cannot be provided together'), true)
  assert.equal(providerResolutionSource.includes('const responseProvider = props.transportAdapter ?? props.responseProvider'), true)
  assert.equal(providerResolutionSource.includes("conditionalProp(props, 'chatKit')"), false)
  assert.equal(providerResolutionSource.includes('providedChatKit'), false)
  assert.equal(providerResolutionSource.includes('providerRuntimeOptions'), true)
  assert.equal(providerResolutionSource.includes('transportAdapter or responseProvider must be provided'), true)
  assert.equal(chatProviderSource.includes('resolveProviderRuntime'), true)
  assert.equal(chatProviderSource.includes('resolveProviderChatKit'), false)
  assert.equal(chatRootSource.includes('RootBootstrapProvider'), true)
  assert.equal(chatRootSource.includes('<ChatProvider'), false)
  assert.equal(rootBootstrapProviderSource.includes('provide(CHAT_KIT_KEY, props.chatKit)'), true)
})

await runTest('workspace layout source keeps mobile shell fallback on page or runtime owner inputs instead of raw scaffold presets', async () => {
  assert.equal(workspaceLayoutSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(workspaceLayoutSource.includes('const resolvedShell = computed(() => props.shell ?? runtimeShell.value)'), true)
  assert.equal(workspaceLayoutSource.includes('const resolvedAppearance = computed(() => props.appearance)'), true)
  assert.equal(workspaceLayoutSource.includes('useChatScaffoldContext'), false)
  assert.equal(workspaceLayoutSource.includes('presetSlices.value.shell.shell'), false)
  assert.equal(workspaceLayoutSource.includes('presetSlices.value.appearance.appearance'), false)
})

await runTest('public source advertises chat message action contracts for extension work', async () => {
  const retainedTypeExports = [
    'ChatBeforeSendInput',
    'ChatMessageActionContext',
    'ChatMessageActionDefinition',
    'ChatMessageActionsInput',
    'ChatMessageActionsMode',
    'ChatMessageActionPayload',
    'ChatMessageTransformChunkContext',
    'ChatMessageTransformFinishContext',
    'ChatMessageTransforms',
  ]

  retainedTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
    assert.equal(chatTypesIndexSource.includes(token), true)
  })

  assert.equal(chatIndexSource.includes('ChatBeforeSendInput'), true)
  assert.equal(chatTypesIndexSource.includes('ChatBeforeSendInput'), true)
  assert.equal(chatIndexSource.includes('ChatMessageActionFallbackRuntime'), false)
  assert.equal(chatTypesIndexSource.includes('ChatMessageActionFallbackRuntime'), false)
  assert.equal(chatCoreTypesSource.includes('export interface ChatMessageActionFallbackRuntime {'), false)
  assert.equal(chatCoreTypesSource.includes('fallbackRuntime?: ChatMessageActionFallbackRuntime | null'), false)
  assert.equal(chatCoreTypesSource.includes('chatKit?: UseChatKitReturn | null'), false)
  assert.equal(chatCoreTypesSource.includes('messageIds: string[]'), true)
})

await runTest('renamed provider-facing type exports stay visible through the public entrypoints', async () => {
  const topLevelTypeExports = [
    'ChatRuntimeInput',
    'TrChatConfig',
    'TrChatRootProps',
    'TrChatProviderProps',
    'TrChatProviderRuntimeOptions',
  ]

  topLevelTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), true)
  })

  const chatTypesExports = [
    'ChatRuntimeInput',
    'TrChatConfig',
    'TrChatRootProps',
    'TrChatProviderProps',
    'TrChatProviderRuntimeOptions',
    'TrChatProviderSharedProps',
  ]

  chatTypesExports.forEach((token) => {
    assert.equal(chatTypesIndexSource.includes(token), true)
  })

  assert.equal(chatIndexSource.includes('ChatConfigIntegrations'), false)
  assert.equal(chatIndexSource.includes('ChatPresetProviderSlice'), false)
  assert.equal(chatIndexSource.includes('ChatAdapter'), false)
  assert.equal(chatIndexSource.includes('ChatConfigDefaults'), false)
  assert.equal(chatIndexSource.includes('UseChatKitOptions'), false)
  assert.equal(chatIndexSource.includes('UseChatKitRuntimeBridge'), false)
  assert.equal(chatIndexSource.includes('UseChatKitReturn'), false)
  assert.equal(chatTypesIndexSource.includes('UseChatKitOptions'), false)
  assert.equal(chatTypesIndexSource.includes('UseChatKitRuntimeBridge'), false)
  assert.equal(chatTypesIndexSource.includes('UseChatKitReturn'), false)
})

await runTest('package root no longer promotes supporting helper types that lack public-consumer evidence', async () => {
  const removedRootTypeExports = [
    'ChatUIMessageMeta',
    'ChatUIMessagePart',
    'ChatUIMessageRole',
    'TrChatMessageListForwardedProps',
    'TrChatMessageListSlots',
    'TrChatPageBubbleSlotProps',
    'TrChatSenderFooterRightSlotProps',
    'TrChatSenderForwardedProps',
    'TrChatProviderSharedProps',
    'UseMessageResponseProvider',
    'ReadonlyRef',
  ]

  removedRootTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
})

await runTest('package root no longer promotes nested config and feature preset helper types as first-class imports', async () => {
  const removedConfigHelperTypeExports = [
    'TrChatPresetOverrides',
    'ChatAttachmentsFeaturePreset',
    'ChatAttachmentsListConfig',
    'ChatAttachmentsUploadConfig',
    'ChatSenderActionsFeaturePreset',
    'ChatSenderActionUploadConfig',
    'ChatSenderActionVoiceConfig',
    'WelcomeConfig',
    'ChatMessagesOverrides',
    'TrChatAttachmentsConfig',
    'TrChatConversationConfig',
    'TrChatHistoryConfig',
    'TrChatLifecycleConfig',
    'TrChatMessagesConfig',
    'TrChatRequestConfig',
    'TrChatRequestModel',
    'TrChatSenderConfig',
    'TrChatTransportConfig',
    'TrChatUiConfig',
    'TrChatWorkspaceConfig',
  ]

  removedConfigHelperTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })

  assert.equal(chatIndexSource.includes('ChatMessagesOverrides'), false)
  assert.equal(chatIndexSource.includes('CHAT_MESSAGES'), false)
  assert.equal(chatIndexSource.includes('resolveChatMessages'), false)
})

await runTest('package root no longer promotes supporting runtime and status types as first-class imports', async () => {
  const removedSupportingRuntimeTypeEntries = [
    '\n  BrandConfig,\n',
    '\n  ChatAttachmentsRuntime,\n',
    '\n  ChatConversationCreateInput,\n',
    '\n  ChatConversationRuntime,\n',
    '\n  ChatConversationSummary,\n',
    '\n  ChatErrorHandler,\n',
    '\n  ChatHistoryRuntime,\n',
    '\n  ChatMcpRuntime,\n',
    '\n  ChatMessageRuntime,\n',
    '\n  ChatMessageViewState,\n',
    '\n  ChatModelRuntime,\n',
    '\n  ChatRuntime,\n',
    '\n  ChatSenderRuntime,\n',
    '\n  ChatWorkspaceRegionRuntime,\n',
    '\n  ChatAppearanceConfig,\n',
    '\n  ChatAppearanceMode,\n',
    '\n  ChatMessageActionPlacement,\n',
    '\n  ChatStatus,\n',
    '\n  ChatErrorType,\n',
    '\n  ChatErrorInfo,\n',
    '\n  ChatMessageActionRole,\n',
    '\n  ChatBubbleRenderers,\n',
    '\n  ChatShellVariant,\n',
    '\n  ChatWorkspaceRegionCollapseMode,\n',
    '\n  ChatWorkspaceRegionConfig,\n',
    '\n  ChatWorkspaceRegionWidth,\n',
    '\n  ChatWorkspaceShellConfig,\n',
    '\n  ChatWorkspaceViewStateConfig,\n',
  ]

  removedSupportingRuntimeTypeEntries.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
})

await runTest('package root no longer promotes helper-specific manager types without public-consumer evidence', async () => {
  const removedHelperManagerTypeExports = ['UseMcpManagerBridge', 'UseMcpManagerOptions', 'UseMcpManagerReturn']

  removedHelperManagerTypeExports.forEach((token) => {
    assert.equal(chatIndexSource.includes(token), false)
  })
})

await runTest('public runtime sendMessage surface accepts optional attachments while structuredData remains sender-local', async () => {
  assert.equal(chatCoreTypesSource.includes('sendMessage: (content: string, options?: { attachments?: unknown[] }) => void'), true)
  assert.equal(chatCoreTypesSource.includes('sendMessageWithAttachments'), false)
  assert.equal(chatCoreTypesSource.includes('data?: StructuredData'), false)
  assert.equal(chatKitSource.includes('function sendMessage(content: string, options?: { attachments?: unknown[] }): void {'), true)
  assert.equal(chatKitSource.includes('sendMessageWithAttachments'), false)
  assert.equal(chatKitSource.includes('_data?: StructuredData'), false)
  assert.equal(chatSenderSource.includes('structuredData: data,'), true)
  assert.equal(chatSenderSource.includes('chatKit.sendMessage(payload.text)'), true)
})

await runTest('chat sender source prefers runtime-owned sender and attachment defaults before compatibility features', async () => {
  assert.equal(chatSenderSource.includes('const senderDefaults = computed(() => chatRuntime?.sender.defaults)'), true)
  assert.equal(chatSenderSource.includes('senderDefaults.value?.voice ?? senderActionsFeature.value?.voice'), true)
  assert.equal(chatSenderSource.includes('senderDefaults.value?.wordCount ?? senderActionsFeature.value?.wordCount'), true)
  assert.equal(chatSenderSource.includes('const uploadConfig ='), true)
  assert.equal(chatSenderSource.includes('runtimeUploadConfig.value ?? attachmentsContext?.feature.upload'), true)
  assert.equal(chatSenderSource.includes('?? senderActionsFeature.value?.upload'), true)
  assert.equal(chatSenderSource.includes('const hasAttachmentOwner = computed(() => Boolean(chatRuntime?.attachments || attachmentsContext))'), true)
  assert.equal(chatSenderSource.includes('senderDefaults.value?.mode'), true)
  assert.equal(chatSenderSource.includes('senderDefaults.value?.placeholder'), true)
  assert.equal(chatSenderSource.includes('senderDefaults.value?.maxLength'), true)
  assert.equal(chatSenderSource.includes('useChatScaffoldContext'), false)
  assert.equal(chatSenderSource.includes('senderSlice'), false)
  assert.equal(chatSenderSource.includes('fallbackSenderAttrs'), false)
})

await runTest('chat attachments source can fall back to runtime-owned pending attachments and list config without attachment feature context', async () => {
  assert.equal(chatAttachmentsSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(
    chatAttachmentsSource.includes(
      'attachmentsContext?.manager.items.value ?? chatRuntime?.sender.pendingAttachments.value ?? []',
    ),
    true,
  )
  assert.equal(
    chatAttachmentsSource.includes(
      'attachmentsContext?.feature.list ?? chatRuntime?.attachments?.listConfig?.value ?? {}',
    ),
    true,
  )
  assert.equal(chatAttachmentsSource.includes('chatRuntime?.sender.setPendingAttachments(items)'), true)
})

await runTest('chat feedback source can fall back to runtime-owned message actions when no explicit action config is passed', async () => {
  assert.equal(chatPageContentSource.includes('ChatDefaultBodyRegion'), true)
  const feedbackSource = readFileSync(
    fileURLToPath(new URL('../../src/components/feedback/useChatFeedback.ts', import.meta.url)),
    'utf8',
  )
  assert.equal(feedbackSource.includes('runtime?.message.config?.actionMode'), true)
  assert.equal(feedbackSource.includes('if (runtime?.message.getActions) {'), true)
  assert.equal(feedbackSource.includes('return runtime.message.getActions(actionContext.value) ?? []'), true)
})

await runTest('feedback owner-path source can fall back to runtime-owned feedback enablement without relying on page-input relay', async () => {
  assert.equal(defaultBodyRegionSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(
    defaultBodyRegionSource.includes(
      'props.messageListInput?.showFeedback ?? chatRuntime?.message.config?.feedback?.enabled ?? false',
    ),
    true,
  )
  assert.equal(chatFeedbackSource.includes('const feedbackEnabled = useRuntimeFeedbackEnabled({'), true)
  assert.equal(chatFeedbackSource.includes('enabled: props.enabled,'), true)
  assert.equal(chatFeedbackSource.includes('runtime: chatRuntime,'), true)
  assert.equal(chatFeedbackSource.includes('if (!feedbackEnabled.value) return false'), true)
})

await runTest('renderer owner-path source can fall back to runtime-owned renderer config before page-input relay', async () => {
  assert.equal(chatLayoutSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(chatLayoutSource.includes('const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)'), true)
  assert.equal(chatLayoutSource.includes('useChatPageInputs'), true)
  assert.equal(chatLayoutSource.includes('useChatScaffoldContext'), false)
  assert.equal(
    chatLayoutSource.includes('props.bubbleRenderers ?? chatRuntime?.message.config?.renderers ?? layoutInput.value?.bubbleRenderers'),
    true,
  )
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
  assert.equal(chatSource.includes('<TrChatPage'), true)
  assert.equal(defaultFooterRegionSource.includes('<slot name="footer-extra" />'), true)
  assert.equal(defaultFooterRegionSource.includes('<slot name="footer"'), false)
  assert.equal(defaultFooterRegionSource.includes('<ChatFooter v-else>'), true)
})

await runTest('default page footer and model selector source prefer explicit model owner inputs before page-input fallback', async () => {
  assert.equal(defaultFooterRegionSource.includes(':models="props.modelSelectorInput?.models"'), true)
  assert.equal(defaultFooterRegionSource.includes(':model-value="props.modelSelectorInput?.defaultModel"'), true)
  assert.equal(modelSelectorSource.includes('useChatPageInputs'), true)
  assert.equal(modelSelectorSource.includes('useChatScaffoldContext'), false)
  assert.equal(modelSelectorSource.includes('props.models ?? modelSelectorInput.value?.models ?? []'), true)
  assert.equal(modelSelectorSource.includes('modelValue.value ?? modelSelectorInput.value?.defaultModel ?? \'\''), true)
})

