export type ChatAsidePlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideClosedMode = 'rail' | 'hidden'

export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  closedMode?: ChatAsideClosedMode
  expandedWidth?: number | string
  collapsedWidth?: number | string
}

// Props
export interface ChatLayoutProps {
  asideLayoutMode?: ChatAsideLayoutMode
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatAsideProps {
  placement: ChatAsidePlacement
}

export interface ChatAsideToggleProps {
  placement: ChatAsidePlacement
  ariaLabel?: string
}

// Slot props
export interface ChatAsideSlotProps {
  isExpanded: boolean
}

export interface ChatAsideToggleSlotProps {
  isExpanded: boolean
}
