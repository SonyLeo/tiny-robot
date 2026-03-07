// ===== 样式 =====
import './styles/index.less'

// ===== 黑盒组件（同时挂载白盒子组件）=====
import TrChat from './components/TrChat.vue'
import TrChatRoot from './components/TrChatRoot.vue'
import TrChatHeader from './components/TrChatHeader.vue'
import TrChatWelcome from './components/TrChatWelcome.vue'
import TrChatMessageList from './components/TrChatMessageList.vue'
import TrChatFooter from './components/TrChatFooter.vue'
import TrChatSender from './components/TrChatSender.vue'
import TrChatHistory from './components/TrChatHistory.vue'

// 定义带子组件的 TrChat 类型
type TrChatWithSubComponents = typeof TrChat & {
  Root: typeof TrChatRoot
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
TrChatFull.Header = TrChatHeader
TrChatFull.Welcome = TrChatWelcome
TrChatFull.MessageList = TrChatMessageList
TrChatFull.Footer = TrChatFooter
TrChatFull.Sender = TrChatSender
TrChatFull.History = TrChatHistory

export { TrChatFull as TrChat }

// ===== Composable =====
export { useChatKit } from './composables/useChatKit'

// ===== Providers =====
export { createOpenAIProvider } from './providers/openai'
export { createDeepSeekProvider } from './providers/deepseek'

// ===== 类型 =====
export type {
  BrandConfig,
  ResponseProvider,
  ChatStatus,
  UseChatKitOptions,
  UseChatKitReturn,
  TrChatProps,
  TrChatRootProps,
  TrChatHeaderProps,
  TrChatWelcomeProps,
  TrChatMessageListProps,
  TrChatSenderProps,
  WelcomeConfig,
  OpenAIProviderOptions,
  DeepSeekProviderOptions,
  UseMessageResponseProvider,
} from './types'
