import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutSide = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutFloatingState {
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
}

export interface LayoutFloatingOptions {
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export type LayoutFloatingResizeHandle = 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface LayoutAsideOpenEventDetail {
  side: LayoutSide
  open: boolean
}

export interface LayoutAsideSideOpenEventDetail {
  open: boolean
}

export interface LayoutAsideResizeEventDetail {
  side: LayoutSide
  expandedWidth: number
}

export interface LayoutAsideSideResizeEventDetail {
  expandedWidth: number
}

export type LayoutFloatingDragEventDetail = LayoutFloatingState

export type LayoutFloatingResizeEventDetail = LayoutFloatingState & {
  handle: LayoutFloatingResizeHandle
}

export interface LayoutAsideProps {
  mode?: LayoutAsideMode
  open?: boolean
  defaultOpen?: boolean
  expandedWidth?: number
  defaultExpandedWidth?: number
  minExpandedWidth?: number
  maxExpandedWidth?: number
  collapsedWidth?: number
  collapseEffect?: LayoutAsideCollapseEffect
  resizable?: boolean
}

export interface LayoutAsidePanelsProps {
  leftAside?: LayoutAsideProps
  rightAside?: LayoutAsideProps
}

export interface LayoutNormalProps extends LayoutAsidePanelsProps {
  mode?: 'normal'
}

type LayoutFloatingStateControlProps =
  | {
      floatingState?: LayoutFloatingState
      defaultFloatingState?: never
    }
  | {
      floatingState?: never
      defaultFloatingState?: LayoutFloatingState
    }

export type LayoutFloatingProps = LayoutAsidePanelsProps &
  LayoutFloatingStateControlProps & {
    mode: 'floating'
    floatingOptions?: LayoutFloatingOptions
  }

export type LayoutProps = LayoutNormalProps | LayoutFloatingProps

export type LayoutScrollTargetComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutScrollTarget = HTMLElement | LayoutScrollTargetComponent | null | undefined

export interface LayoutProxyScrollbarProps {
  scrollTarget?: LayoutScrollTarget
}

export interface LayoutAsideToggleProps {
  side: LayoutSide
}

export interface LayoutEmits {
  'update:floatingState': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragEventDetail]
  'floating-drag': [detail: LayoutFloatingDragEventDetail]
  'floating-drag-end': [detail: LayoutFloatingDragEventDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]

  'aside-open-change': [detail: LayoutAsideOpenEventDetail]
  'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
  'aside-resize': [detail: LayoutAsideResizeEventDetail]
  'aside-resize-end': [detail: LayoutAsideResizeEventDetail]
  'left-aside-open-change': [detail: LayoutAsideSideOpenEventDetail]
  'left-aside-resize-start': [detail: LayoutAsideSideResizeEventDetail]
  'left-aside-resize': [detail: LayoutAsideSideResizeEventDetail]
  'left-aside-resize-end': [detail: LayoutAsideSideResizeEventDetail]
  'right-aside-open-change': [detail: LayoutAsideSideOpenEventDetail]
  'right-aside-resize-start': [detail: LayoutAsideSideResizeEventDetail]
  'right-aside-resize': [detail: LayoutAsideSideResizeEventDetail]
  'right-aside-resize-end': [detail: LayoutAsideSideResizeEventDetail]
}

export interface LayoutSlots {
  'left-aside'?: () => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: () => VNode | VNode[]
}
