import { useDraggable, useEventListener, useWindowSize } from '@vueuse/core'
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type {
  LayoutFloatingConfig,
  LayoutFloatingDragEventDetail,
  LayoutFloatingResizeEventDetail,
  LayoutMode,
  LayoutPlacement,
} from '../index.type'
import { toCssLength } from '../utils/cssLength'
import {
  areFloatingGeometryEqual,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_TOP,
  DEFAULT_FLOATING_WIDTH,
  resolveFloatingSnapshot,
  toCommittedFloatingConfig,
  type FloatingSnapshot,
} from '../utils/layoutSurfaceGeometry'
import { resolveFloatingResizeGeometry } from '../utils/layoutSurfaceResize'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clamp } from '../utils/math'

interface UseLayoutSurfaceOptions {
  mode: MaybeRefOrGetter<LayoutMode>
  floating: MaybeRefOrGetter<LayoutFloatingConfig | undefined>
  commitFloating: (nextFloating: LayoutFloatingConfig) => void
  frameRef: Ref<HTMLElement | null>
  dragHandleRef: Ref<HTMLElement | null>
  onFloatingDragStart?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingResizeStart?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResize?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResizeEnd?: (detail: LayoutFloatingResizeEventDetail) => void
}

interface FloatingResizeState {
  pointerId: number
  handleEl: HTMLElement
  edge: LayoutPlacement
  currentBounds: FloatingSnapshot
  lastPointerX: number
  currentWidth: number
  bodyState: BodyInteractionState
}

export function useLayoutSurface(options: UseLayoutSurfaceOptions) {
  const activeResize = shallowRef<FloatingResizeState | null>(null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  const { width: viewportWidth, height: viewportHeight } = useWindowSize({
    type: 'visual',
    initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
    initialHeight: 0,
  })
  const mode = computed<LayoutMode>(() => toValue(options.mode))
  const isFloating = computed(() => mode.value === 'floating')
  const isNormal = computed(() => mode.value === 'normal')
  const isFloatingDraggable = computed(() => toValue(options.floating)?.draggable ?? true)
  const isFloatingResizable = computed(() => toValue(options.floating)?.resizable === true)
  const isResizing = computed(() => activeResize.value !== null)
  const activeResizeEdge = computed<LayoutPlacement | null>(() => activeResize.value?.edge ?? null)
  const canDragFloating = computed(() => isFloating.value && isFloatingDraggable.value && !isResizing.value)

  function getCurrentFloatingConfig(): LayoutFloatingConfig | undefined {
    return toValue(options.floating)
  }

  function getFloatingSnapshot(config = getCurrentFloatingConfig()): FloatingSnapshot {
    return resolveFloatingSnapshot(config)
  }

  function getCommittedFloatingGeometry(config = getCurrentFloatingConfig()) {
    return toCommittedFloatingConfig(getFloatingSnapshot(config))
  }

  function commitFloatingGeometry(nextGeometry: Pick<LayoutFloatingConfig, 'x' | 'y' | 'width' | 'height'>): void {
    const currentFloating = toValue(options.floating)
    const nextFloating = {
      ...(currentFloating ?? {}),
      ...nextGeometry,
    }

    if (areFloatingGeometryEqual(currentFloating, nextFloating)) {
      return
    }

    options.commitFloating(nextFloating)
  }

  function clampFloatingBounds(): void {
    if (!isFloating.value || isDragging.value || isResizing.value) {
      return
    }

    const nextGeometry = getCommittedFloatingGeometry()

    if (!areFloatingGeometryEqual(getCurrentFloatingConfig(), nextGeometry)) {
      commitFloatingGeometry(nextGeometry)
    }
  }

  function resolveDraggedFloatingGeometry(
    nextX: number,
    nextY: number,
  ): Pick<LayoutFloatingConfig, 'x' | 'y' | 'width' | 'height'> {
    const snapshot = getFloatingSnapshot()

    return {
      ...toCommittedFloatingConfig(snapshot),
      x: clamp(nextX, DEFAULT_FLOATING_GAP, snapshot.xMax),
      y: clamp(nextY, DEFAULT_FLOATING_TOP, snapshot.yMax),
    }
  }

  function toFloatingDragDetail(
    geometry: Pick<LayoutFloatingConfig, 'x' | 'y' | 'width' | 'height'>,
  ): LayoutFloatingDragEventDetail {
    return {
      x: geometry.x ?? DEFAULT_FLOATING_GAP,
      y: geometry.y ?? DEFAULT_FLOATING_TOP,
    }
  }

  function applyDraggedPosition(nextX: number, nextY: number) {
    const nextGeometry = resolveDraggedFloatingGeometry(nextX, nextY)
    x.value = nextGeometry.x ?? DEFAULT_FLOATING_GAP
    y.value = nextGeometry.y ?? DEFAULT_FLOATING_TOP
    commitFloatingGeometry(nextGeometry)
    return nextGeometry
  }

  const { x, y, isDragging } = useDraggable(options.frameRef, {
    handle: options.dragHandleRef,
    initialValue: { x: DEFAULT_FLOATING_GAP, y: DEFAULT_FLOATING_TOP },
    preventDefault: true,
    buttons: [0],
    disabled: computed(() => !canDragFloating.value),
    onStart: () => {
      if (!canDragFloating.value) {
        return false
      }

      const snapshot = getFloatingSnapshot()
      x.value = snapshot.x
      y.value = snapshot.y
      options.onFloatingDragStart?.({
        x: snapshot.x,
        y: snapshot.y,
      })
    },
    onMove: (position) => {
      const nextGeometry = applyDraggedPosition(position.x, position.y)
      options.onFloatingDrag?.(toFloatingDragDetail(nextGeometry))
    },
    onEnd: (position) => {
      const nextGeometry = applyDraggedPosition(position.x, position.y)
      options.onFloatingDragEnd?.(toFloatingDragDetail(nextGeometry))
    },
  })

  const canResizeFloating = computed(() => isFloating.value && isFloatingResizable.value && !isDragging.value)

  function stopResize(pointerId?: number): void {
    const state = activeResize.value
    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)

    options.onFloatingResizeEnd?.({
      edge: state.edge,
      width: state.currentWidth,
    })

    activeResize.value = null
  }

  function startResize(edge: LayoutPlacement, event: PointerEvent): void {
    if (activeResize.value || isDragging.value || !event.isPrimary || event.button !== 0 || !canResizeFloating.value) {
      return
    }

    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return
    }

    const snapshot = getFloatingSnapshot()

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      edge,
      currentBounds: snapshot,
      lastPointerX: event.clientX,
      currentWidth: snapshot.widthPx,
      bodyState: lockBodyInteraction(handleEl.ownerDocument.body, 'col-resize'),
    }

    options.onFloatingResizeStart?.({
      edge,
      width: snapshot.widthPx,
    })
  }

  function applyResizeDelta(state: FloatingResizeState, deltaX: number): void {
    const nextGeometry = resolveFloatingResizeGeometry({
      edge: state.edge,
      deltaX,
      snapshot: state.currentBounds,
      viewportWidth: viewportWidth.value,
    })

    state.currentBounds = resolveFloatingSnapshot({
      ...(getCurrentFloatingConfig() ?? {}),
      ...nextGeometry,
    })
    state.currentWidth = state.currentBounds.widthPx
    commitFloatingGeometry(nextGeometry)

    options.onFloatingResize?.({
      edge: state.edge,
      width: state.currentWidth,
    })
  }

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const state = activeResize.value
    if (!state || event.pointerId !== state.pointerId) {
      return
    }

    const pointerX = event.clientX
    const deltaX = pointerX - state.lastPointerX

    if (deltaX === 0) {
      return
    }

    applyResizeDelta(state, deltaX)
    state.lastPointerX = pointerX
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
    mode,
    (variant) => {
      if (variant === 'floating') {
        const snapshot = getFloatingSnapshot()
        x.value = snapshot.x
        y.value = snapshot.y
      }
    },
    { immediate: true },
  )

  watch([mode, () => toValue(options.floating), viewportWidth, viewportHeight], () => {
    clampFloatingBounds()
  })

  const floatingConfig = computed(() => getCommittedFloatingGeometry())
  const surfaceClass = computed(() => ({
    'tr-layout-surface--normal': isNormal.value,
    'tr-layout-surface--floating': isFloating.value,
    'tr-layout-surface--dragging': isDragging.value,
    'tr-layout-surface--draggable': canDragFloating.value,
    'tr-layout-surface--resizable': isFloating.value && isFloatingResizable.value,
    'tr-layout-surface--resizing': isResizing.value,
    'tr-layout-surface--resizing-left': activeResizeEdge.value === 'left',
    'tr-layout-surface--resizing-right': activeResizeEdge.value === 'right',
  }))

  const surfaceStyle = computed<CSSProperties>(() => {
    if (!isFloating.value) {
      return {}
    }

    return {
      left: `${floatingConfig.value.x ?? DEFAULT_FLOATING_GAP}px`,
      top: `${floatingConfig.value.y ?? DEFAULT_FLOATING_TOP}px`,
      width: toCssLength(floatingConfig.value.width, `${DEFAULT_FLOATING_WIDTH}px`),
      height: toCssLength(floatingConfig.value.height, DEFAULT_FLOATING_HEIGHT),
    }
  })

  const dragBarClass = computed(() => ({
    'tr-layout-surface__drag-bar--draggable': canDragFloating.value,
  }))

  return {
    isFloating,
    showDragBar: computed(() => isFloating.value),
    showResizeHandles: computed(() => isFloating.value && isFloatingResizable.value),
    surfaceClass,
    surfaceStyle,
    dragBarClass,
    activeResizeEdge,
    leftResizeHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize('left', event),
    },
    rightResizeHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize('right', event),
    },
  }
}
