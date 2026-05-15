import type { Ref, VNode } from 'vue'

export interface ChatRootProps {
  mobileBreakpoint?: number
  defaultLeftPanelOpen?: boolean
  defaultRightPanelOpen?: boolean
}

export interface ChatLayoutProps {
  leftPanelWidth?: number
  leftRailWidth?: number
  rightPanelWidth?: number
  mobileLeftPanelWidth?: number | string
  mobileRightPanelWidth?: number | string
  contentMaxWidth?: number | string
  transitionDuration?: string
}

export interface ChatPanelToggleProps {
  ariaLabel?: string
}

export interface ChatLeftPanelSlotProps {
  isMobile: boolean
  open: boolean
  collapsed: boolean
}

export interface ChatRightPanelSlotProps {
  isMobile: boolean
  open: boolean
}

export interface ChatLayoutSlots {
  'left-panel'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-panel'?: () => VNode[]
}

export interface ChatLayoutStore {
  leftPanelOpen: Readonly<Ref<boolean>>
  leftDrawerOpen: Readonly<Ref<boolean>>
  leftPanelVisible: Readonly<Ref<boolean>>
  rightPanelOpen: Readonly<Ref<boolean>>
  isMobile: Readonly<Ref<boolean>>
  mobileBreakpoint: Readonly<Ref<number>>
  setLeftPanelOpen: (value: boolean) => void
  toggleLeftPanel: () => void
  setLeftDrawerOpen: (value: boolean) => void
  toggleLeftDrawer: () => void
  setRightPanelOpen: (value: boolean) => void
  toggleRightPanel: () => void
  closeOverlayPanels: () => void
}

export interface ChatLayoutConfig {
  leftRailWidth: Readonly<Ref<number>>
}
