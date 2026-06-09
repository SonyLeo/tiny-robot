import type { ComponentPublicInstance, ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import type {
  LayoutAsideMode,
  LayoutAsideProps,
  LayoutFloating,
  LayoutProps,
  LayoutMode,
  LayoutPlacement,
} from './index.type'

export type LayoutAsideCollapseEffect = 'overlay' | 'slide'

export type LayoutFloatingBase = Omit<LayoutFloating, 'placement' | 'offsetX' | 'offsetY'>
export interface LayoutFloatingRect extends LayoutFloatingBase {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutDefaultFloatingConfig = LayoutFloating

// Keep runtime props flat for defineProps().
// Vue's type-to-runtime conversion is AST-based and does not reliably support
// full props-object conditional / exclusive unions here.
export type LayoutRuntimeProps = LayoutProps

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

export interface LayoutAsideInternalProps extends LayoutAsideProps {
  placement: LayoutPlacement
  minWidth?: number
  maxWidth?: number
  collapseEffect?: LayoutAsideCollapseEffect
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

export interface LayoutPanelState {
  placement: LayoutPlacement
  layoutMode: MaybeRefOrGetter<LayoutAsideMode>
  isOpen: MaybeRefOrGetter<boolean>
  isDock: MaybeRefOrGetter<boolean>
  isDrawer: MaybeRefOrGetter<boolean>
  isRail: MaybeRefOrGetter<boolean>
  isHidden: MaybeRefOrGetter<boolean>
  canResize: MaybeRefOrGetter<boolean>
  width: MaybeRefOrGetter<number | undefined>
  collapsedWidth: MaybeRefOrGetter<number | undefined>
  minWidth: MaybeRefOrGetter<number>
  maxWidth: MaybeRefOrGetter<number>
  resizable: MaybeRefOrGetter<boolean>
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutPanelApi {
  placement: LayoutPlacement
  isRegistered: boolean
  layoutMode: LayoutAsideMode
  isOpen: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
  width: number | undefined
  collapsedWidth: number | undefined
  minWidth: number
  maxWidth: number
  resizable: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
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
