// ===== 样式 =====
import './styles/index.css'

// ===== 黑盒组件（同时挂载白盒子组件）=====
import {
  Chat as TrChat,
  ChatRoot as TrChatRoot,
  ChatLayout as TrChatLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatSender as TrChatSender,
  ChatFeedback as TrChatFeedback,
  ChatMcpPanel as TrChatMcpPanel,
} from './components/chat'
import { ChatHistory as TrChatHistory } from './components/history'
import { ModelSelector as TrModelSelector } from './components/model-selector'

// 定义带子组件的 TrChat 类型
type TrChatWithSubComponents = typeof TrChat & {
  Root: typeof TrChatRoot
  Layout: typeof TrChatLayout
  Header: typeof TrChatHeader
  Welcome: typeof TrChatWelcome
  MessageList: typeof TrChatMessageList
  Footer: typeof TrChatFooter
  Sender: typeof TrChatSender
  History: typeof TrChatHistory
}

// 挂载白盒子组件到 TrChat 上，实现复合组件模式
const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Root = TrChatRoot
TrChatFull.Layout = TrChatLayout
TrChatFull.Header = TrChatHeader
TrChatFull.Welcome = TrChatWelcome
TrChatFull.MessageList = TrChatMessageList
TrChatFull.Footer = TrChatFooter
TrChatFull.Sender = TrChatSender
TrChatFull.History = TrChatHistory

export { TrChatFull as TrChat }

// ===== Composable =====
export {
  useChatKit,
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
export { TrModelSelector, TrChatFeedback, TrChatMcpPanel, TrChatLayout }

// ===== Providers =====
export { matchProvider, createOpenAIFactory, createDeepSeekFactory } from './providers/factories'
export { createOpenAIProvider } from './providers/openai'
export { createDeepSeekProvider } from './providers/deepseek'
export { createServerProxyProvider, createServerProxyFactory } from './providers/serverProxy'

// ===== Adapters =====
export { loadChatConfig, createChatAdapterFromConfig, createPresetChatProps } from './adapters'
export { CHAT_MESSAGES } from './messages'

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
  WelcomeConfig,
  ChatMessages,
  OpenAIProviderOptions,
  DeepSeekProviderOptions,
  UseMessageResponseProvider,
  ModelOption,
  ModelProviderFactory,
  ProviderFactoryCreator,
} from './types'
export type { UseDefaultBubbleConfigOptions } from './composables'
export type { UseMcpManagerBridge, UseMcpManagerOptions, UseModelSelectorOptions } from './composables'
export type {
  ChatAdapter,
  ChatConfig,
  ChatConfigDefaults,
  ChatConfigModel,
  ChatConfigProvider,
  ChatConfigUI,
  ChatPresetProps,
  OpenAICompatibleProviderConfig,
} from './adapters'

// 从 iconMap 导出 KnownProvider 类型
export { KNOWN_PROVIDERS, type KnownProvider } from './utils/iconMap'

// 从 composables 导出类型
export type { UseMcpManagerReturn } from './composables'
