import type {
  LayoutDefaultFloatingConfig,
  LayoutFloatingBase,
  LayoutFloatingPlacement,
  LayoutFloatingRect,
  LayoutFloatingResizeHandle,
} from '../index.type'
import { clamp } from './math'

export interface FloatingBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface FloatingConstraints {
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

export interface FloatingSnapshot {
  rect: LayoutFloatingRect
  bounds: FloatingBounds
  constraints: FloatingConstraints
  xMax: number
  yMax: number
}

export const DEFAULT_FLOATING_WIDTH = 420
export const DEFAULT_FLOATING_HEIGHT = 560
export const DEFAULT_FLOATING_GAP = 24
export const DEFAULT_FLOATING_TOP = DEFAULT_FLOATING_GAP
export const DEFAULT_FLOATING_OFFSET = 24
export const DEFAULT_MIN_FLOATING_WIDTH = 320
export const DEFAULT_MIN_FLOATING_HEIGHT = 240

type FloatingRectLike = Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> & Partial<LayoutFloatingBase>

interface ViewportSize {
  width: number
  height: number
}

function isFloatingRect(value: LayoutFloatingRect | LayoutDefaultFloatingConfig): value is LayoutFloatingRect {
  return typeof value.x === 'number' && typeof value.y === 'number'
}

function resolveViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
      height: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
    }
  }

  const viewport = window.visualViewport

  if (viewport) {
    return {
      width: viewport.width,
      height: viewport.height,
    }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function getPlacementPosition(
  placement: LayoutFloatingPlacement,
  bounds: FloatingBounds,
  width: number,
  height: number,
  offset: number,
) {
  switch (placement) {
    case 'top-left':
      return {
        x: bounds.left + offset,
        y: bounds.top + offset,
      }
    case 'top-right':
      return {
        x: bounds.right - width - offset,
        y: bounds.top + offset,
      }
    case 'bottom-left':
      return {
        x: bounds.left + offset,
        y: bounds.bottom - height - offset,
      }
    case 'bottom-right':
      return {
        x: bounds.right - width - offset,
        y: bounds.bottom - height - offset,
      }
    case 'center':
    default:
      return {
        x: (bounds.left + bounds.right - width) / 2,
        y: (bounds.top + bounds.bottom - height) / 2,
      }
  }
}

export function resolveViewportBounds(gap = DEFAULT_FLOATING_GAP, topGap = DEFAULT_FLOATING_TOP): FloatingBounds {
  const viewport = resolveViewportSize()

  return {
    left: gap,
    top: topGap,
    right: Math.max(gap, viewport.width - gap),
    bottom: Math.max(topGap, viewport.height - gap),
  }
}

export function resolveFloatingConstraints(
  source?: Partial<LayoutFloatingRect | LayoutDefaultFloatingConfig>,
): FloatingConstraints {
  const bounds = resolveViewportBounds()
  const maxWidth = Math.max(1, bounds.right - bounds.left)
  const maxHeight = Math.max(1, bounds.bottom - bounds.top)
  const minWidth = clamp(source?.minWidth ?? DEFAULT_MIN_FLOATING_WIDTH, 1, maxWidth)
  const minHeight = clamp(source?.minHeight ?? DEFAULT_MIN_FLOATING_HEIGHT, 1, maxHeight)

  return {
    minWidth,
    maxWidth: clamp(source?.maxWidth ?? maxWidth, minWidth, maxWidth),
    minHeight,
    maxHeight: clamp(source?.maxHeight ?? maxHeight, minHeight, maxHeight),
  }
}

export function clampFloatingRect(
  rect: FloatingRectLike,
  constraints = resolveFloatingConstraints(rect),
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth)
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight)
  const xMax = Math.max(bounds.left, bounds.right - width)
  const yMax = Math.max(bounds.top, bounds.bottom - height)

  return {
    x: clamp(rect.x, bounds.left, xMax),
    y: clamp(rect.y, bounds.top, yMax),
    width,
    height,
    draggable: rect.draggable ?? true,
    resizable: rect.resizable ?? false,
    minWidth: constraints.minWidth,
    maxWidth: constraints.maxWidth,
    minHeight: constraints.minHeight,
    maxHeight: constraints.maxHeight,
  }
}

export function clampFloatingRectByHandle(
  rect: FloatingRectLike,
  handle: LayoutFloatingResizeHandle,
  constraints = resolveFloatingConstraints(rect),
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height
  const availableWidthFromLeft = right - bounds.left
  const availableHeightFromTop = bottom - bounds.top

  let width = rect.width
  let height = rect.height
  let x = rect.x
  let y = rect.y

  if (handle.includes('w')) {
    if (availableWidthFromLeft >= constraints.minWidth) {
      width = clamp(rect.width, constraints.minWidth, Math.min(constraints.maxWidth, availableWidthFromLeft))
      x = right - width
    } else {
      width = constraints.minWidth
      x = bounds.left
    }
  } else if (handle.includes('e')) {
    width = clamp(
      rect.width,
      constraints.minWidth,
      Math.min(constraints.maxWidth, Math.max(constraints.minWidth, bounds.right - rect.x)),
    )
    x = rect.x
  }

  if (handle.includes('n')) {
    if (availableHeightFromTop >= constraints.minHeight) {
      height = clamp(rect.height, constraints.minHeight, Math.min(constraints.maxHeight, availableHeightFromTop))
      y = bottom - height
    } else {
      height = constraints.minHeight
      y = bounds.top
    }
  } else if (handle.includes('s')) {
    height = clamp(
      rect.height,
      constraints.minHeight,
      Math.min(constraints.maxHeight, Math.max(constraints.minHeight, bounds.bottom - rect.y)),
    )
    y = rect.y
  }

  return clampFloatingRect(
    {
      ...rect,
      x,
      y,
      width,
      height,
    },
    constraints,
    bounds,
  )
}

export function resolveDefaultFloatingRect(
  config?: LayoutDefaultFloatingConfig,
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const constraints = resolveFloatingConstraints(config)
  const width = clamp(config?.width ?? DEFAULT_FLOATING_WIDTH, constraints.minWidth, constraints.maxWidth)
  const height = clamp(config?.height ?? DEFAULT_FLOATING_HEIGHT, constraints.minHeight, constraints.maxHeight)
  const placement = config?.placement ?? 'center'
  const offset = config?.offset ?? DEFAULT_FLOATING_OFFSET
  const position = getPlacementPosition(placement, bounds, width, height, offset)

  return clampFloatingRect(
    {
      x: position.x,
      y: position.y,
      width,
      height,
      draggable: config?.draggable ?? true,
      resizable: config?.resizable ?? false,
      minWidth: config?.minWidth,
      maxWidth: config?.maxWidth,
      minHeight: config?.minHeight,
      maxHeight: config?.maxHeight,
    },
    constraints,
    bounds,
  )
}

export function normalizeFloatingRect(
  rectLike: LayoutFloatingRect | LayoutDefaultFloatingConfig | undefined,
): LayoutFloatingRect {
  if (!rectLike) {
    return resolveDefaultFloatingRect()
  }

  if (isFloatingRect(rectLike)) {
    return clampFloatingRect(
      {
        x: rectLike.x,
        y: rectLike.y,
        width: rectLike.width,
        height: rectLike.height,
        draggable: rectLike.draggable,
        resizable: rectLike.resizable,
        minWidth: rectLike.minWidth,
        maxWidth: rectLike.maxWidth,
        minHeight: rectLike.minHeight,
        maxHeight: rectLike.maxHeight,
      },
      resolveFloatingConstraints(rectLike),
    )
  }

  return resolveDefaultFloatingRect(rectLike)
}

export function resolveFloatingSnapshot(
  config: LayoutFloatingRect | LayoutDefaultFloatingConfig | undefined,
): FloatingSnapshot {
  const bounds = resolveViewportBounds()
  const rect = normalizeFloatingRect(config)
  const constraints = resolveFloatingConstraints(rect)
  const normalizedRect = clampFloatingRect(rect, constraints, bounds)

  return {
    rect: normalizedRect,
    bounds,
    constraints,
    xMax: Math.max(bounds.left, bounds.right - normalizedRect.width),
    yMax: Math.max(bounds.top, bounds.bottom - normalizedRect.height),
  }
}

export function toCommittedFloatingConfig(snapshot: FloatingSnapshot): LayoutFloatingRect {
  return snapshot.rect
}

export function areFloatingGeometryEqual(
  left: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
  right: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
