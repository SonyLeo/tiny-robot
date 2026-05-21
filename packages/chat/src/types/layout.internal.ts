import type { ChatAsideLayoutMode, ChatAsidePlacement } from './layout'

// Runtime store types
export interface ChatLayoutPanelApi {
  placement: ChatAsidePlacement
  layoutMode: ChatAsideLayoutMode
  isExpanded: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  expandedWidth: string
  collapsedWidth: string
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ChatLayoutStore {
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}
