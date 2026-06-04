import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutLength = number | string

type RequiredProp<Key extends string, Value> = {
  [K in Key]: Value
}

type OptionalProp<Key extends string, Value> = {
  [K in Key]?: Value
}

type ForbiddenProp<Key extends string> = {
  [K in Key]?: never
}

type ExclusiveControllablePair<ControlledKey extends string, DefaultKey extends string, Value> =
  | (RequiredProp<ControlledKey, Value> & ForbiddenProp<DefaultKey>)
  | (ForbiddenProp<ControlledKey> & OptionalProp<DefaultKey, Value>)

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

export interface LayoutFloatingDragEventDetail {
  x: number
  y: number
}

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

type LayoutModeState = ExclusiveControllablePair<'mode', 'defaultMode', LayoutMode>
type LayoutFloatingState = ExclusiveControllablePair<'floating', 'defaultFloating', LayoutFloatingConfig>

export interface LayoutRuntimeProps {
  mode?: LayoutMode
  defaultMode?: LayoutMode
  floating?: LayoutFloatingConfig
  defaultFloating?: LayoutFloatingConfig
}

// Keep runtime props flat for defineProps().
// Vue's type-to-runtime conversion is AST-based and does not reliably support
// full props-object conditional / exclusive unions here.
export type LayoutProps = LayoutRuntimeProps & LayoutModeState & LayoutFloatingState

export interface LayoutEmits {
  'update:mode': [value: LayoutMode]
  'update:floating': [value: LayoutFloatingConfig]
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
  railWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  collapseEffect?: LayoutAsideCollapseEffect
}

type LayoutAsideOpenState = ExclusiveControllablePair<'open', 'defaultOpen', boolean>
type LayoutAsideWidthState = ExclusiveControllablePair<'width', 'defaultWidth', number>

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
