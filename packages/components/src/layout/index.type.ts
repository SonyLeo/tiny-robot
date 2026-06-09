import type { VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutMode = 'normal' | 'floating'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutFloating {
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export type LayoutFloatingResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface LayoutAsideResizeEventDetail {
  placement: LayoutPlacement
  width: number
}

export type LayoutFloatingDragEventDetail = LayoutFloating

export type LayoutFloatingResizeEventDetail = LayoutFloating & {
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
  resizable?: boolean
}

export interface LayoutAsideValue {
  open: boolean
  expandedWidth: number | undefined
}

export interface LayoutProps {
  mode?: LayoutMode
  leftAside?: LayoutAsideProps
  rightAside?: LayoutAsideProps
  floating?: LayoutFloating
  defaultFloating?: LayoutFloating
}

export interface LayoutEmits {
  'update:mode': [value: LayoutMode]
  'update:leftAside': [value: LayoutAsideValue]
  'update:rightAside': [value: LayoutAsideValue]
  'update:floating': [value: LayoutFloating]
  'floating-drag-start': [detail: LayoutFloatingDragEventDetail]
  'floating-drag': [detail: LayoutFloatingDragEventDetail]
  'floating-drag-end': [detail: LayoutFloatingDragEventDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]
  'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
  'aside-resize': [detail: LayoutAsideResizeEventDetail]
  'aside-resize-end': [detail: LayoutAsideResizeEventDetail]
}

export interface LayoutAsideSlotProps {
  placement: LayoutPlacement
  mode: LayoutAsideMode
  open: boolean
  expandedWidth: number | undefined
  collapsedWidth: number | undefined
  resizable: boolean
  toggle: () => void
  setOpen: (next: boolean) => void
  setExpandedWidth: (next: number) => void
}

export interface LayoutSlots {
  'left-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
}
