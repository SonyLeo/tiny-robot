import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutLength = number | string

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
  defaultMode?: LayoutMode
  floating?: LayoutFloatingConfig
  defaultFloating?: LayoutFloatingConfig
}

export interface LayoutEmits {
  'update:mode': [value: LayoutMode]
  'update:floating': [value: LayoutFloatingConfig]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]
  'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
  'aside-resize': [detail: LayoutAsideResizeEventDetail]
  'aside-resize-end': [detail: LayoutAsideResizeEventDetail]
}

export interface LayoutAsideProps {
  placement: LayoutPlacement
  mode?: LayoutAsideMode
  open?: boolean
  defaultOpen?: boolean
  width?: number
  defaultWidth?: number
  railWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  collapseEffect?: LayoutAsideCollapseEffect
}

export interface LayoutAsideEmits {
  'update:open': [value: boolean]
  'update:width': [value: number]
}

export interface LayoutAsideToggleProps {
  placement: LayoutPlacement
  ariaLabel?: string
}

export interface LayoutMainProps {
  scrollHost: LayoutMainScrollHost
}

export interface LayoutAsideSlots {
  default?: (slotProps: { isOpen: boolean; isExpanded: boolean }) => VNode | VNode[]
}

export interface LayoutAsideToggleSlots {
  default?: (slotProps: { isOpen: boolean; isExpanded: boolean }) => VNode | VNode[]
}

export interface LayoutSlots {
  'left-aside'?: () => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: () => VNode | VNode[]
}
