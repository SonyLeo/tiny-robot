import type { VNode } from 'vue'

export type ChatAsidePlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideClosedMode = 'rail' | 'hidden'
export type ChatAsideCollapseMode = 'overlay' | 'slide'

export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  closedMode?: ChatAsideClosedMode
  expandedWidth?: number | string
  collapsedWidth?: number | string
}

// Props
export interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatAsideProps {
  placement: ChatAsidePlacement
  collapseMode?: ChatAsideCollapseMode
}

export interface ChatAsideToggleProps {
  placement: ChatAsidePlacement
  ariaLabel?: string
}

// Slot props
export interface ChatAsideSlots {
  default?(slotProps: { isExpanded: boolean }): VNode[]
}

export interface ChatAsideToggleSlots {
  default?(slotProps: { isExpanded: boolean }): VNode[]
}

export interface ChatLayoutSlots {
  'left-aside'?: () => VNode[]
  header?: () => VNode[]
  main?: () => VNode[]
  footer?: () => VNode[]
  'right-aside'?: () => VNode[]
}
