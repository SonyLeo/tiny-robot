import type { ComponentPublicInstance, ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import type { LayoutAsideMode, LayoutFloating, LayoutProps, LayoutMode, LayoutPlacement } from './index.type'

export type LayoutAsideCollapseEffect = 'overlay' | 'slide'

export type LayoutFloatingBase = Omit<LayoutFloating, 'placement' | 'offsetX' | 'offsetY'>
export interface LayoutFloatingRect extends LayoutFloatingBase {
  x: number
  y: number
  width: number
  height: number
}

// Keep runtime props flat for defineProps().
// Vue's type-to-runtime conversion is AST-based and does not reliably support
// full props-object conditional / exclusive unions here.
export type LayoutRuntimeProps = LayoutProps

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

export interface LayoutAsideInternalProps {
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
  default?: (slotProps: { isOpen: boolean }) => VNode | VNode[]
}

export interface LayoutAsideToggleSlots {
  default?: (slotProps: { isOpen: boolean }) => VNode | VNode[]
}

type ToMaybeRefFields<T> = {
  [K in keyof T]: MaybeRefOrGetter<T[K]>
}

interface LayoutPanelValue {
  placement: LayoutPlacement
  layoutMode: LayoutAsideMode
  isOpen: boolean
  width: number | undefined
  collapsedWidth: number | undefined
  minWidth: number
  maxWidth: number
  resizable: boolean
}

interface LayoutPanelMutations {
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

interface LayoutPanelDerived {
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
}

export type LayoutPanelState = ToMaybeRefFields<LayoutPanelValue> & LayoutPanelMutations

export interface LayoutPanelApi extends LayoutPanelValue, LayoutPanelDerived, LayoutPanelMutations {
  isRegistered: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export interface LayoutContext {
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}

export interface UseLayoutRootStateResult {
  resolvedMode: ComputedRef<LayoutMode>
  resolvedFloating: ComputedRef<LayoutFloating | undefined>
  commitFloating: (nextFloating: LayoutFloating) => void
  initializeFloating: (nextFloating: LayoutFloating) => void
  leftAside: LayoutPanelState
  rightAside: LayoutPanelState
}
