import type { ComputedRef, Ref, VNode } from 'vue'

export interface ChatRootProps {
  mobileBreakpoint?: number
  defaultLeftSidebarOpen?: boolean
  defaultRightPanelOpen?: boolean
}

export interface ChatLayoutProps {
  leftSidebarWidth?: number
  leftRailWidth?: number
  rightPanelWidth?: number
  mobileLeftSidebarWidth?: number | string
  mobileRightPanelWidth?: number | string
  contentMaxWidth?: number | string
  overlayBackdropAriaLabel?: string
  mobileLeftSidebarAriaLabel?: string
  mobileRightPanelAriaLabel?: string
}

export type ChatAsideSide = 'left' | 'right'
export type ChatAsideState = 'hidden' | 'collapsed' | 'expanded' | 'overlay'
export type ChatAsideMode = 'panel' | 'collapsed' | 'drawer'

export interface ChatAsideProps {
  side: ChatAsideSide
}

export interface ChatAsideSlotProps {
  side: ChatAsideSide
  state: ChatAsideState
  isMobile: boolean
  isOpen: boolean
  collapsed: boolean
  mode: ChatAsideMode
}

export interface ChatAsideSlots {
  default?(slotProps: ChatAsideSlotProps): VNode[]
}

export interface ChatAsideToggleProps {
  side: ChatAsideSide
  ariaLabel?: string
}

export interface ChatAsideToggleSlotProps {
  isOpen: boolean
  isMobile: boolean
  side: ChatAsideSide
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

export interface ChatLayoutViewport {
  isMobile: Readonly<Ref<boolean>>
  mobileBreakpoint: Readonly<Ref<number>>
}

export interface ChatAsideController {
  state: Readonly<ComputedRef<ChatAsideState>>
  isOpen: Readonly<ComputedRef<boolean>>
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ChatLayoutStore {
  viewport: ChatLayoutViewport
  left: ChatAsideController
  right: ChatAsideController
  closeOverlays: () => void
}
