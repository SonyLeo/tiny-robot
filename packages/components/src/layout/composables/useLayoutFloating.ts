import { useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch, type CSSProperties } from 'vue'
import type {
  LayoutFloatingDragEventDetail,
  LayoutFloatingResizeEventDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
} from '../index.type'
import type { LayoutContext, LayoutFloatingRect } from '../internal.type'
import { useLayoutFloatingDrag } from './useLayoutFloatingDrag'
import { useLayoutFloatingResize } from './useLayoutFloatingResize'
import {
  areFloatingGeometryEqual,
  clampFloatingRect,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_WIDTH,
  normalizeFloatingRect,
  resolveFloatingSnapshot,
  toCommittedFloatingState,
} from '../utils/surfaceGeometry'

interface UseLayoutFloatingOptions {
  context: LayoutContext
  onFloatingDragStart?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingResizeStart?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResize?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResizeEnd?: (detail: LayoutFloatingResizeEventDetail) => void
}

export function useLayoutFloating(options: UseLayoutFloatingOptions) {
  const { width: viewportWidth, height: viewportHeight } = useWindowSize({
    type: 'visual',
    initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
    initialHeight: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
  })

  const mode = options.context.floating.state.mode
  const isFloating = computed(() => mode.value === 'floating')
  const isNormal = computed(() => mode.value === 'normal')
  const floatingStateValue = options.context.floating.state.value
  const floatingValue = options.context.floating.state.resolved
  const floatingRect = computed(() => normalizeFloatingRect(floatingValue.value))
  const isFloatingDraggable = computed(() => floatingRect.value.draggable ?? true)
  const isFloatingResizable = computed(() => floatingRect.value.resizable === true)
  const isResizingFloating = shallowRef(false)

  function toFloatingState(rect: LayoutFloatingRect, normalizeCenter = false): LayoutFloatingState {
    return toCommittedFloatingState(resolveFloatingSnapshot(rect, floatingValue.value), floatingStateValue.value, {
      normalizeCenter,
    })
  }

  function toResizeDetail(
    handle: LayoutFloatingResizeHandle,
    rect: LayoutFloatingRect,
  ): LayoutFloatingResizeEventDetail {
    return {
      ...toFloatingState(rect, true),
      handle,
    }
  }

  function commitRect(nextRect: LayoutFloatingRect): LayoutFloatingRect {
    const normalizedRect = clampFloatingRect(nextRect)

    if (areFloatingGeometryEqual(floatingRect.value, normalizedRect)) {
      return normalizedRect
    }

    options.context.floating.actions.commit(toFloatingState(normalizedRect, true))

    return normalizedRect
  }

  function applyDraggedPosition(nextX: number, nextY: number) {
    const nextRect = commitRect({
      ...floatingRect.value,
      x: nextX,
      y: nextY,
    })

    return nextRect
  }

  const drag = useLayoutFloatingDrag({
    context: options.context,
    floatingRect,
    canDrag: computed(() => isFloating.value && isFloatingDraggable.value && !isResizingFloating.value),
    toFloatingState,
    applyPosition: applyDraggedPosition,
    onFloatingDragStart: options.onFloatingDragStart,
    onFloatingDrag: options.onFloatingDrag,
    onFloatingDragEnd: options.onFloatingDragEnd,
  })

  const resize = useLayoutFloatingResize({
    context: options.context,
    floatingRect,
    isFloating,
    isResizable: isFloatingResizable,
    isDragging: drag.isDragging,
    commitRect,
    toResizeDetail,
    onFloatingResizeStart: options.onFloatingResizeStart,
    onFloatingResize: options.onFloatingResize,
    onFloatingResizeEnd: options.onFloatingResizeEnd,
  })

  watch(resize.isResizing, (isResizing) => {
    isResizingFloating.value = isResizing
  })

  function syncFloatingRect(): void {
    if (!isFloating.value || drag.isDragging.value || resize.isResizing.value) {
      return
    }

    if (!floatingStateValue.value) {
      options.context.floating.actions.initialize(toFloatingState(floatingRect.value))
    }

    const nextRect = commitRect(floatingRect.value)
    drag.setPosition(nextRect.x, nextRect.y)
  }

  watch(
    [mode, floatingValue, viewportWidth, viewportHeight],
    () => {
      syncFloatingRect()
    },
    { immediate: true },
  )

  const floatingClass = computed(() => ({
    'tr-layout--floating': isFloating.value,
    'tr-layout--floating-dragging': drag.isDragging.value,
    'tr-layout--floating-resizing': resize.isResizing.value,
  }))

  const floatingStyle = computed<CSSProperties>(() => {
    if (isNormal.value) {
      return {}
    }

    return {
      left: `${floatingRect.value.x}px`,
      top: `${floatingRect.value.y}px`,
      width: `${floatingRect.value.width}px`,
      height: `${floatingRect.value.height}px`,
    }
  })

  return {
    isFloating,
    showDragBar: computed(() => isFloating.value),
    floatingClass,
    floatingStyle,
    dragBarClass: drag.dragBarClass,
    resizeHandles: resize.resizeHandles,
  }
}
