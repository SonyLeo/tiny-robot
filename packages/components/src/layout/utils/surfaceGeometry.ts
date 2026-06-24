import type { LayoutFloatingPlacement, LayoutFloatingResizeHandle, LayoutFloatingState } from '../index.type'
import type { LayoutFloatingRect, LayoutResolvedFloating } from '../internal.type'
import { clamp } from './number'

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

export interface FloatingGeometrySnapshot {
  placement: LayoutFloatingPlacement
  rect: LayoutFloatingRect
  bounds: FloatingBounds
}

export const DEFAULT_FLOATING_WIDTH = 420
export const DEFAULT_FLOATING_HEIGHT = 560
export const DEFAULT_FLOATING_GAP = 0
export const DEFAULT_FLOATING_TOP = DEFAULT_FLOATING_GAP
export const DEFAULT_FLOATING_OFFSET = 24
export const DEFAULT_MIN_FLOATING_WIDTH = 320
export const DEFAULT_MIN_FLOATING_HEIGHT = 240

type FloatingStateInput = LayoutFloatingState &
  Partial<Pick<LayoutResolvedFloating, 'draggable' | 'resizable' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'>>

type FloatingRectInput = Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> &
  Partial<Pick<LayoutFloatingRect, 'draggable' | 'resizable' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'>>

type FloatingInput = LayoutFloatingRect | FloatingStateInput | undefined

interface ViewportSize {
  width: number
  height: number
}

interface FloatingOffset {
  x: number
  y: number
}

/**
 * 返回浮层 placement，未提供时默认 center。
 * @param source 浮层状态输入。
 * @returns 当前 placement。
 */
function resolveFloatingPlacement(source: Pick<LayoutFloatingState, 'placement'> | undefined): LayoutFloatingPlacement {
  return source?.placement ?? 'center'
}

/**
 * 判断输入是否已经是 rect 形态。
 * @param value 浮层输入。
 * @returns 是否为 rect。
 */
function isFloatingRect(value: FloatingInput): value is LayoutFloatingRect {
  return value !== undefined && 'x' in value && 'y' in value
}

/**
 * 返回当前视口尺寸。
 * @returns 视口宽高。
 */
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

/**
 * 根据 placement 和 offset 计算浮层左上角坐标。
 * @param placement 浮层锚点位置。
 * @param bounds 视口边界。
 * @param width 浮层宽度。
 * @param height 浮层高度。
 * @param offset 锚点偏移量。
 * @returns 浮层左上角坐标。
 */
function getPlacementPosition(
  placement: LayoutFloatingPlacement,
  bounds: FloatingBounds,
  width: number,
  height: number,
  offset: FloatingOffset,
): { x: number; y: number } {
  switch (placement) {
    case 'top-left':
      return {
        x: bounds.left + offset.x,
        y: bounds.top + offset.y,
      }
    case 'top-right':
      return {
        x: bounds.right - width - offset.x,
        y: bounds.top + offset.y,
      }
    case 'bottom-left':
      return {
        x: bounds.left + offset.x,
        y: bounds.bottom - height - offset.y,
      }
    case 'bottom-right':
      return {
        x: bounds.right - width - offset.x,
        y: bounds.bottom - height - offset.y,
      }
    case 'center':
    default:
      return {
        x: (bounds.left + bounds.right - width) / 2,
        y: (bounds.top + bounds.bottom - height) / 2,
      }
  }
}

/**
 * 从浮层状态读取 offset，未提供时回退默认值。
 * @param source 浮层状态输入。
 * @returns 锚点偏移量。
 */
function resolveFloatingOffset(source: Partial<LayoutFloatingState> | undefined): FloatingOffset {
  return {
    x: source?.offsetX ?? DEFAULT_FLOATING_OFFSET,
    y: source?.offsetY ?? DEFAULT_FLOATING_OFFSET,
  }
}

/**
 * 根据 rect 反推当前 placement 下的 offset。
 * @param rect 浮层 rect。
 * @param bounds 视口边界。
 * @param placement 浮层锚点位置。
 * @returns 锚点偏移量；center 无 offset 时返回 null。
 */
function resolveFloatingOffsetFromRect(
  rect: LayoutFloatingRect,
  bounds: FloatingBounds,
  placement: LayoutFloatingPlacement,
): FloatingOffset | null {
  switch (placement) {
    case 'top-left':
      return {
        x: rect.x - bounds.left,
        y: rect.y - bounds.top,
      }
    case 'top-right':
      return {
        x: bounds.right - rect.width - rect.x,
        y: rect.y - bounds.top,
      }
    case 'bottom-left':
      return {
        x: rect.x - bounds.left,
        y: bounds.bottom - rect.height - rect.y,
      }
    case 'bottom-right':
      return {
        x: bounds.right - rect.width - rect.x,
        y: bounds.bottom - rect.height - rect.y,
      }
    case 'center':
    default:
      return null
  }
}

/**
 * 根据 rect 中心点推断最近的角落 placement。
 * @param rect 浮层 rect。
 * @param bounds 视口边界。
 * @returns 最近的角落 placement。
 */
function resolveNearestCornerPlacement(rect: LayoutFloatingRect, bounds: FloatingBounds): LayoutFloatingPlacement {
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const viewportCenterX = (bounds.left + bounds.right) / 2
  const viewportCenterY = (bounds.top + bounds.bottom) / 2
  const horizontal = centerX <= viewportCenterX ? 'left' : 'right'
  const vertical = centerY <= viewportCenterY ? 'top' : 'bottom'

  return `${vertical}-${horizontal}` as Exclude<LayoutFloatingPlacement, 'center'>
}

/**
 * 提取 rect 上附带的交互和尺寸约束信息。
 * @param source rect 输入。
 * @returns rect 元信息。
 */
function pickFloatingRectMeta(source: Partial<LayoutFloatingRect> | undefined) {
  return {
    draggable: source?.draggable,
    resizable: source?.resizable,
    minWidth: source?.minWidth,
    maxWidth: source?.maxWidth,
    minHeight: source?.minHeight,
    maxHeight: source?.maxHeight,
  }
}

/**
 * 构造一个完整的浮层 rect。
 * @param x 浮层横坐标。
 * @param y 浮层纵坐标。
 * @param width 浮层宽度。
 * @param height 浮层高度。
 * @param constraints 浮层尺寸约束。
 * @param source rect 元信息来源。
 * @returns 完整的浮层 rect。
 */
function createFloatingRect(
  x: number,
  y: number,
  width: number,
  height: number,
  constraints: FloatingConstraints,
  source?: Partial<LayoutFloatingRect>,
): LayoutFloatingRect {
  const meta = pickFloatingRectMeta(source)

  return {
    x,
    y,
    width,
    height,
    draggable: meta.draggable ?? true,
    resizable: meta.resizable ?? false,
    minWidth: constraints.minWidth,
    maxWidth: constraints.maxWidth,
    minHeight: constraints.minHeight,
    maxHeight: constraints.maxHeight,
  }
}

/**
 * 返回可用视口边界。
 * @param gap 视口左右边距。
 * @param topGap 视口顶部边距。
 * @returns 视口边界。
 */
export function resolveViewportBounds(gap = DEFAULT_FLOATING_GAP, topGap = DEFAULT_FLOATING_TOP): FloatingBounds {
  const viewport = resolveViewportSize()

  return {
    left: gap,
    top: topGap,
    right: Math.max(gap, viewport.width - gap),
    bottom: Math.max(topGap, viewport.height - gap),
  }
}

/**
 * 根据浮层输入计算尺寸约束。
 * @param source 浮层 state 或 rect 输入。
 * @returns 浮层尺寸约束。
 */
export function resolveFloatingConstraints(
  source?: Partial<LayoutFloatingRect | FloatingStateInput>,
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

/**
 * 对 rect 做尺寸和位置裁剪，返回完整 rect。
 * @param rect 浮层 rect 输入。
 * @param constraints 浮层尺寸约束。
 * @param bounds 视口边界。
 * @returns 规范化后的浮层 rect。
 */
export function clampFloatingRect(
  rect: FloatingRectInput,
  constraints = resolveFloatingConstraints(rect),
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth)
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight)
  const xMax = Math.max(bounds.left, bounds.right - width)
  const yMax = Math.max(bounds.top, bounds.bottom - height)
  const x = clamp(rect.x, bounds.left, xMax)
  const y = clamp(rect.y, bounds.top, yMax)

  return createFloatingRect(x, y, width, height, constraints, rect)
}

/**
 * 根据拖拽的边或角裁剪 rect。
 * @param rect 浮层 rect 输入。
 * @param handle 当前 resize handle。
 * @param constraints 浮层尺寸约束。
 * @param bounds 视口边界。
 * @returns 裁剪后的浮层 rect。
 */
export function clampFloatingRectByHandle(
  rect: FloatingRectInput,
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
      const maxWidth = Math.min(constraints.maxWidth, availableWidthFromLeft)
      width = clamp(rect.width, constraints.minWidth, maxWidth)
      x = right - width
    } else {
      width = constraints.minWidth
      x = bounds.left
    }
  } else if (handle.includes('e')) {
    const maxWidth = Math.min(constraints.maxWidth, Math.max(constraints.minWidth, bounds.right - rect.x))
    width = clamp(rect.width, constraints.minWidth, maxWidth)
    x = rect.x
  }

  if (handle.includes('n')) {
    if (availableHeightFromTop >= constraints.minHeight) {
      const maxHeight = Math.min(constraints.maxHeight, availableHeightFromTop)
      height = clamp(rect.height, constraints.minHeight, maxHeight)
      y = bottom - height
    } else {
      height = constraints.minHeight
      y = bounds.top
    }
  } else if (handle.includes('s')) {
    const maxHeight = Math.min(constraints.maxHeight, Math.max(constraints.minHeight, bounds.bottom - rect.y))
    height = clamp(rect.height, constraints.minHeight, maxHeight)
    y = rect.y
  }

  const nextRect: FloatingRectInput = {
    ...rect,
    x,
    y,
    width,
    height,
  }

  return clampFloatingRect(nextRect, constraints, bounds)
}

/**
 * 根据 floatingState 和 floatingOptions 生成初始 rect。
 * @param source 浮层状态输入。
 * @param bounds 视口边界。
 * @returns 初始浮层 rect。
 */
export function createFloatingRectFromState(
  source?: FloatingStateInput,
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const constraints = resolveFloatingConstraints(source)
  const width = clamp(source?.width ?? DEFAULT_FLOATING_WIDTH, constraints.minWidth, constraints.maxWidth)
  const height = clamp(source?.height ?? DEFAULT_FLOATING_HEIGHT, constraints.minHeight, constraints.maxHeight)
  const placement = resolveFloatingPlacement(source)
  const offset = resolveFloatingOffset(source)
  const position = getPlacementPosition(placement, bounds, width, height, offset)

  return createFloatingRect(position.x, position.y, width, height, constraints, source)
}

/**
 * 把 state 或 rect 输入整理成可继续参与几何计算的完整 rect。
 * @param input 浮层输入。
 * @returns 规范化后的浮层 rect。
 */
export function resolveFloatingRect(input: FloatingInput): LayoutFloatingRect {
  if (!input) {
    return createFloatingRectFromState()
  }

  if (isFloatingRect(input)) {
    const constraints = resolveFloatingConstraints(input)
    const rect: FloatingRectInput = {
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      ...pickFloatingRectMeta(input),
    }

    return clampFloatingRect(rect, constraints)
  }

  return createFloatingRectFromState(input)
}

/**
 * 计算当前 rect 所在的几何上下文。
 * @param input 浮层输入。
 * @param source 当输入为 rect 时，用于提供 placement 来源。
 * @returns 浮层快照。
 */
export function createFloatingSnapshot(
  input: FloatingInput,
  source?: Pick<LayoutFloatingState, 'placement'>,
): FloatingGeometrySnapshot {
  const bounds = resolveViewportBounds()
  const rect = resolveFloatingRect(input)
  const normalizedRect = clampFloatingRect(rect, undefined, bounds)
  const placementSource = input && isFloatingRect(input) ? source : input
  const placement = resolveFloatingPlacement(placementSource)

  return {
    placement,
    rect: normalizedRect,
    bounds,
  }
}

/**
 * 根据 rect 快照反推出对外的 floatingState。
 * @param snapshot 浮层快照。
 * @param source 浮层状态来源。
 * @param options 状态提交选项。
 * @returns 对外 floatingState。
 */
export function toFloatingState(
  snapshot: FloatingGeometrySnapshot,
  source?: Partial<LayoutFloatingState>,
  options?: { normalizeCenter?: boolean },
): LayoutFloatingState {
  const sourcePlacement = source?.placement ?? snapshot.placement
  const shouldNormalizeCenter = options?.normalizeCenter && sourcePlacement === 'center'
  const placement = shouldNormalizeCenter
    ? resolveNearestCornerPlacement(snapshot.rect, snapshot.bounds)
    : sourcePlacement
  const offset = resolveFloatingOffsetFromRect(snapshot.rect, snapshot.bounds, placement)
  const fallbackOffset = resolveFloatingOffset(source)

  return {
    placement,
    offsetX: offset?.x ?? fallbackOffset.x,
    offsetY: offset?.y ?? fallbackOffset.y,
    width: snapshot.rect.width,
    height: snapshot.rect.height,
  }
}

/**
 * 比较两个 rect 的几何信息是否一致。
 * @param left 左侧 rect。
 * @param right 右侧 rect。
 * @returns 两者几何信息是否一致。
 */
export function areFloatingGeometryEqual(
  left: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
  right: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
