import type { ClassValue, ComputedRef, MaybeRefOrGetter, StyleValue } from 'vue'
import type { LayoutAsideMode, LayoutFloatingConfig, LayoutMode, LayoutPlacement } from './index.type'

export interface LayoutPanelRegistration {
  placement: LayoutPlacement
  layoutMode: MaybeRefOrGetter<LayoutAsideMode>
  isOpen: MaybeRefOrGetter<boolean>
  width: MaybeRefOrGetter<number | undefined>
  containerClass?: MaybeRefOrGetter<ClassValue | undefined>
  containerStyle?: MaybeRefOrGetter<StyleValue | undefined>
  railWidth: MaybeRefOrGetter<number | undefined>
  minWidth: MaybeRefOrGetter<number>
  maxWidth: MaybeRefOrGetter<number>
  resizable: MaybeRefOrGetter<boolean>
  commitOpen: (nextOpen: boolean) => void
  commitWidth: (nextWidth: number) => void
}

export interface LayoutPanelApi {
  placement: LayoutPlacement
  isRegistered: boolean
  layoutMode: LayoutAsideMode
  isOpen: boolean
  isExpanded: boolean
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
  width: number | undefined
  widthStyle: string | undefined
  containerClass: ClassValue | undefined
  containerStyle: StyleValue | undefined
  railWidth: number
  railWidthStyle: string | undefined
  minWidth: number
  maxWidth: number
  resizable: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutStore {
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
  registerPanel: (panel: LayoutPanelRegistration) => void
  unregisterPanel: (placement: LayoutPlacement) => void
}

export interface UseControllableLayoutStateResult {
  resolvedMode: ComputedRef<LayoutMode>
  resolvedFloating: ComputedRef<LayoutFloatingConfig | undefined>
  commitMode: (nextMode: LayoutMode) => void
  commitFloating: (nextFloating: LayoutFloatingConfig) => void
}
