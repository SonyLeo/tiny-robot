import { useDraggable } from '@vueuse/core'
import { computed, type ComputedRef } from 'vue'
import type { LayoutFloatingDragEventDetail, LayoutFloatingState } from '../index.type'
import type { LayoutContext, LayoutFloatingRect } from '../internal.type'
import { DEFAULT_FLOATING_GAP, DEFAULT_FLOATING_TOP } from '../utils/surfaceGeometry'

interface UseLayoutFloatingDragOptions {
  context: LayoutContext
  floatingRect: ComputedRef<LayoutFloatingRect>
  canDrag: ComputedRef<boolean>
  toFloatingState: (rect: LayoutFloatingRect, normalizeCenter?: boolean) => LayoutFloatingState
  applyPosition: (nextX: number, nextY: number) => LayoutFloatingRect
  onFloatingDragStart?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragEventDetail) => void
}

export function useLayoutFloatingDrag(options: UseLayoutFloatingDragOptions) {
  const { x, y, isDragging } = useDraggable(options.context.rootEl, {
    handle: options.context.dragHandleEl,
    initialValue: { x: DEFAULT_FLOATING_GAP, y: DEFAULT_FLOATING_TOP },
    preventDefault: true,
    buttons: [0],
    disabled: computed(() => !options.canDrag.value),
    onStart: () => {
      if (!options.canDrag.value) {
        return false
      }

      const rect = options.floatingRect.value
      setPosition(rect.x, rect.y)
      options.onFloatingDragStart?.(options.toFloatingState(rect, true))
    },
    onMove: (position) => {
      const nextRect = options.applyPosition(position.x, position.y)
      options.onFloatingDrag?.(options.toFloatingState(nextRect, true))
    },
    onEnd: (position) => {
      const nextRect = options.applyPosition(position.x, position.y)
      options.onFloatingDragEnd?.(options.toFloatingState(nextRect, true))
    },
  })

  function setPosition(nextX: number, nextY: number): void {
    x.value = nextX
    y.value = nextY
  }

  const dragBarClass = computed(() => ({
    'tr-layout__drag-bar--draggable': options.canDrag.value,
  }))

  return {
    isDragging,
    dragBarClass,
    setPosition,
  }
}
