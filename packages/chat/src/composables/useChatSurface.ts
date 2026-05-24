import { useDraggable, useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import type { ChatDetachedBounds, ChatDetachedResizeEventDetail, ChatPlacement, ChatSurfaceMode } from '@/types/layout'
import { resolveCssLengthToPx, toCssLength } from '@/utils/cssLength'

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

interface ResolvedDetachedBounds {
  x?: number
  y?: number
  width: number | string
  height: number | string
}

interface DetachedBoundsSnapshot {
  raw: ResolvedDetachedBounds
  rawWidth: number
  rawHeight: number
  widthPx: number
  heightPx: number
  x: number
  y: number
  xMax: number
  yMax: number
  minWidth: number
  maxWidth: number
}

interface DetachedResizeState {
  pointerId: number
  handleEl: HTMLElement
  edge: ChatPlacement
  startBounds: DetachedBoundsSnapshot
  currentWidth: number
  bodyCursor: string
  bodyUserSelect: string
}

const DEFAULT_DETACHED_WIDTH = 420
const DEFAULT_DETACHED_HEIGHT = '80vh'
const DEFAULT_DETACHED_TOP = 24
const DEFAULT_DETACHED_GAP = 24
const DEFAULT_MIN_DETACHED_WIDTH = 320

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function areDetachedBoundsEqual(left: ChatDetachedBounds | undefined, right: ChatDetachedBounds | undefined): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
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

  function resolveWidthLimits(hostEl: HTMLElement) {
    const hostRect = hostEl.getBoundingClientRect()
    const availableWidth = Math.max(1, hostRect.width - DEFAULT_DETACHED_GAP * 2)
    const minWidth = clamp(
      resolveCssLengthToPx(options.minDetachedWidthState.value, hostEl, DEFAULT_MIN_DETACHED_WIDTH),
      1,
      availableWidth,
    )
    const maxWidth = clamp(
      resolveCssLengthToPx(options.maxDetachedWidthState.value, hostEl, availableWidth),
      minWidth,
      availableWidth,
    )

    return {
      hostRect,
      minWidth,
      maxWidth,
      maxHeight: Math.max(1, hostRect.height - DEFAULT_DETACHED_TOP - DEFAULT_DETACHED_GAP),
    }
  }

  function resolveDefaultDetachedBounds(source?: ChatDetachedBounds): ChatDetachedBounds {
    const hostEl = options.hostRef.value
    const width = source?.width ?? DEFAULT_DETACHED_WIDTH
    const height = source?.height ?? DEFAULT_DETACHED_HEIGHT

    if (!hostEl) {
      return {
        x: source?.x ?? DEFAULT_DETACHED_GAP,
        y: source?.y ?? DEFAULT_DETACHED_TOP,
        width,
        height,
      }
    }

    const { hostRect, minWidth, maxWidth, maxHeight } = resolveWidthLimits(hostEl)
    const rawWidth = resolveCssLengthToPx(width, hostEl, DEFAULT_DETACHED_WIDTH)
    const rawHeight = resolveCssLengthToPx(height, hostEl, hostRect.height, 'height')
    const widthPx = clamp(rawWidth, minWidth, maxWidth)
    const heightPx = Math.min(rawHeight, maxHeight)

    return {
      x: source?.x ?? Math.max(DEFAULT_DETACHED_GAP, (hostRect.width - widthPx) / 2),
      y: source?.y ?? DEFAULT_DETACHED_TOP,
      width,
      height: heightPx === rawHeight ? height : heightPx,
    }
  }

  function resolveCurrentDetachedBounds(): ChatDetachedBounds {
    const externalBounds = options.detachedBoundsState.value

    if (!externalBounds) {
      return resolveDefaultDetachedBounds()
    }

    return {
      ...resolveDefaultDetachedBounds(externalBounds),
      ...externalBounds,
    }
  }

  function resolveDetachedSnapshot(bounds = resolveCurrentDetachedBounds()): DetachedBoundsSnapshot {
    const raw = {
      x: bounds.x ?? undefined,
      y: bounds.y ?? undefined,
      width: bounds.width ?? DEFAULT_DETACHED_WIDTH,
      height: bounds.height ?? DEFAULT_DETACHED_HEIGHT,
    }
    const hostEl = options.hostRef.value

    if (!hostEl) {
      const widthPx = resolveCssLengthToPx(raw.width, null, DEFAULT_DETACHED_WIDTH)
      const heightPx = resolveCssLengthToPx(raw.height, null, 0, 'height')

      return {
        raw,
        rawWidth: widthPx,
        rawHeight: heightPx,
        widthPx,
        heightPx,
        x: raw.x ?? DEFAULT_DETACHED_GAP,
        y: raw.y ?? DEFAULT_DETACHED_TOP,
        xMax: raw.x ?? DEFAULT_DETACHED_GAP,
        yMax: raw.y ?? DEFAULT_DETACHED_TOP,
        minWidth: 1,
        maxWidth: Number.MAX_SAFE_INTEGER,
      }
    }

    const { hostRect, minWidth, maxWidth, maxHeight } = resolveWidthLimits(hostEl)
    const rawWidth = resolveCssLengthToPx(raw.width, hostEl, DEFAULT_DETACHED_WIDTH)
    const rawHeight = resolveCssLengthToPx(raw.height, hostEl, hostRect.height, 'height')
    const widthPx = clamp(rawWidth, minWidth, maxWidth)
    const heightPx = Math.min(rawHeight, maxHeight)
    const xMax = Math.max(DEFAULT_DETACHED_GAP, hostRect.width - widthPx - DEFAULT_DETACHED_GAP)
    const yMax = Math.max(DEFAULT_DETACHED_TOP, hostRect.height - heightPx - DEFAULT_DETACHED_GAP)
    const defaultX = Math.max(DEFAULT_DETACHED_GAP, (hostRect.width - widthPx) / 2)

    return {
      raw,
      rawWidth,
      rawHeight,
      widthPx,
      heightPx,
      x: clamp(raw.x ?? defaultX, DEFAULT_DETACHED_GAP, xMax),
      y: clamp(raw.y ?? DEFAULT_DETACHED_TOP, DEFAULT_DETACHED_TOP, yMax),
      xMax,
      yMax,
      minWidth,
      maxWidth,
    }
  }

  function toCommittedDetachedBounds(snapshot: DetachedBoundsSnapshot): ChatDetachedBounds {
    return {
      x: snapshot.x,
      y: snapshot.y,
      width: snapshot.widthPx === snapshot.rawWidth ? snapshot.raw.width : snapshot.widthPx,
      height: snapshot.heightPx === snapshot.rawHeight ? snapshot.raw.height : snapshot.heightPx,
    }
  }

  function commitDetachedBounds(nextBounds: ChatDetachedBounds): void {
    if (areDetachedBoundsEqual(options.detachedBoundsState.value, nextBounds)) {
      return
    }

    options.detachedBoundsState.value = nextBounds
  }

  function ensureDetachedBounds(): ChatDetachedBounds {
    const nextBounds = toCommittedDetachedBounds(resolveDetachedSnapshot())
    commitDetachedBounds(nextBounds)
    return nextBounds
  }

  function clampDetachedBounds(): void {
    if (!isDetached.value || isDragging.value || isResizing.value) {
      return
    }

    const nextBounds = toCommittedDetachedBounds(resolveDetachedSnapshot())
    commitDetachedBounds(nextBounds)
  }

  function resolveDraggedDetachedBounds(nextX: number, nextY: number): ChatDetachedBounds {
    const currentBounds = resolveCurrentDetachedBounds()
    const snapshot = resolveDetachedSnapshot(currentBounds)

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
    body.style.cursor = state.bodyCursor
    body.style.userSelect = state.bodyUserSelect

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
    const snapshot = resolveDetachedSnapshot(detachedBounds)
    const body = hostEl.ownerDocument.body

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      edge,
      startBounds: snapshot,
      currentWidth: snapshot.widthPx,
      bodyCursor: body.style.cursor,
      bodyUserSelect: body.style.userSelect,
    }

    body.style.cursor = 'col-resize'
    body.style.userSelect = 'none'

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

  const detachedBounds = computed(() => toCommittedDetachedBounds(resolveDetachedSnapshot()))
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
