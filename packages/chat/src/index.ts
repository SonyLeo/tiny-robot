// ===== 样式 =====
import './styles/index.css'

// ===== 主入口组件（同时挂载子组件）=====
import {
  Chat as TrChat,
  ChatScaffold as TrChatScaffold,
  ChatRoot as TrChatRoot,
  ChatLayout as TrChatLayout,
  ChatWorkspaceLayout as TrChatWorkspaceLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatAttachments as TrChatAttachments,
  ChatSender as TrChatSender,
  ChatFeedback as TrChatFeedback,
  ChatMcpPanel as TrChatMcpPanel,
} from './components/chat'
import { ChatHistory as TrChatHistory, ChatHistorySurface as TrChatHistorySurface } from './components/history'
import { McpTrigger as TrMcpTrigger } from './components/mcp-trigger'
import { ModelSelector as TrModelSelector } from './components/model-selector'
import { WorkspaceShell as TrChatWorkspaceShell } from './components/workspace'
import { ChatWorkspaceRightSheet as TrChatWorkspaceRightSheet } from './components/chat/workspace'

// 定义带子组件的 TrChat 类型
type TrChatWithSubComponents = typeof TrChat & {
  Scaffold: typeof TrChatScaffold
  Root: typeof TrChatRoot
  Layout: typeof TrChatLayout
  WorkspaceLayout: typeof TrChatWorkspaceLayout
  Header: typeof TrChatHeader
  Welcome: typeof TrChatWelcome
  MessageList: typeof TrChatMessageList
  Footer: typeof TrChatFooter
  Attachments: typeof TrChatAttachments
  Sender: typeof TrChatSender
  History: typeof TrChatHistory
  HistorySurface: typeof TrChatHistorySurface
  WorkspaceShell: typeof TrChatWorkspaceShell
  WorkspaceRightSheet: typeof TrChatWorkspaceRightSheet
}

// 挂载子组件到 TrChat 上，实现复合组件模式
const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Scaffold = TrChatScaffold
TrChatFull.Root = TrChatRoot
TrChatFull.Layout = TrChatLayout
TrChatFull.WorkspaceLayout = TrChatWorkspaceLayout
TrChatFull.Header = TrChatHeader
TrChatFull.Welcome = TrChatWelcome
TrChatFull.MessageList = TrChatMessageList
TrChatFull.Footer = TrChatFooter
TrChatFull.Attachments = TrChatAttachments
TrChatFull.Sender = TrChatSender
TrChatFull.History = TrChatHistory
TrChatFull.HistorySurface = TrChatHistorySurface
TrChatFull.WorkspaceShell = TrChatWorkspaceShell
TrChatFull.WorkspaceRightSheet = TrChatWorkspaceRightSheet

export { TrChatFull as TrChat }

// ===== Composable =====
export {
  useChatKit,
  useChatAttachments,
  useDefaultBubbleConfig,
  useMcpManager,
  useModelSelector,
  useChatFeedback,
  useFloatingDropdown,
  useKeyboardNavigation,
  useHistoryState,
  useSlotFilter,
} from './composables'

// ===== Render 组件（按需导入）=====
export {
  MarkStreamRenderer,
  ErrorRenderer,
  EditInputRenderer,
  ToolCallsRenderer,
  ToolCallRenderer,
  AttachmentsRenderer,
} from './components/render'

// ===== 新组件 =====
export {
  TrMcpTrigger,
  TrModelSelector,
  TrChatScaffold,
  TrChatFeedback,
  TrChatMcpPanel,
  TrChatLayout,
  TrChatWorkspaceLayout,
  TrChatAttachments,
  TrChatHistorySurface,
  TrChatWorkspaceShell,
  TrChatWorkspaceRightSheet,
}

// ===== Adapters =====
export { loadChatConfig, createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from './adapters'
export { CHAT_CAPABILITY_MANIFEST, createChatCapabilityManifest } from './capabilities'
export {
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  createChatCliCapabilitySurface,
} from './adapters'
export { CHAT_FEATURE_REGISTRY, resolveChatFeatures } from './features'
export { CHAT_MESSAGES, resolveChatMessages } from './messages'
export {
  resolveAgentPreset,
  applyAgentPresetToConfig,
  createChatAdapterFromAgentPreset,
  createPresetConsumptionFromAgentPreset,
} from './presets'
export { BUILT_IN_AGENT_PRESETS, BUILT_IN_SKILL_PACKS, getBuiltInAgentPreset, getBuiltInSkillPack } from './presets'

// ===== 类型 =====
export type {
  BrandConfig,
  ChatScaffoldCallbacks,
  ChatScaffoldRuntimeInput,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatAppearanceMode,
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ChatMessageActionPlacement,
  ResponseProvider,
  ChatStatus,
  ChatErrorType,
  ChatErrorInfo,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionRole,
  ChatMessageActionPayload,
  ChatMessageTransformChunkContext,
  ChatMessageTransformFinishContext,
  ChatMessageTransforms,
  ChatListVariant,
  UseChatKitOptions,
  UseChatKitRuntimeBridge,
  UseChatKitReturn,
  TrChatProps,
  TrChatRootProps,
  TrChatScaffoldProps,
  TrChatHeaderProps,
  TrChatWelcomeProps,
  TrChatMessageListProps,
  TrChatHistorySurfaceProps,
  TrChatPresetOverrides,
  TrChatSenderProps,
  ChatBubbleRenderers,
  ChatAttachmentsFeaturePreset,
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatSenderActionsFeaturePreset,
  ChatSenderActionUploadConfig,
  ChatSenderActionVoiceConfig,
  UseChatAttachmentsOptions,
  WelcomeConfig,
  ChatMessages,
  ChatMessagesOverrides,
  UseMessageResponseProvider,
  ModelOption,
  TrChatScaffoldContextValue,
  ChatShellVariant,
  ChatWorkspaceRegionCollapseMode,
  ChatWorkspaceRegionConfig,
  ChatWorkspaceRegionWidth,
  ChatWorkspaceShellConfig,
  ChatWorkspaceViewStateConfig,
  TrChatWorkspaceShellProps,
} from './types'
export type { UseDefaultBubbleConfigOptions } from './composables'
export type { UseMcpManagerBridge, UseMcpManagerOptions, UseModelSelectorOptions } from './composables'
export type { UseChatAttachmentsReturn } from './composables'
export type {
  ChatAdapter,
  ChatPresetAppearanceSlice,
  ChatCliCapabilitySurface,
  ChatCliConsumableFeatureKey,
  ChatCliConsumablePresetPropKey,
  ChatCliConsumablePresetSliceKey,
  ChatConfig,
  ChatConfigDefaults,
  ChatConfigRuntime,
  ChatLayoutConfig,
  ChatLayoutPlacementsConfig,
  ChatConfigModel,
  ChatConfigProvider,
  ChatConfigUI,
  ChatPresetProps,
  ChatPresetHeaderSlice,
  ChatPresetHistorySlice,
  ChatPresetLayoutSlice,
  ChatPresetMessageListSlice,
  ChatPresetModelSelectorSlice,
  ChatPresetRootSlice,
  ChatPresetShellSlice,
  ChatPresetSenderSlice,
  ChatPresetSlices,
  ChatPresetWelcomeSlice,
  OpenAICompatibleProviderConfig,
} from './adapters'
export type { ChatCapabilityManifest, ChatCapabilityCatalogEntry, ChatCapabilityPresetEntry } from './capabilities'
export type {
  ChatAttachmentsFeatureConfig,
  ChatAttachmentsFeatureResolution,
  BuiltInChatFeatureKey,
  ChatFeatureConfigMap,
  ChatFeatureInput,
  ChatMcpFeatureConfig,
  ChatMcpFeatureResolution,
  ChatFeaturePresetProps,
  ChatFeedbackFeatureConfig,
  ChatFeedbackFeatureResolution,
  ChatHistoryFeatureConfig,
  ChatHistoryFeatureOptions,
  ChatHistoryFeatureResolution,
  ChatSenderActionsFeatureConfig,
  ChatSenderActionsFeatureResolution,
  ChatWelcomePromptsFeatureConfig,
  ChatWelcomePromptsFeatureOptions,
  ChatWelcomePromptsFeatureResolution,
  ResolvedChatFeatures,
} from './features'
export type {
  AgentPresetConsumptionResult,
  AgentPresetInput,
  AgentPresetResolutionResult,
  AgentPresetRuntimeInput,
  AgentPresetUiInput,
  BuiltInAgentPresetId,
  BuiltInSkillPackId,
  CreatePresetConsumptionFromAgentPresetOptions,
  ApplyAgentPresetOptions,
  CreateChatAdapterFromAgentPresetOptions,
  ResolveAgentPresetOptions,
  ResolvedAgentPreset,
  SkillPackInput,
} from './presets'

// 从 iconMap 导出 KnownProvider 类型
export { KNOWN_PROVIDERS, type KnownProvider } from './utils/iconMap'

// 从 composables 导出类型
export type { UseMcpManagerReturn } from './composables'
