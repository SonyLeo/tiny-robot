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
} as const
