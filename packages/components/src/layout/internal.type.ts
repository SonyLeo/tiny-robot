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

export interface LayoutPanel {
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

export interface LayoutAsideView {
  side: ComputedRef<LayoutSide>
  present: ComputedRef<boolean>
  oppositeDockWidth: ComputedRef<number>
  collapseEffect: ComputedRef<LayoutAsideCollapseEffect>
  isDock: ComputedRef<boolean>
  isDrawer: ComputedRef<boolean>
  isOpen: ComputedRef<boolean>
  isRail: ComputedRef<boolean>
  isHidden: ComputedRef<boolean>
  canResize: ComputedRef<boolean>
  minWidth: ComputedRef<number>
  maxWidth: ComputedRef<number>
  width: ComputedRef<number>
  collapsedWidth: ComputedRef<number>
}

export interface LayoutAsideToggleContext {
  isOpen: ComputedRef<boolean>
  toggle: () => void
}

export interface LayoutContext {
  left: LayoutAsideToggleContext
  right: LayoutAsideToggleContext
}

export interface LayoutState {
  leftPanel: LayoutPanel
  rightPanel: LayoutPanel
  leftAsideView: LayoutAsideView
  rightAsideView: LayoutAsideView
}
