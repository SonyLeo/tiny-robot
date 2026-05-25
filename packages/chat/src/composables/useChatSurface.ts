import { useDraggable, useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import type { ChatDetachedBounds, ChatDetachedResizeEventDetail, ChatPlacement, ChatSurfaceMode } from '@/types/layout'
import { toCssLength } from '@/utils/cssLength'
import {
  areDetachedBoundsEqual,
  DEFAULT_DETACHED_GAP,
  DEFAULT_DETACHED_HEIGHT,
  DEFAULT_DETACHED_TOP,
  DEFAULT_DETACHED_WIDTH,
  resolveCurrentDetachedBounds,
  resolveDetachedSnapshot,
  toCommittedDetachedBounds,
  type DetachedBoundsSnapshot,
} from '@/utils/chatSurfaceGeometry'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '@/utils/domInteraction'
import { clamp } from '@/utils/math'

interface UseChatSurfaceOptions {
  surfaceModeState: Ref<ChatSurfaceMode | undefined>
  detachedBoundsState: Ref<ChatDetachedBounds | undefined>
  detachedDraggableState: Ref<boolean | undefined>
  detachedResizableState: Ref<boolean | undefined>
  minDetachedWidthState: Ref<number | string | undefined>
  maxDetachedWidthState: Ref<number | string | undefined>
  hostRef: Ref<HTMLElement | null>
  frameRef: Ref<HTMLElement | null>
  dragHandleRef: Ref<HTMLElement | null>
  onDetachedResizeStart?: (detail: ChatDetachedResizeEventDetail) => void
  onDetachedResize?: (detail: ChatDetachedResizeEventDetail) => void
  onDetachedResizeEnd?: (detail: ChatDetachedResizeEventDetail) => void
}

interface DetachedResizeState {
  pointerId: number
  handleEl: HTMLElement
  edge: ChatPlacement
  startBounds: DetachedBoundsSnapshot
  currentWidth: number
  bodyState: BodyInteractionState
}

export function useChatSurface(options: UseChatSurfaceOptions) {
  const activeResize = shallowRef<DetachedResizeState | null>(null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  const surfaceMode = computed<ChatSurfaceMode>(() => options.surfaceModeState.value ?? 'embedded')
  const isDetached = computed(() => surfaceMode.value === 'detached')
  const isEmbedded = computed(() => surfaceMode.value === 'embedded')
  const isDetachedDraggable = computed(() => options.detachedDraggableState.value ?? true)
  const isDetachedResizable = computed(() => options.detachedResizableState.value === true)
  const isResizing = computed(() => activeResize.value !== null)
  const activeResizeEdge = computed<ChatPlacement | null>(() => activeResize.value?.edge ?? null)
  const canDragDetached = computed(() => isDetached.value && isDetachedDraggable.value && !isResizing.value)

  function getCurrentDetachedBounds(): ChatDetachedBounds {
    return resolveCurrentDetachedBounds(
      options.detachedBoundsState.value,
      options.hostRef.value,
      options.minDetachedWidthState.value,
      options.maxDetachedWidthState.value,
    )
  }

  function getDetachedSnapshot(bounds = getCurrentDetachedBounds()): DetachedBoundsSnapshot {
    return resolveDetachedSnapshot(
      bounds,
      options.hostRef.value,
      options.minDetachedWidthState.value,
      options.maxDetachedWidthState.value,
    )
  }

  function commitDetachedBounds(nextBounds: ChatDetachedBounds): void {
    if (areDetachedBoundsEqual(options.detachedBoundsState.value, nextBounds)) {
      return
    }

    options.detachedBoundsState.value = nextBounds
  }

  function ensureDetachedBounds(): ChatDetachedBounds {
    const nextBounds = toCommittedDetachedBounds(getDetachedSnapshot())
    commitDetachedBounds(nextBounds)
    return nextBounds
  }

  function clampDetachedBounds(): void {
    if (!isDetached.value || isDragging.value || isResizing.value) {
      return
    }

    const nextBounds = toCommittedDetachedBounds(getDetachedSnapshot())
    commitDetachedBounds(nextBounds)
  }

  function resolveDraggedDetachedBounds(nextX: number, nextY: number): ChatDetachedBounds {
    const snapshot = getDetachedSnapshot()

    return {
      ...toCommittedDetachedBounds(snapshot),
      x: clamp(nextX, DEFAULT_DETACHED_GAP, snapshot.xMax),
      y: clamp(nextY, DEFAULT_DETACHED_TOP, snapshot.yMax),
    }
  }

  const { x, y, isDragging } = useDraggable(options.frameRef, {
    handle: options.dragHandleRef,
    containerElement: options.hostRef,
    initialValue: { x: DEFAULT_DETACHED_GAP, y: DEFAULT_DETACHED_TOP },
    preventDefault: true,
    buttons: [0],
    disabled: computed(() => !canDragDetached.value),
    onStart: () => {
      if (!canDragDetached.value) {
        return false
      }

      const detachedBounds = ensureDetachedBounds()
      x.value = detachedBounds.x ?? DEFAULT_DETACHED_GAP
      y.value = detachedBounds.y ?? DEFAULT_DETACHED_TOP
    },
    onMove: (position) => {
      const nextBounds = resolveDraggedDetachedBounds(position.x, position.y)
      x.value = nextBounds.x ?? DEFAULT_DETACHED_GAP
      y.value = nextBounds.y ?? DEFAULT_DETACHED_TOP
      commitDetachedBounds(nextBounds)
    },
    onEnd: (position) => {
      const nextBounds = resolveDraggedDetachedBounds(position.x, position.y)
      x.value = nextBounds.x ?? DEFAULT_DETACHED_GAP
      y.value = nextBounds.y ?? DEFAULT_DETACHED_TOP
      commitDetachedBounds(nextBounds)
    },
  })
  const canResizeDetached = computed(() => isDetached.value && isDetachedResizable.value && !isDragging.value)

  function stopResize(pointerId?: number): void {
    const state = activeResize.value
    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    const body = state.handleEl.ownerDocument.body
    restoreBodyInteraction(body, state.bodyState)

    options.onDetachedResizeEnd?.({
      edge: state.edge,
      width: state.currentWidth,
    })

    activeResize.value = null
  }

  function startResize(edge: ChatPlacement, event: PointerEvent): void {
    if (activeResize.value || isDragging.value || !event.isPrimary || event.button !== 0 || !canResizeDetached.value) {
      return
    }

    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    const hostEl = options.hostRef.value

    if (!handleEl || !hostEl) {
      return
    }

    const detachedBounds = ensureDetachedBounds()
    const snapshot = getDetachedSnapshot(detachedBounds)
    const body = hostEl.ownerDocument.body

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      edge,
      startBounds: snapshot,
      currentWidth: snapshot.widthPx,
      bodyState: lockBodyInteraction(body, 'col-resize'),
    }

    options.onDetachedResizeStart?.({
      edge,
      width: snapshot.widthPx,
    })
  }

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const state = activeResize.value
    const hostEl = options.hostRef.value
    if (!state || !hostEl || event.pointerId !== state.pointerId) {
      return
    }

    const hostRect = hostEl.getBoundingClientRect()
    const pointerX = event.clientX - hostRect.left
    const minX = DEFAULT_DETACHED_GAP
    const maxRight = hostRect.width - DEFAULT_DETACHED_GAP
    let nextX = state.startBounds.x
    let nextWidth = state.startBounds.widthPx

    if (state.edge === 'left') {
      nextX = pointerX
      nextWidth = clamp(
        state.startBounds.x + state.startBounds.widthPx - pointerX,
        state.startBounds.minWidth,
        state.startBounds.maxWidth,
      )
    } else {
      nextWidth = clamp(pointerX - state.startBounds.x, state.startBounds.minWidth, state.startBounds.maxWidth)
      nextX = pointerX - nextWidth
    }

    nextX = clamp(nextX, minX, Math.max(minX, maxRight - nextWidth))

    const nextBounds: ChatDetachedBounds = {
      ...toCommittedDetachedBounds(state.startBounds),
      x: nextX,
      width: nextWidth,
    }

    state.currentWidth = nextWidth
    commitDetachedBounds(nextBounds)
    options.onDetachedResize?.({
      edge: state.edge,
      width: nextWidth,
    })
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopResize(event.pointerId)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopResize(event.pointerId)
  })

  onBeforeUnmount(() => {
    stopResize()
  })

  watch(
    surfaceMode,
    (variant) => {
      if (variant === 'detached') {
        const detachedBounds = ensureDetachedBounds()
        x.value = detachedBounds.x ?? DEFAULT_DETACHED_GAP
        y.value = detachedBounds.y ?? DEFAULT_DETACHED_TOP
      }
    },
    { immediate: true },
  )

  watch(
    [surfaceMode, options.detachedBoundsState, options.minDetachedWidthState, options.maxDetachedWidthState],
    () => {
      clampDetachedBounds()
    },
  )

  useResizeObserver(options.hostRef, () => {
    clampDetachedBounds()
  })

  const detachedBounds = computed(() => toCommittedDetachedBounds(getDetachedSnapshot()))
  const surfaceClass = computed(() => ({
    'tr-chat-layout-surface--embedded': isEmbedded.value,
    'tr-chat-layout-surface--detached': isDetached.value,
    'tr-chat-layout-surface--dragging': isDragging.value,
    'tr-chat-layout-surface--draggable': canDragDetached.value,
    'tr-chat-layout-surface--resizable': isDetached.value && isDetachedResizable.value,
    'tr-chat-layout-surface--resizing': isResizing.value,
    'tr-chat-layout-surface--resizing-left': activeResizeEdge.value === 'left',
    'tr-chat-layout-surface--resizing-right': activeResizeEdge.value === 'right',
  }))

  const surfaceStyle = computed<CSSProperties>(() => {
    if (!isDetached.value) {
      return {}
    }

    return {
      left: `${detachedBounds.value.x ?? DEFAULT_DETACHED_GAP}px`,
      top: `${detachedBounds.value.y ?? DEFAULT_DETACHED_TOP}px`,
      width: toCssLength(detachedBounds.value.width, `${DEFAULT_DETACHED_WIDTH}px`),
      height: toCssLength(detachedBounds.value.height, DEFAULT_DETACHED_HEIGHT),
    }
  })

  const dragBarClass = computed(() => ({
    'tr-chat-layout-surface__drag-bar--draggable': canDragDetached.value,
  }))

  return {
    isEmbedded,
    isDetached,
    isDragging,
    isResizing,
    activeResizeEdge,
    showDragBar: computed(() => isDetached.value),
    showResizeHandles: computed(() => isDetached.value && isDetachedResizable.value),
    surfaceClass,
    surfaceStyle,
    dragBarClass,
    leftResizeHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize('left', event),
    },
    rightResizeHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize('right', event),
    },
  }
}
