import { ChatAside, ChatAsideToggle, ChatFooter, ChatHeader, ChatLayout, ChatMain, ChatRoot } from './layout'
import { ChatConversationPanel, ChatHistoryList, ChatSenderPanel, ChatSidebarPanel, ChatTopbar } from './ui'

export const Chat = {
  Root: ChatRoot,
  Layout: ChatLayout,
  Header: ChatHeader,
  Main: ChatMain,
  Footer: ChatFooter,
  Aside: ChatAside,
  AsideToggle: ChatAsideToggle,
  Topbar: ChatTopbar,
  SidebarPanel: ChatSidebarPanel,
  HistoryList: ChatHistoryList,
  ConversationPanel: ChatConversationPanel,
  SenderPanel: ChatSenderPanel,
} as const
