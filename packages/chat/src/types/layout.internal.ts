import type { Ref, VNode } from 'vue'
import type { ChatAsideSlotProps, ChatAsideState, ChatAsideToggleSlotProps } from './layout'

// Slot helpers
export interface ChatAsideSlots {
  default?(slotProps: ChatAsideSlotProps): VNode[]
}

export interface ChatAsideToggleSlots {
  default?(slotProps: ChatAsideToggleSlotProps): VNode[]
}

export interface ChatLayoutSlots {
  'left-sidebar'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-panel'?: () => VNode[]
}

// Runtime store types
export interface ChatLayoutPanelApi {
  state: Readonly<Ref<ChatAsideState>>
  isOpen: Readonly<Ref<boolean>>
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ChatLayoutStore {
  isMobile: Readonly<Ref<boolean>>
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  closeOverlays: () => void
}
