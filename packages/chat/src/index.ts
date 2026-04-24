import './styles/index.css'

import {
  Chat as TrChat,
  ChatProvider as TrChatProvider,
  ChatLayout as TrChatLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatSender as TrChatSender,
} from './components/core'
import { TrChatRoot } from './root'
import { TrChatPage } from './page'
import {
  ChatWorkspaceLayout as TrChatWorkspaceLayout,
  WorkspaceShell as TrChatWorkspaceShell,
  ChatWorkspaceRightSheet as TrChatWorkspaceRightSheet,
} from './components/workspace'
import { ChatAttachments as TrChatAttachments } from './components/attachments'
import { ChatFeedback as TrChatFeedback } from './components/feedback'
import { ChatHistory as TrChatHistory } from './components/history'
import { ChatMcpPanel as TrChatMcpPanel, McpTrigger as TrMcpTrigger } from './components/mcp'
import { ModelSelector as TrModelSelector } from './components/model-selector'

type TrChatWithSubComponents = typeof TrChat & {
  Root: typeof TrChatRoot
  Page: typeof TrChatPage
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
  WorkspaceShell: typeof TrChatWorkspaceShell
  WorkspaceRightSheet: typeof TrChatWorkspaceRightSheet
}

const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Root = TrChatRoot
TrChatFull.Page = TrChatPage
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
TrChatFull.WorkspaceShell = TrChatWorkspaceShell
TrChatFull.WorkspaceRightSheet = TrChatWorkspaceRightSheet

export { TrChatFull as TrChat }
export { TrChatRoot, TrChatPage }

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
  TrChatFeedback,
  TrChatMcpPanel,
  TrChatLayout,
  TrChatWorkspaceLayout,
  TrChatAttachments,
  TrChatWorkspaceShell,
  TrChatWorkspaceRightSheet,
}

export { createRuntimeFromConfig, CHAT_FEATURE_REGISTRY, resolveChatFeatures } from './runtime/config'
export { CHAT_MESSAGES, resolveChatMessages } from './shared/messages'

export type {
  BrandConfig,
  ChatAttachmentsRuntime,
  ChatBeforeSendHandler,
  ChatConversationCreateInput,
  ChatConversationRuntime,
  ChatConversationSummary,
  ChatErrorHandler,
  ChatHistoryRuntime,
  ChatMcpRuntime,
  ChatMessageRuntime,
  ChatMessageViewState,
  ChatModelRuntime,
  ChatRuntime,
  ChatRuntimeInput,
  ChatSenderRuntime,
  ChatSendInput,
  ChatUIMessage,
  ChatUIMessageMeta,
  ChatUIMessagePart,
  ChatUIMessageRole,
  ChatWorkspaceRegionRuntime,
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
  TrChatProviderRuntimeOptions,
  TrChatProps,
  TrChatProviderProps,
  TrChatHeaderProps,
  TrChatWelcomeProps,
  TrChatMessageListProps,
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
  CreateRuntimeFromConfigResult,
  ReadonlyRef,
  TrChatAttachmentsConfig,
  TrChatConfig,
  TrChatConversationConfig,
  TrChatHistoryConfig,
  TrChatLifecycleConfig,
  TrChatMessagesConfig,
  TrChatRequestConfig,
  TrChatRequestModel,
  TrChatRootProps,
  TrChatRootUiConfig,
  TrChatSenderConfig,
  TrChatTransportConfig,
  TrChatUiConfig,
  TrChatWorkspaceConfig,
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
