import type { ChatDetachedBounds } from '@/types/layout'
import { resolveCssLengthToPx } from '@/utils/cssLength'
import { clamp } from '@/utils/math'

interface ResolvedDetachedBounds {
  x?: number
  y?: number
  width: number | string
  height: number | string
}

export interface DetachedBoundsSnapshot {
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

export const DEFAULT_DETACHED_WIDTH = 420
export const DEFAULT_DETACHED_HEIGHT = '80vh'
export const DEFAULT_DETACHED_TOP = 24
export const DEFAULT_DETACHED_GAP = 24
export const DEFAULT_MIN_DETACHED_WIDTH = 320

function resolveWidthLimits(
  hostEl: HTMLElement,
  minWidthValue: number | string | undefined,
  maxWidthValue: number | string | undefined,
) {
  const hostRect = hostEl.getBoundingClientRect()
  const availableWidth = Math.max(1, hostRect.width - DEFAULT_DETACHED_GAP * 2)
  const minWidth = clamp(resolveCssLengthToPx(minWidthValue, hostEl, DEFAULT_MIN_DETACHED_WIDTH), 1, availableWidth)
  const maxWidth = clamp(resolveCssLengthToPx(maxWidthValue, hostEl, availableWidth), minWidth, availableWidth)

  return {
    hostRect,
    minWidth,
    maxWidth,
    maxHeight: Math.max(1, hostRect.height - DEFAULT_DETACHED_TOP - DEFAULT_DETACHED_GAP),
  }
}

function resolveDefaultDetachedBounds(
  source: ChatDetachedBounds | undefined,
  hostEl: HTMLElement | null | undefined,
  minWidthValue: number | string | undefined,
  maxWidthValue: number | string | undefined,
): ChatDetachedBounds {
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

  const { hostRect, minWidth, maxWidth, maxHeight } = resolveWidthLimits(hostEl, minWidthValue, maxWidthValue)
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

export function resolveCurrentDetachedBounds(
  externalBounds: ChatDetachedBounds | undefined,
  hostEl: HTMLElement | null | undefined,
  minWidthValue: number | string | undefined,
  maxWidthValue: number | string | undefined,
): ChatDetachedBounds {
  if (!externalBounds) {
    return resolveDefaultDetachedBounds(undefined, hostEl, minWidthValue, maxWidthValue)
  }

  return {
    ...resolveDefaultDetachedBounds(externalBounds, hostEl, minWidthValue, maxWidthValue),
    ...externalBounds,
  }
}

export function resolveDetachedSnapshot(
  bounds: ChatDetachedBounds | undefined,
  hostEl: HTMLElement | null | undefined,
  minWidthValue: number | string | undefined,
  maxWidthValue: number | string | undefined,
): DetachedBoundsSnapshot {
  const raw = {
    x: bounds?.x ?? undefined,
    y: bounds?.y ?? undefined,
    width: bounds?.width ?? DEFAULT_DETACHED_WIDTH,
    height: bounds?.height ?? DEFAULT_DETACHED_HEIGHT,
  }

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

  const { hostRect, minWidth, maxWidth, maxHeight } = resolveWidthLimits(hostEl, minWidthValue, maxWidthValue)
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

export function toCommittedDetachedBounds(snapshot: DetachedBoundsSnapshot): ChatDetachedBounds {
  return {
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.widthPx === snapshot.rawWidth ? snapshot.raw.width : snapshot.widthPx,
    height: snapshot.heightPx === snapshot.rawHeight ? snapshot.raw.height : snapshot.heightPx,
  }
}

export function areDetachedBoundsEqual(
  left: ChatDetachedBounds | undefined,
  right: ChatDetachedBounds | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
