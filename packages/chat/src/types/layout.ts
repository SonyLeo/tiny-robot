import type { VNode } from 'vue'

export type ChatAsidePlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideCollapseEffect = 'overlay' | 'slide'
export type ChatSurfaceMode = 'fullscreen' | 'floating' | 'edge-right'

export interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
  resizable?: boolean
  minExpandedWidth?: number | string
  maxExpandedWidth?: number | string
}

export interface ChatAsideResizeEventDetail {
  placement: ChatAsidePlacement
  width: number
}

export interface ChatSurfaceRect {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface ChatSurfaceConfig {
  mode?: ChatSurfaceMode
  draggable?: boolean
  floatingRect?: ChatSurfaceRect
  edgeWidth?: number | string
  snapThreshold?: number
}

// Props
export interface ChatLayoutProps {
  surface?: ChatSurfaceConfig
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatLayoutEmits {
  'update:surface': [value: ChatSurfaceConfig | undefined]
  'aside-resize-start': [detail: ChatAsideResizeEventDetail]
  'aside-resize': [detail: ChatAsideResizeEventDetail]
  'aside-resize-end': [detail: ChatAsideResizeEventDetail]
}

export interface ChatAsideProps {
  placement: ChatAsidePlacement
  collapseEffect?: ChatAsideCollapseEffect
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
