import {
  ChatFooter,
  ChatHeader,
  ChatLayout,
  ChatLeftPanel,
  ChatLeftPanelToggle,
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
  LeftPanel: ChatLeftPanel,
  LeftPanelToggle: ChatLeftPanelToggle,
  RightPanel: ChatRightPanel,
  RightPanelToggle: ChatRightPanelToggle,
} as const
