import type { VNode } from 'vue'

export type ChatPlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideCollapseEffect = 'overlay' | 'slide'
export type ChatSurfaceMode = 'embedded' | 'detached'

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
  placement: ChatPlacement
  width: number
}

export interface ChatDetachedBounds {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
}

export interface ChatDetachedResizeEventDetail {
  edge: ChatPlacement
  width: number
}

// Props
export interface ChatLayoutProps {
  /**
   * Controls how the chat surface is attached to the host layout.
   *
   * embedded: rendered within the host layout flow.
   * detached: rendered above the host layout and positioned independently.
   *
   * @default 'embedded'
   */
  surfaceMode?: ChatSurfaceMode
  detachedBounds?: ChatDetachedBounds
  detachedDraggable?: boolean
  detachedResizable?: boolean
  minDetachedWidth?: number | string
  maxDetachedWidth?: number | string
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatLayoutEmits {
  'update:surfaceMode': [value: ChatSurfaceMode | undefined]
  'update:detachedBounds': [value: ChatDetachedBounds | undefined]
  'update:leftAside': [value: ChatAsideConfig | undefined]
  'update:rightAside': [value: ChatAsideConfig | undefined]
  'detached-resize-start': [detail: ChatDetachedResizeEventDetail]
  'detached-resize': [detail: ChatDetachedResizeEventDetail]
  'detached-resize-end': [detail: ChatDetachedResizeEventDetail]
  'aside-resize-start': [detail: ChatAsideResizeEventDetail]
  'aside-resize': [detail: ChatAsideResizeEventDetail]
  'aside-resize-end': [detail: ChatAsideResizeEventDetail]
}

export interface ChatAsideProps {
  placement: ChatPlacement
  collapseEffect?: ChatAsideCollapseEffect
}

export interface ChatAsideToggleProps {
  placement: ChatPlacement
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
