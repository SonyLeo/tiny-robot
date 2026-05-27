import { useDraggable, useEventListener, useWindowSize } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import type { ChatFloatingConfig, ChatFloatingResizeEventDetail, ChatLayoutMode, ChatPlacement } from '@/types/layout'
import { toCssLength } from '@/utils/cssLength'
import {
  areFloatingGeometryEqual,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_TOP,
  DEFAULT_FLOATING_WIDTH,
  resolveCurrentFloatingConfig,
  resolveFloatingSnapshot,
  toCommittedFloatingConfig,
  type FloatingSnapshot,
} from '@/utils/chatSurfaceGeometry'
import { resolveFloatingResizeGeometry } from '@/utils/chatSurfaceResize'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '@/utils/domInteraction'
import { clamp } from '@/utils/math'

interface UseChatSurfaceOptions {
  modeState: Ref<ChatLayoutMode | undefined>
  floatingState: Ref<ChatFloatingConfig | undefined>
  frameRef: Ref<HTMLElement | null>
  dragHandleRef: Ref<HTMLElement | null>
  onFloatingResizeStart?: (detail: ChatFloatingResizeEventDetail) => void
  onFloatingResize?: (detail: ChatFloatingResizeEventDetail) => void
  onFloatingResizeEnd?: (detail: ChatFloatingResizeEventDetail) => void
}

interface FloatingResizeState {
  pointerId: number
  handleEl: HTMLElement
  edge: ChatPlacement
  currentBounds: FloatingSnapshot
  lastPointerX: number
  currentWidth: number
  bodyState: BodyInteractionState
}

export function useChatSurface(options: UseChatSurfaceOptions) {
  const activeResize = shallowRef<FloatingResizeState | null>(null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  const { width: viewportWidth, height: viewportHeight } = useWindowSize({
    type: 'visual',
    initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
    initialHeight: 0,
  })
  const mode = computed<ChatLayoutMode>(() => options.modeState.value ?? 'normal')
  const isFloating = computed(() => mode.value === 'floating')
  const isNormal = computed(() => mode.value === 'normal')
  const isFloatingDraggable = computed(() => options.floatingState.value?.draggable ?? true)
  const isFloatingResizable = computed(() => options.floatingState.value?.resizable === true)
  const isResizing = computed(() => activeResize.value !== null)
  const activeResizeEdge = computed<ChatPlacement | null>(() => activeResize.value?.edge ?? null)
  const canDragFloating = computed(() => isFloating.value && isFloatingDraggable.value && !isResizing.value)

  function getCurrentFloatingConfig(): ChatFloatingConfig {
    return resolveCurrentFloatingConfig(options.floatingState.value)
  }

  function getFloatingSnapshot(config = getCurrentFloatingConfig()): FloatingSnapshot {
    return resolveFloatingSnapshot(config)
  }

  function commitFloatingGeometry(nextGeometry: Pick<ChatFloatingConfig, 'x' | 'y' | 'width' | 'height'>): void {
    if (areFloatingGeometryEqual(options.floatingState.value, nextGeometry)) {
      return
    }

    options.floatingState.value = {
      ...(options.floatingState.value ?? {}),
      ...nextGeometry,
    }
  }

  function ensureFloatingConfig(): ChatFloatingConfig {
    const nextGeometry = toCommittedFloatingConfig(getFloatingSnapshot())

    if (!options.floatingState.value || !areFloatingGeometryEqual(options.floatingState.value, nextGeometry)) {
      options.floatingState.value = {
        ...(options.floatingState.value ?? {}),
        ...nextGeometry,
      }
    }

    return {
      ...(options.floatingState.value ?? {}),
      ...nextGeometry,
    }
  }

  function clampFloatingBounds(): void {
    if (!isFloating.value || isDragging.value || isResizing.value) {
      return
    }

    commitFloatingGeometry(toCommittedFloatingConfig(getFloatingSnapshot()))
  }

  function resolveDraggedFloatingGeometry(
    nextX: number,
    nextY: number,
  ): Pick<ChatFloatingConfig, 'x' | 'y' | 'width' | 'height'> {
    const snapshot = getFloatingSnapshot()

    return {
      ...toCommittedFloatingConfig(snapshot),
      x: clamp(nextX, DEFAULT_FLOATING_GAP, snapshot.xMax),
      y: clamp(nextY, DEFAULT_FLOATING_TOP, snapshot.yMax),
    }
  }

  function applyDraggedPosition(nextX: number, nextY: number): void {
    const nextGeometry = resolveDraggedFloatingGeometry(nextX, nextY)
    x.value = nextGeometry.x ?? DEFAULT_FLOATING_GAP
    y.value = nextGeometry.y ?? DEFAULT_FLOATING_TOP
    commitFloatingGeometry(nextGeometry)
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

      const floatingConfig = ensureFloatingConfig()
      x.value = floatingConfig.x ?? DEFAULT_FLOATING_GAP
      y.value = floatingConfig.y ?? DEFAULT_FLOATING_TOP
    },
    onMove: (position) => applyDraggedPosition(position.x, position.y),
    onEnd: (position) => applyDraggedPosition(position.x, position.y),
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

    const body = state.handleEl.ownerDocument.body
    restoreBodyInteraction(body, state.bodyState)

    options.onFloatingResizeEnd?.({
      edge: state.edge,
      width: state.currentWidth,
    })

    activeResize.value = null
  }

  function startResize(edge: ChatPlacement, event: PointerEvent): void {
    if (activeResize.value || isDragging.value || !event.isPrimary || event.button !== 0 || !canResizeFloating.value) {
      return
    }

    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return
    }

    const floatingConfig = ensureFloatingConfig()
    const snapshot = getFloatingSnapshot(floatingConfig)
    const body = handleEl.ownerDocument.body

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      edge,
      currentBounds: snapshot,
      lastPointerX: event.clientX,
      currentWidth: snapshot.widthPx,
      bodyState: lockBodyInteraction(body, 'col-resize'),
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
      ...(options.floatingState.value ?? {}),
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
        const floatingConfig = ensureFloatingConfig()
        x.value = floatingConfig.x ?? DEFAULT_FLOATING_GAP
        y.value = floatingConfig.y ?? DEFAULT_FLOATING_TOP
      }
    },
    { immediate: true },
  )

  watch([mode, options.floatingState, viewportWidth, viewportHeight], () => {
    clampFloatingBounds()
  })

  const floatingConfig = computed(() => toCommittedFloatingConfig(getFloatingSnapshot()))
  const surfaceClass = computed(() => ({
    'tr-chat-layout-surface--normal': isNormal.value,
    'tr-chat-layout-surface--floating': isFloating.value,
    'tr-chat-layout-surface--dragging': isDragging.value,
    'tr-chat-layout-surface--draggable': canDragFloating.value,
    'tr-chat-layout-surface--resizable': isFloating.value && isFloatingResizable.value,
    'tr-chat-layout-surface--resizing': isResizing.value,
    'tr-chat-layout-surface--resizing-left': activeResizeEdge.value === 'left',
    'tr-chat-layout-surface--resizing-right': activeResizeEdge.value === 'right',
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
    'tr-chat-layout-surface__drag-bar--draggable': canDragFloating.value,
  }))

  return {
    isNormal,
    isFloating,
    isDragging,
    isResizing,
    activeResizeEdge,
    showDragBar: computed(() => isFloating.value),
    showResizeHandles: computed(() => isFloating.value && isFloatingResizable.value),
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
