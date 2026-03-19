// ===== 样式 =====
import './styles/index.css'

// ===== 黑盒组件（同时挂载白盒子组件）=====
import {
  Chat as TrChat,
  ChatRoot as TrChatRoot,
  ChatPresetRoot as TrChatPresetRoot,
  ChatLayout as TrChatLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatAttachments as TrChatAttachments,
  ChatSender as TrChatSender,
  ChatFeedback as TrChatFeedback,
  ChatMcpPanel as TrChatMcpPanel,
} from './components/chat'
import { ChatHistory as TrChatHistory } from './components/history'
import { ModelSelector as TrModelSelector } from './components/model-selector'
import {
  WorkspaceShell as TrChatWorkspaceShell,
  WorkspacePanelHost as TrChatWorkspacePanelHost,
} from './components/workspace'

// 定义带子组件的 TrChat 类型
type TrChatWithSubComponents = typeof TrChat & {
  Root: typeof TrChatRoot
  PresetRoot: typeof TrChatPresetRoot
  Layout: typeof TrChatLayout
  Header: typeof TrChatHeader
  Welcome: typeof TrChatWelcome
  MessageList: typeof TrChatMessageList
  Footer: typeof TrChatFooter
  Attachments: typeof TrChatAttachments
  Sender: typeof TrChatSender
  History: typeof TrChatHistory
  WorkspaceShell: typeof TrChatWorkspaceShell
  WorkspacePanelHost: typeof TrChatWorkspacePanelHost
}

// 挂载白盒子组件到 TrChat 上，实现复合组件模式
const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Root = TrChatRoot
TrChatFull.PresetRoot = TrChatPresetRoot
TrChatFull.Layout = TrChatLayout
TrChatFull.Header = TrChatHeader
TrChatFull.Welcome = TrChatWelcome
TrChatFull.MessageList = TrChatMessageList
TrChatFull.Footer = TrChatFooter
TrChatFull.Attachments = TrChatAttachments
TrChatFull.Sender = TrChatSender
TrChatFull.History = TrChatHistory
TrChatFull.WorkspaceShell = TrChatWorkspaceShell
TrChatFull.WorkspacePanelHost = TrChatWorkspacePanelHost

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
  TrModelSelector,
  TrChatFeedback,
  TrChatMcpPanel,
  TrChatLayout,
  TrChatAttachments,
  TrChatPresetRoot,
  TrChatWorkspaceShell,
  TrChatWorkspacePanelHost,
}

// ===== Providers =====
export { matchProvider, createOpenAIFactory, createDeepSeekFactory } from './providers/factories'
export { createOpenAIProvider } from './providers/openai'
export { createDeepSeekProvider } from './providers/deepseek'
export { createServerProxyProvider, createServerProxyFactory } from './providers/serverProxy'

// ===== Adapters =====
export { loadChatConfig, createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from './adapters'
export {
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  createChatCliCapabilitySurface,
} from './adapters'
export { CHAT_FEATURE_REGISTRY, resolveChatFeatures } from './features'
export { CHAT_MESSAGES } from './messages'
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
  ResponseProvider,
  ChatStatus,
  ChatErrorType,
  ChatErrorInfo,
  ChatMessageActionPayload,
  ChatListVariant,
  UseChatKitOptions,
  UseChatKitReturn,
  TrChatProps,
  TrChatRootProps,
  TrChatHeaderProps,
  TrChatWelcomeProps,
  TrChatMessageListProps,
  TrChatSenderProps,
  ChatAttachmentsFeaturePreset,
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatSenderActionsFeaturePreset,
  ChatSenderActionUploadConfig,
  ChatSenderActionVoiceConfig,
  UseChatAttachmentsOptions,
  WelcomeConfig,
  ChatMessages,
  OpenAIProviderOptions,
  DeepSeekProviderOptions,
  UseMessageResponseProvider,
  ModelOption,
  ModelProviderFactory,
  ProviderFactoryCreator,
  ChatWorkspaceRegionKey,
  ChatWorkspacePanelWidth,
  ChatWorkspaceBuiltInPanelKind,
  ChatWorkspaceComposerDockMode,
  ChatWorkspacePanelDefinition,
  ChatWorkspacePanelHostItem,
  ChatWorkspaceRegionConfig,
  ChatWorkspaceShellTopBarConfig,
  ChatWorkspaceCenterLayoutConfig,
  ChatWorkspaceViewStateConfig,
  ChatWorkspaceShellConfig,
  TrChatWorkspaceShellProps,
  TrChatWorkspacePanelHostProps,
} from './types'
export type { UseDefaultBubbleConfigOptions } from './composables'
export type { UseMcpManagerBridge, UseMcpManagerOptions, UseModelSelectorOptions } from './composables'
export type { UseChatAttachmentsReturn } from './composables'
export type {
  ChatAdapter,
  ChatCliCapabilitySurface,
  ChatCliConsumableFeatureKey,
  ChatCliConsumablePresetPropKey,
  ChatCliConsumablePresetSliceKey,
  ChatConfig,
  ChatConfigDefaults,
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
  ChatPresetSenderSlice,
  ChatPresetSlices,
  ChatPresetWelcomeSlice,
  OpenAICompatibleProviderConfig,
} from './adapters'
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
