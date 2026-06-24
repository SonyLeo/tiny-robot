import { computed, type ComputedRef } from 'vue'
import type { LayoutAsideProps, LayoutSide, LayoutProps } from '../index.type'
import type { LayoutAsideView, LayoutPanel, LayoutState } from '../internal.type'
import { clamp } from '../utils/number'
import {
  getDefaultAsideExpandedWidth,
  getDefaultAsideMaxWidth,
  getDefaultAsideMinWidth,
  getDefaultAsideOpen,
} from '../utils/asidePresets'
import { emitAsideOpenChange, type LayoutEmitFn } from '../utils/asideEventEmitters'
import { useControllableState } from '../../shared/composables/useControllableState'

function resolveFiniteNumber(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : value
}

function createAsidePanel(
  side: LayoutSide,
  aside: () => LayoutAsideProps | undefined,
  emit: LayoutEmitFn,
): LayoutPanel {
  const asideValue = computed(() => aside())
  const layoutMode = computed(() => asideValue.value?.mode ?? 'dock')
  const collapsedWidth = computed(() => resolveFiniteNumber(asideValue.value?.collapsedWidth, 0))
  const collapseEffect = computed(() => asideValue.value?.collapseEffect ?? 'overlay')
  const resizable = computed(() => asideValue.value?.resizable ?? false)
  const minWidth = computed(() =>
    resolveFiniteNumber(asideValue.value?.minExpandedWidth, getDefaultAsideMinWidth(side)),
  )
  const maxWidth = computed(() => {
    const nextMaxWidth = resolveFiniteNumber(asideValue.value?.maxExpandedWidth, getDefaultAsideMaxWidth(side))
    return Math.max(minWidth.value, nextMaxWidth)
  })

  const openState = useControllableState<boolean>({
    value: () => asideValue.value?.open,
    defaultValue: () => asideValue.value?.defaultOpen ?? getDefaultAsideOpen(side),
    onChange: (nextOpen) => emitAsideOpenChange(emit, { side, open: nextOpen }),
  })

  const widthState = useControllableState<number>({
    value: () => asideValue.value?.expandedWidth,
    defaultValue: () => resolveFiniteNumber(asideValue.value?.defaultExpandedWidth, getDefaultAsideExpandedWidth(side)),
  })

  const isDock = computed(() => layoutMode.value === 'dock')
  const isDrawer = computed(() => layoutMode.value === 'drawer')
  const isRail = computed(() => isDock.value && !openState.value && collapsedWidth.value > 0)
  const isHidden = computed(() => !openState.value && (isDrawer.value || !isRail.value))
  const canResize = computed(() => isDock.value && openState.value && resizable.value)

  function setOpen(nextOpen: boolean): void {
    if (openState.value !== nextOpen) {
      openState.value = nextOpen
    }
  }

  function setWidth(nextWidth: number): void {
    const clampedWidth = clamp(nextWidth, minWidth.value, maxWidth.value)
    if (widthState.value !== clampedWidth) {
      widthState.value = clampedWidth
    }
  }

  return {
    isOpen: computed(() => openState.value),
    width: computed(() => widthState.value),
    collapsedWidth,
    collapseEffect,
    minWidth,
    maxWidth,
    isDock,
    isDrawer,
    isRail,
    isHidden,
    canResize,
    setOpen,
    setWidth,
  }
}

function createAsideView(
  side: LayoutSide,
  panel: LayoutPanel,
  present: ComputedRef<boolean>,
  oppositeDockWidth: ComputedRef<number>,
): LayoutAsideView {
  return {
    side: computed(() => side),
    present,
    oppositeDockWidth,
    collapseEffect: panel.collapseEffect,
    isDock: panel.isDock,
    isDrawer: panel.isDrawer,
    isOpen: panel.isOpen,
    isRail: panel.isRail,
    isHidden: panel.isHidden,
    canResize: panel.canResize,
    minWidth: panel.minWidth,
    maxWidth: panel.maxWidth,
    width: panel.width,
    collapsedWidth: panel.collapsedWidth,
  }
}

function getDockedAsideWidth(panel: LayoutPanel, present: boolean): number {
  if (!present || !panel.isDock.value || panel.isHidden.value) {
    return 0
  }

  return panel.isRail.value ? panel.collapsedWidth.value : panel.width.value
}

export interface LayoutAsidePresence {
  left: ComputedRef<boolean>
  right: ComputedRef<boolean>
}

export function createLayoutState(props: LayoutProps, emit: LayoutEmitFn, present: LayoutAsidePresence): LayoutState {
  const leftPanel = createAsidePanel('left', () => props.leftAside, emit)
  const rightPanel = createAsidePanel('right', () => props.rightAside, emit)
  const leftDockWidth = computed(() => getDockedAsideWidth(leftPanel, present.left.value))
  const rightDockWidth = computed(() => getDockedAsideWidth(rightPanel, present.right.value))

  return {
    leftPanel,
    rightPanel,
    leftAsideView: createAsideView('left', leftPanel, present.left, rightDockWidth),
    rightAsideView: createAsideView('right', rightPanel, present.right, leftDockWidth),
  }
}
