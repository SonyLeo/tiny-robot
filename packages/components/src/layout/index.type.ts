import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutFloatingBase {
  width?: number
  height?: number
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export interface LayoutFloatingRect extends LayoutFloatingBase {
  x: number
  y: number
  width: number
  height: number
  placement?: never
  offset?: never
}

export interface LayoutDefaultFloatingConfig extends LayoutFloatingBase {
  x?: never
  y?: never
  placement?: LayoutFloatingPlacement
  offset?: number
}

export type LayoutFloatingResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

type RequiredProp<Key extends string, Value> = {
  [K in Key]: Value
}

type OptionalProp<Key extends string, Value> = {
  [K in Key]?: Value
}

type ForbiddenProp<Key extends string> = {
  [K in Key]?: never
}

type ExclusiveControllablePair<
  ControlledKey extends string,
  ControlledValue,
  DefaultKey extends string,
  DefaultValue,
> =
  | (RequiredProp<ControlledKey, ControlledValue> & ForbiddenProp<DefaultKey>)
  | (ForbiddenProp<ControlledKey> & OptionalProp<DefaultKey, DefaultValue>)

export interface LayoutAsideResizeEventDetail {
  placement: LayoutPlacement
  width: number
}

export interface LayoutFloatingResizeEventDetail {
  handle: LayoutFloatingResizeHandle
  width: number
  height: number
  x: number
  y: number
}

export interface LayoutFloatingDragEventDetail {
  x: number
  y: number
}

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

type LayoutFloatingState = ExclusiveControllablePair<
  'floating',
  LayoutFloatingRect,
  'defaultFloating',
  LayoutDefaultFloatingConfig
>

export interface LayoutRuntimeProps {
  mode?: LayoutMode
  floating?: LayoutFloatingRect
  defaultFloating?: LayoutDefaultFloatingConfig
}

// Keep runtime props flat for defineProps().
// Vue's type-to-runtime conversion is AST-based and does not reliably support
// full props-object conditional / exclusive unions here.
export type LayoutProps = LayoutRuntimeProps & LayoutFloatingState

export interface LayoutEmits {
  'update:mode': [value: LayoutMode]
  'update:floating': [value: LayoutFloatingRect]
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

interface LayoutAsideBaseProps {
  placement: LayoutPlacement
  mode?: LayoutAsideMode
  collapsedWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  collapseEffect?: LayoutAsideCollapseEffect
}

type LayoutAsideOpenState = ExclusiveControllablePair<'open', boolean, 'defaultOpen', boolean>
type LayoutAsideWidthState = ExclusiveControllablePair<'width', number, 'defaultWidth', number>

export type LayoutAsideProps = LayoutAsideBaseProps & LayoutAsideOpenState & LayoutAsideWidthState
export type LayoutAsideRuntimeProps = LayoutAsideBaseProps & {
  open?: boolean
  defaultOpen?: boolean
  width?: number
  defaultWidth?: number
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
  default?: (slotProps: { isOpen: boolean }) => VNode | VNode[]
}

export interface LayoutAsideToggleSlots {
  default?: (slotProps: { isOpen: boolean }) => VNode | VNode[]
}

export interface LayoutSlots {
  'left-aside'?: () => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: () => VNode | VNode[]
}
