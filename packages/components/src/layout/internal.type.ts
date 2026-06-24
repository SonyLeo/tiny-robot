import type { ComputedRef } from 'vue'
import type { LayoutAsideCollapseEffect, LayoutFloatingOptions, LayoutFloatingState, LayoutSide } from './index.type'

export type LayoutResolvedFloating = LayoutFloatingState & LayoutFloatingOptions

export type LayoutFloatingRect = Omit<
  LayoutResolvedFloating,
  'placement' | 'offsetX' | 'offsetY' | 'width' | 'height'
> & {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutFloatingDragPosition {
  x: number
  y: number
}

export interface LayoutAsidePanel {
  side: LayoutSide
  isOpen: ComputedRef<boolean>
  width: ComputedRef<number>
  collapsedWidth: ComputedRef<number>
  collapseEffect: ComputedRef<LayoutAsideCollapseEffect>
  minWidth: ComputedRef<number>
  maxWidth: ComputedRef<number>
  isDock: ComputedRef<boolean>
  isDrawer: ComputedRef<boolean>
  isRail: ComputedRef<boolean>
  isHidden: ComputedRef<boolean>
  canResize: ComputedRef<boolean>
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutAsideToggleContext {
  isOpen: ComputedRef<boolean>
  toggle: () => void
}

export interface LayoutContext {
  left: LayoutAsideToggleContext
  right: LayoutAsideToggleContext
}
