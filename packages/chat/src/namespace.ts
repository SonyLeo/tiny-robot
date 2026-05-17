import {
  ChatFooter,
  ChatHeader,
  ChatLayout,
  ChatLeftSidebar,
  ChatLeftSidebarToggle,
  ChatMain,
  ChatRightPanel,
  ChatRightPanelToggle,
  ChatRoot,
} from './layout'
import { ChatConversationPanel, ChatHistoryList, ChatSenderPanel, ChatSidebarPanel, ChatTopbar } from './ui'

export const Chat = {
  Root: ChatRoot,
  Layout: ChatLayout,
  Header: ChatHeader,
  Main: ChatMain,
  Footer: ChatFooter,
  LeftSidebar: ChatLeftSidebar,
  LeftSidebarToggle: ChatLeftSidebarToggle,
  RightPanel: ChatRightPanel,
  RightPanelToggle: ChatRightPanelToggle,
  Topbar: ChatTopbar,
  SidebarPanel: ChatSidebarPanel,
  HistoryList: ChatHistoryList,
  ConversationPanel: ChatConversationPanel,
  SenderPanel: ChatSenderPanel,
} as const
