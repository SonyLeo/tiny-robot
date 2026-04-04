import './styles/index.css'

import {
  Chat as TrChat,
  ChatScaffold as TrChatScaffold,
  ChatProvider as TrChatProvider,
  ChatLayout as TrChatLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatSender as TrChatSender,
} from './components/core'
import {
  ChatWorkspaceLayout as TrChatWorkspaceLayout,
  WorkspaceShell as TrChatWorkspaceShell,
  ChatWorkspaceRightSheet as TrChatWorkspaceRightSheet,
} from './components/workspace'
import { ChatAttachments as TrChatAttachments } from './components/attachments'
import { ChatFeedback as TrChatFeedback } from './components/feedback'
import { ChatHistory as TrChatHistory, ChatHistorySurface as TrChatHistorySurface } from './components/history'
import { ChatMcpPanel as TrChatMcpPanel, McpTrigger as TrMcpTrigger } from './components/mcp'
import { ModelSelector as TrModelSelector } from './components/model-selector'

type TrChatWithSubComponents = typeof TrChat & {
  Scaffold: typeof TrChatScaffold
  Provider: typeof TrChatProvider
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

const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Scaffold = TrChatScaffold
TrChatFull.Provider = TrChatProvider
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

export { useChatKit } from './runtime/chat-kit/useChatKit'
export { useChatAttachments } from './components/attachments/useChatAttachments'
export { useDefaultBubbleConfig } from './components/core/useDefaultBubbleConfig'
export { useMcpManager } from './components/mcp/useMcpManager'
export { useModelSelector } from './components/model-selector/useModelSelector'
export { useChatFeedback } from './components/feedback/useChatFeedback'
export { useFloatingDropdown } from './components/model-selector/useFloatingDropdown'
export { useKeyboardNavigation } from './components/model-selector/useKeyboardNavigation'
export { useHistoryState } from './components/history/useHistoryState'
export { useSlotFilter } from './components/core/useSlotFilter'

export {
  MarkStreamRenderer,
  ErrorRenderer,
  EditInputRenderer,
  ToolCallsRenderer,
  ToolCallRenderer,
  AttachmentsRenderer,
} from './components/renderers'

export {
  TrMcpTrigger,
  TrModelSelector,
  TrChatProvider,
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

export {
  loadChatConfig,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  CHAT_FEATURE_REGISTRY,
  resolveChatFeatures,
} from './runtime/config'
export { CHAT_MESSAGES, resolveChatMessages } from './shared/messages'

export type {
  BrandConfig,
  ChatScaffoldCallbacks,
  ChatBeforeSendPayload,
  ChatBeforeSendResult,
  TrChatRuntimeInput,
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
  TrChatProviderProps,
  TrChatScaffoldProps,
  TrChatHeaderProps,
  TrChatWelcomeProps,
  TrChatMessageListProps,
  TrChatHistorySurfaceProps,
  TrChatPresetOverrides,
  TrChatSenderProps,
  TrChatProviderSharedProps,
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
export type { UseDefaultBubbleConfigOptions } from './components/core/useDefaultBubbleConfig'
export type { UseMcpManagerBridge, UseMcpManagerOptions, UseMcpManagerReturn } from './components/mcp/useMcpManager'
export type { UseModelSelectorOptions } from './components/model-selector/useModelSelector'
export type { UseChatAttachmentsReturn } from './components/attachments/useChatAttachments'
export type {
  ChatAdapter,
  ChatPresetAppearanceSlice,
  ChatConfig,
  ChatConfigDefaults,
  ChatConfigIntegrations,
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
  ChatPresetProviderSlice,
  ChatPresetShellSlice,
  ChatPresetSenderSlice,
  ChatPresetSlices,
  ChatPresetWelcomeSlice,
  OpenAICompatibleProviderConfig,
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
} from './runtime/config'

export { KNOWN_PROVIDERS, type KnownProvider } from './shared/utils/iconMap'
