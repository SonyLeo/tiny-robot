import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutLength = number | string
export type LayoutRailWidth = number | `${number}px`

export interface LayoutAsideConfig {
  layoutMode?: LayoutAsideMode
  expanded?: boolean
  expandedWidth?: LayoutLength
  collapsedWidth?: LayoutRailWidth
  resizable?: boolean
  minExpandedWidth?: LayoutLength
  maxExpandedWidth?: LayoutLength
}

export interface LayoutAsideResizeEventDetail {
  placement: LayoutPlacement
  width: number
}

export interface LayoutFloatingConfig {
  x?: number
  y?: number
  width?: LayoutLength
  height?: LayoutLength
  draggable?: boolean
  resizable?: boolean
  minWidth?: LayoutLength
  maxWidth?: LayoutLength
}

export interface LayoutFloatingResizeEventDetail {
  edge: LayoutPlacement
  width: number
}

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

export interface LayoutProps {
  mode?: LayoutMode
  floating?: LayoutFloatingConfig
  leftAside?: LayoutAsideConfig
  rightAside?: LayoutAsideConfig
}

export interface LayoutEmits {
  'update:mode': [value: LayoutMode | undefined]
  'update:floating': [value: LayoutFloatingConfig | undefined]
  'update:leftAside': [value: LayoutAsideConfig | undefined]
  'update:rightAside': [value: LayoutAsideConfig | undefined]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]
  'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
  'aside-resize': [detail: LayoutAsideResizeEventDetail]
  'aside-resize-end': [detail: LayoutAsideResizeEventDetail]
}

export interface LayoutAsideProps {
  placement: LayoutPlacement
  collapseEffect?: LayoutAsideCollapseEffect
}

export interface LayoutAsideToggleProps {
  placement: LayoutPlacement
  ariaLabel?: string
}

export interface LayoutMainProps {
  scrollHost: LayoutMainScrollHost
}

export interface LayoutAsideSlots {
  default?: (slotProps: { isExpanded: boolean }) => VNode | VNode[]
}

export interface LayoutAsideToggleSlots {
  default?: (slotProps: { isExpanded: boolean }) => VNode | VNode[]
}

export interface LayoutSlots {
  'left-aside'?: () => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: () => VNode | VNode[]
}
