import { useDraggable, useResizeObserver } from '@vueuse/core'
import { computed, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import type { ChatSurfaceConfig, ChatSurfaceMode, ChatSurfaceRect } from '@/types/layout'
import { resolveCssLengthToPx, toCssLength } from '@/utils/cssLength'

interface UseChatSurfaceOptions {
  surfaceState: Ref<ChatSurfaceConfig | undefined>
  hostRef: Ref<HTMLElement | null>
  frameRef: Ref<HTMLElement | null>
  dragHandleRef: Ref<HTMLElement | null>
}

const DEFAULT_FLOATING_WIDTH = 420
const DEFAULT_FLOATING_HEIGHT = '80vh'
const DEFAULT_EDGE_WIDTH = 380
const DEFAULT_FLOATING_TOP = 24
const DEFAULT_FLOATING_GAP = 24
const DEFAULT_SNAP_THRESHOLD = 28
const DEFAULT_EDGE_DRAG_OFFSET = 24

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// 基于宿主容器收敛当前 surface 尺寸，并返回本次可移动边界。
function resolveSurfaceMetrics(
  hostEl: HTMLElement,
  rect: Pick<ChatSurfaceRect, 'width' | 'height'>,
  fallbackWidth: number,
  fallbackHeight: number,
) {
  const hostRect = hostEl.getBoundingClientRect()
  const maxWidth = Math.max(1, hostRect.width - DEFAULT_FLOATING_GAP * 2)
  const maxHeight = Math.max(1, hostRect.height - DEFAULT_FLOATING_TOP - DEFAULT_FLOATING_GAP)
  const rawWidth = resolveCssLengthToPx(rect.width, hostEl, fallbackWidth)
  const rawHeight = resolveCssLengthToPx(rect.height, hostEl, fallbackHeight, 'height')
  const widthPx = Math.min(rawWidth, maxWidth)
  const heightPx = Math.min(rawHeight, maxHeight)
  const xMax = Math.max(DEFAULT_FLOATING_GAP, hostRect.width - widthPx - DEFAULT_FLOATING_GAP)
  const yMax = Math.max(DEFAULT_FLOATING_TOP, hostRect.height - heightPx - DEFAULT_FLOATING_GAP)

  return {
    hostRect,
    rawWidth,
    rawHeight,
    widthPx,
    heightPx,
    xMax,
    yMax,
  }
}

export function useChatSurface(options: UseChatSurfaceOptions) {
  // 记录最近一次浮窗态的位置和尺寸，供 edge-right 恢复为 floating 时复用。
  const lastFloatingRect = shallowRef<ChatSurfaceRect | null>(null)
  // 拖拽中只标记右侧吸附候选，真正模式切换在拖拽结束时提交。
  const pendingSnapPlacement = shallowRef<ChatSurfaceMode | null>(null)
  const surfaceMode = computed<ChatSurfaceMode>(() => options.surfaceState.value?.mode ?? 'fullscreen')
  const isFloating = computed(() => surfaceMode.value === 'floating')
  const isEdgeRight = computed(() => surfaceMode.value === 'edge-right')
  const isFullscreen = computed(() => surfaceMode.value === 'fullscreen')
  const isDraggable = computed(() => options.surfaceState.value?.draggable ?? true)
  const canDragSurface = computed(() => (isFloating.value || isEdgeRight.value) && isDraggable.value)
  const snapThreshold = computed(() => {
    const value = options.surfaceState.value?.snapThreshold
    return typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_SNAP_THRESHOLD
  })
  const edgeWidth = computed(() => toCssLength(options.surfaceState.value?.edgeWidth, `${DEFAULT_EDGE_WIDTH}px`))

  function updateSurface(patch: Partial<ChatSurfaceConfig>): void {
    options.surfaceState.value = {
      ...options.surfaceState.value,
      ...patch,
    }
  }

  // 基于外部配置生成默认浮窗位置，未传 x 时默认水平居中。
  function resolveDefaultFloatingRect(): ChatSurfaceRect {
    const hostEl = options.hostRef.value
    const currentRect = options.surfaceState.value?.floatingRect
    const width = currentRect?.width ?? DEFAULT_FLOATING_WIDTH
    const height = currentRect?.height ?? DEFAULT_FLOATING_HEIGHT

    if (!hostEl) {
      return {
        x: currentRect?.x ?? DEFAULT_FLOATING_GAP,
        y: currentRect?.y ?? DEFAULT_FLOATING_TOP,
        width,
        height,
      }
    }

    const { hostRect, widthPx } = resolveSurfaceMetrics(
      hostEl,
      { width, height },
      DEFAULT_FLOATING_WIDTH,
      resolveCssLengthToPx(height, hostEl, hostEl.getBoundingClientRect().height, 'height'),
    )
    const x = currentRect?.x ?? Math.max(DEFAULT_FLOATING_GAP, (hostRect.width - widthPx) / 2)
    const y = currentRect?.y ?? DEFAULT_FLOATING_TOP

    return {
      x,
      y,
      width,
      height,
    }
  }

  function ensureFloatingRect(): ChatSurfaceRect {
    const nextRect = {
      ...resolveDefaultFloatingRect(),
      ...options.surfaceState.value?.floatingRect,
    }

    lastFloatingRect.value = nextRect
    updateSurface({ floatingRect: nextRect })
    return nextRect
  }

  function resolveCurrentFloatingRect(): ChatSurfaceRect {
    return options.surfaceState.value?.floatingRect ?? lastFloatingRect.value ?? resolveDefaultFloatingRect()
  }

  // edge-right 开始拖拽前，先推导出一个贴近右边的浮窗 rect，作为拖拽起点。
  function resolveEdgeFloatingRect(): ChatSurfaceRect {
    const hostEl = options.hostRef.value
    const frameEl = options.frameRef.value
    const restoreRect = lastFloatingRect.value ?? options.surfaceState.value?.floatingRect
    const width = restoreRect?.width ?? options.surfaceState.value?.edgeWidth ?? DEFAULT_FLOATING_WIDTH
    const height = restoreRect?.height ?? DEFAULT_FLOATING_HEIGHT

    if (!hostEl || !frameEl) {
      return {
        x: restoreRect?.x ?? DEFAULT_FLOATING_GAP,
        y: restoreRect?.y ?? DEFAULT_FLOATING_TOP,
        width,
        height,
      }
    }

    const frameRect = frameEl.getBoundingClientRect()
    const { hostRect, widthPx, yMax } = resolveSurfaceMetrics(
      hostEl,
      { width, height },
      frameRect.width,
      frameRect.height,
    )
    const x = Math.max(DEFAULT_FLOATING_GAP, hostRect.width - widthPx - DEFAULT_EDGE_DRAG_OFFSET)
    const y = clamp(restoreRect?.y ?? DEFAULT_FLOATING_TOP, DEFAULT_FLOATING_TOP, yMax)

    return {
      x,
      y,
      width,
      height,
    }
  }

  const { x, y, isDragging } = useDraggable(options.frameRef, {
    handle: options.dragHandleRef,
    containerElement: options.hostRef,
    initialValue: { x: DEFAULT_FLOATING_GAP, y: DEFAULT_FLOATING_TOP },
    preventDefault: true,
    buttons: [0],
    disabled: computed(() => !canDragSurface.value),
    onStart: () => {
      if (!canDragSurface.value) {
        return false
      }

      const rect = isEdgeRight.value ? resolveEdgeFloatingRect() : resolveCurrentFloatingRect()
      if (isEdgeRight.value) {
        lastFloatingRect.value = rect
        updateSurface({
          mode: 'floating',
          floatingRect: rect,
        })
      }

      x.value = rect.x ?? DEFAULT_FLOATING_GAP
      y.value = rect.y ?? DEFAULT_FLOATING_TOP
      pendingSnapPlacement.value = null
    },
    onMove: (position) => {
      if (!options.hostRef.value || !options.frameRef.value) {
        return
      }

      const hostRect = options.hostRef.value.getBoundingClientRect()
      const frameRect = options.frameRef.value.getBoundingClientRect()
      const remainingRight = hostRect.right - frameRect.right
      pendingSnapPlacement.value = remainingRight <= snapThreshold.value ? 'edge-right' : null
      x.value = position.x
      y.value = position.y
    },
    onEnd: (position) => {
      const currentRect = resolveCurrentFloatingRect()
      const nextRect = {
        ...currentRect,
        x: position.x,
        y: position.y,
      }

      lastFloatingRect.value = nextRect

      if (pendingSnapPlacement.value === 'edge-right') {
        updateSurface({
          mode: 'edge-right',
          floatingRect: nextRect,
          edgeWidth: currentRect.width ?? edgeWidth.value,
        })
      } else {
        updateSurface({
          mode: 'floating',
          floatingRect: nextRect,
        })
      }

      pendingSnapPlacement.value = null
    },
  })

  function clampFloatingRect(): void {
    if (!options.hostRef.value || !isFloating.value || isDragging.value) {
      return
    }

    // 宿主尺寸变化或外部 rect 变化后，保证浮窗仍被约束在宿主可视范围内。
    const hostEl = options.hostRef.value
    const rect = resolveCurrentFloatingRect()
    const { rawWidth, rawHeight, widthPx, heightPx, xMax, yMax } = resolveSurfaceMetrics(
      hostEl,
      rect,
      DEFAULT_FLOATING_WIDTH,
      hostEl.getBoundingClientRect().height,
    )
    const nextX = clamp(rect.x ?? DEFAULT_FLOATING_GAP, DEFAULT_FLOATING_GAP, xMax)
    const nextY = clamp(rect.y ?? DEFAULT_FLOATING_TOP, DEFAULT_FLOATING_TOP, yMax)
    const nextWidth = widthPx === rawWidth ? rect.width : widthPx
    const nextHeight = heightPx === rawHeight ? rect.height : heightPx

    if (nextX === rect.x && nextY === rect.y && nextWidth === rect.width && nextHeight === rect.height) {
      return
    }

    const nextRect = {
      ...rect,
      x: nextX,
      y: nextY,
      width: nextWidth,
      height: nextHeight,
    }

    lastFloatingRect.value = nextRect
    updateSurface({ floatingRect: nextRect })
  }

  watch(
    surfaceMode,
    (mode, previousMode) => {
      if (mode === 'floating') {
        const rect =
          previousMode === 'edge-right' && lastFloatingRect.value ? lastFloatingRect.value : ensureFloatingRect()

        x.value = rect.x ?? DEFAULT_FLOATING_GAP
        y.value = rect.y ?? DEFAULT_FLOATING_TOP
        return
      }

      if (previousMode === 'floating') {
        lastFloatingRect.value = {
          ...resolveCurrentFloatingRect(),
          x: x.value,
          y: y.value,
        }
      }

      pendingSnapPlacement.value = null
    },
    { immediate: true },
  )

  useResizeObserver(options.hostRef, () => {
    clampFloatingRect()
  })

  const floatingRect = computed(() => resolveCurrentFloatingRect())
  const floatingX = computed(() => (isDragging.value ? x.value : (floatingRect.value.x ?? DEFAULT_FLOATING_GAP)))
  const floatingY = computed(() => (isDragging.value ? y.value : (floatingRect.value.y ?? DEFAULT_FLOATING_TOP)))

  const surfaceClass = computed(() => ({
    'tr-chat-layout-surface--fullscreen': isFullscreen.value,
    'tr-chat-layout-surface--floating': isFloating.value,
    'tr-chat-layout-surface--edge-right': isEdgeRight.value,
    'tr-chat-layout-surface--dragging': isDragging.value,
    'tr-chat-layout-surface--draggable': canDragSurface.value,
    'tr-chat-layout-surface--snap-pending': pendingSnapPlacement.value === 'edge-right',
  }))

  const surfaceStyle = computed<CSSProperties>(() => {
    if (isFloating.value) {
      return {
        left: `${floatingX.value}px`,
        top: `${floatingY.value}px`,
        width: toCssLength(floatingRect.value.width, `${DEFAULT_FLOATING_WIDTH}px`),
        height: toCssLength(floatingRect.value.height, DEFAULT_FLOATING_HEIGHT),
      }
    }

    if (isEdgeRight.value) {
      return {
        width: edgeWidth.value,
      }
    }

    return {}
  })

  const dragBarClass = computed(() => ({
    'tr-chat-layout-surface__drag-bar--draggable': canDragSurface.value,
  }))

  return {
    isFloating,
    isEdgeRight,
    isFullscreen,
    showDragBar: computed(() => isFloating.value || isEdgeRight.value),
    surfaceClass,
    surfaceStyle,
    dragBarClass,
  }
}
