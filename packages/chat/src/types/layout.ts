// State
export type ChatAsideSide = 'left' | 'right'
export type ChatAsideState = 'hidden' | 'collapsed' | 'expanded' | 'overlay'
export type ChatDesktopAsideState = Exclude<ChatAsideState, 'overlay'>
export type ChatAsideRestingState = Extract<ChatDesktopAsideState, 'collapsed' | 'hidden'>

// Props
export interface ChatAsideConfig {
  defaultState?: ChatDesktopAsideState
  restingState?: ChatAsideRestingState
}

export interface ChatLayoutA11yProps {
  backdropLabel?: string
  leftPanelLabel?: string
  rightPanelLabel?: string
}

export interface ChatLayoutProps {
  mobileBreakpoint?: number
  left?: ChatAsideConfig
  right?: ChatAsideConfig
  a11y?: ChatLayoutA11yProps
}

export interface ChatAsideProps {
  side: ChatAsideSide
}

export interface ChatAsideToggleProps {
  side: ChatAsideSide
  ariaLabel?: string
}

// Slot props
export interface ChatAsideSlotProps {
  state: ChatAsideState
  isMobile: boolean
  isOpen: boolean
}

export interface ChatAsideToggleSlotProps {
  isOpen: boolean
}
