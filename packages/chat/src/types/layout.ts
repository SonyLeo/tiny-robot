import type { Ref, VNode } from 'vue'

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
  transitionDuration?: string
  overlayBackdropAriaLabel?: string
  mobileLeftSidebarAriaLabel?: string
  mobileRightPanelAriaLabel?: string
}

export interface ChatPanelToggleProps {
  ariaLabel?: string
}

export type ChatPanelSide = 'left' | 'right'
export type ChatLeftSidebarMode = 'open' | 'rail' | 'drawer'
export type ChatRightPanelMode = 'panel' | 'drawer'

export interface ChatPanelToggleSlotProps {
  expanded: boolean
  isMobile: boolean
  side: ChatPanelSide
}

export interface ChatPanelToggleSlots {
  default?(slotProps: ChatPanelToggleSlotProps): VNode[]
}

export interface ChatLeftSidebarSlotProps {
  isMobile: boolean
  open: boolean
  collapsed: boolean
  mode: ChatLeftSidebarMode
}

export interface ChatLeftSidebarSlots {
  default?(slotProps: ChatLeftSidebarSlotProps): VNode[]
}

export interface ChatRightPanelSlotProps {
  isMobile: boolean
  open: boolean
  mode: ChatRightPanelMode
}

export interface ChatRightPanelSlots {
  default?(slotProps: ChatRightPanelSlotProps): VNode[]
}

export interface ChatLayoutSlots {
  'left-sidebar'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-panel'?: () => VNode[]
}

export interface ChatLayoutStore {
  leftSidebarOpen: Readonly<Ref<boolean>>
  leftDrawerOpen: Readonly<Ref<boolean>>
  leftSidebarVisible: Readonly<Ref<boolean>>
  rightPanelOpen: Readonly<Ref<boolean>>
  isMobile: Readonly<Ref<boolean>>
  mobileBreakpoint: Readonly<Ref<number>>
  setLeftSidebarOpen: (value: boolean) => void
  toggleLeftSidebar: () => void
  setLeftDrawerOpen: (value: boolean) => void
  toggleLeftDrawer: () => void
  setRightPanelOpen: (value: boolean) => void
  toggleRightPanel: () => void
  closeOverlayPanels: () => void
}

export interface ChatLayoutConfig {
  leftRailWidth: Readonly<Ref<number>>
}
