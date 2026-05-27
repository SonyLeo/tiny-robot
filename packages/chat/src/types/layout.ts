import type { ComponentPublicInstance, VNode } from 'vue'

export type ChatPlacement = 'left' | 'right'
export type ChatAsideLayoutMode = 'dock' | 'drawer'
export type ChatAsideCollapseEffect = 'overlay' | 'slide'
export type ChatLayoutMode = 'normal' | 'floating'

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

export interface ChatFloatingConfig {
  x?: number
  y?: number
  width?: number | string
  height?: number | string
  draggable?: boolean
  resizable?: boolean
  minWidth?: number | string
  maxWidth?: number | string
}

export interface ChatFloatingResizeEventDetail {
  edge: ChatPlacement
  width: number
}

export type ChatMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type ChatMainScrollHost = HTMLElement | ChatMainScrollHostComponent | null | undefined

// Props
export interface ChatLayoutProps {
  /**
   * Controls whether the chat surface stays in layout flow or floats above it.
   *
   * normal: rendered within the host layout flow.
   * floating: rendered above the host layout and positioned independently.
   *
   * @default 'normal'
   */
  mode?: ChatLayoutMode
  floating?: ChatFloatingConfig
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}

export interface ChatLayoutEmits {
  'update:mode': [value: ChatLayoutMode | undefined]
  'update:floating': [value: ChatFloatingConfig | undefined]
  'update:leftAside': [value: ChatAsideConfig | undefined]
  'update:rightAside': [value: ChatAsideConfig | undefined]
  'floating-resize-start': [detail: ChatFloatingResizeEventDetail]
  'floating-resize': [detail: ChatFloatingResizeEventDetail]
  'floating-resize-end': [detail: ChatFloatingResizeEventDetail]
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

export interface ChatMainProps {
  /**
   * The only real scroll host inside Chat.Main.
   * The resolved element should provide its own overflow and sizing styles.
   */
  scrollHost: ChatMainScrollHost
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
