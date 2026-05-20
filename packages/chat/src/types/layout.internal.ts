import type { VNode } from 'vue'
import type {
  ChatAsideClosedMode,
  ChatAsideLayoutMode,
  ChatAsidePlacement,
  ChatAsideSlotProps,
  ChatAsideToggleSlotProps,
} from './layout'

// Slot helpers
export interface ChatAsideSlots {
  default?(slotProps: ChatAsideSlotProps): VNode[]
}

export interface ChatAsideToggleSlots {
  default?(slotProps: ChatAsideToggleSlotProps): VNode[]
}

export interface ChatLayoutSlots {
  'left-aside'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-aside'?: () => VNode[]
}

// Runtime store types
export interface ChatLayoutPanelApi {
  placement: ChatAsidePlacement
  layoutMode: ChatAsideLayoutMode
  closedMode: ChatAsideClosedMode
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
