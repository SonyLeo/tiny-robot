import type { ChatFloatingConfig } from '@/types/layout'
import { resolveCssLengthToPx } from '@/utils/cssLength'
import { clamp } from '@/utils/math'

interface ResolvedFloatingGeometry {
  x?: number
  y?: number
  width: number | string
  height: number | string
}

export interface FloatingSnapshot {
  raw: ResolvedFloatingGeometry
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

export const DEFAULT_FLOATING_WIDTH = 420
export const DEFAULT_FLOATING_HEIGHT = '80vh'
export const DEFAULT_FLOATING_TOP = 24
export const DEFAULT_FLOATING_GAP = 24
export const DEFAULT_MIN_FLOATING_WIDTH = 320

interface ViewportSize {
  width: number
  height: number
}

function getMeasurementRoot(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.body ?? document.documentElement ?? null
}

function resolveViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
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

function resolveWidthLimits(source: ChatFloatingConfig | undefined, measurementRoot: HTMLElement | null) {
  const viewportSize = resolveViewportSize()
  const availableWidth = Math.max(1, viewportSize.width - DEFAULT_FLOATING_GAP * 2)
  const minWidth = clamp(
    resolveCssLengthToPx(source?.minWidth, measurementRoot, DEFAULT_MIN_FLOATING_WIDTH),
    1,
    availableWidth,
  )
  const maxWidth = clamp(
    resolveCssLengthToPx(source?.maxWidth, measurementRoot, availableWidth),
    minWidth,
    availableWidth,
  )

  return {
    viewportSize,
    minWidth,
    maxWidth,
    maxHeight: Math.max(1, viewportSize.height - DEFAULT_FLOATING_TOP - DEFAULT_FLOATING_GAP),
  }
}

function resolveDefaultFloatingGeometry(source: ChatFloatingConfig | undefined): ResolvedFloatingGeometry {
  const width = source?.width ?? DEFAULT_FLOATING_WIDTH
  const height = source?.height ?? DEFAULT_FLOATING_HEIGHT
  const measurementRoot = getMeasurementRoot()

  if (!measurementRoot) {
    return {
      x: source?.x ?? DEFAULT_FLOATING_GAP,
      y: source?.y ?? DEFAULT_FLOATING_TOP,
      width,
      height,
    }
  }

  const { viewportSize, minWidth, maxWidth, maxHeight } = resolveWidthLimits(source, measurementRoot)
  const rawWidth = resolveCssLengthToPx(width, measurementRoot, DEFAULT_FLOATING_WIDTH)
  const rawHeight = resolveCssLengthToPx(height, measurementRoot, viewportSize.height, 'height')
  const widthPx = clamp(rawWidth, minWidth, maxWidth)
  const heightPx = Math.min(rawHeight, maxHeight)

  return {
    x: source?.x ?? Math.max(DEFAULT_FLOATING_GAP, (viewportSize.width - widthPx) / 2),
    y: source?.y ?? DEFAULT_FLOATING_TOP,
    width,
    height: heightPx === rawHeight ? height : heightPx,
  }
}

export function resolveCurrentFloatingConfig(externalConfig: ChatFloatingConfig | undefined): ChatFloatingConfig {
  if (!externalConfig) {
    return resolveDefaultFloatingGeometry(undefined)
  }

  return {
    ...resolveDefaultFloatingGeometry(externalConfig),
    ...externalConfig,
  }
}

export function resolveFloatingSnapshot(config: ChatFloatingConfig | undefined): FloatingSnapshot {
  const raw = {
    x: config?.x ?? undefined,
    y: config?.y ?? undefined,
    width: config?.width ?? DEFAULT_FLOATING_WIDTH,
    height: config?.height ?? DEFAULT_FLOATING_HEIGHT,
  }
  const measurementRoot = getMeasurementRoot()

  if (!measurementRoot) {
    const widthPx = resolveCssLengthToPx(raw.width, null, DEFAULT_FLOATING_WIDTH)
    const heightPx = resolveCssLengthToPx(raw.height, null, 0, 'height')

    return {
      raw,
      rawWidth: widthPx,
      rawHeight: heightPx,
      widthPx,
      heightPx,
      x: raw.x ?? DEFAULT_FLOATING_GAP,
      y: raw.y ?? DEFAULT_FLOATING_TOP,
      xMax: raw.x ?? DEFAULT_FLOATING_GAP,
      yMax: raw.y ?? DEFAULT_FLOATING_TOP,
      minWidth: 1,
      maxWidth: Number.MAX_SAFE_INTEGER,
    }
  }

  const { viewportSize, minWidth, maxWidth, maxHeight } = resolveWidthLimits(config, measurementRoot)
  const rawWidth = resolveCssLengthToPx(raw.width, measurementRoot, DEFAULT_FLOATING_WIDTH)
  const rawHeight = resolveCssLengthToPx(raw.height, measurementRoot, viewportSize.height, 'height')
  const widthPx = clamp(rawWidth, minWidth, maxWidth)
  const heightPx = Math.min(rawHeight, maxHeight)
  const xMax = Math.max(DEFAULT_FLOATING_GAP, viewportSize.width - widthPx - DEFAULT_FLOATING_GAP)
  const yMax = Math.max(DEFAULT_FLOATING_TOP, viewportSize.height - heightPx - DEFAULT_FLOATING_GAP)
  const defaultX = Math.max(DEFAULT_FLOATING_GAP, (viewportSize.width - widthPx) / 2)

  return {
    raw,
    rawWidth,
    rawHeight,
    widthPx,
    heightPx,
    x: clamp(raw.x ?? defaultX, DEFAULT_FLOATING_GAP, xMax),
    y: clamp(raw.y ?? DEFAULT_FLOATING_TOP, DEFAULT_FLOATING_TOP, yMax),
    xMax,
    yMax,
    minWidth,
    maxWidth,
  }
}

export function toCommittedFloatingConfig(
  snapshot: FloatingSnapshot,
): Pick<ChatFloatingConfig, 'x' | 'y' | 'width' | 'height'> {
  return {
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.widthPx === snapshot.rawWidth ? snapshot.raw.width : snapshot.widthPx,
    height: snapshot.heightPx === snapshot.rawHeight ? snapshot.raw.height : snapshot.heightPx,
  }
}

export function areFloatingGeometryEqual(
  left: Pick<ChatFloatingConfig, 'x' | 'y' | 'width' | 'height'> | undefined,
  right: Pick<ChatFloatingConfig, 'x' | 'y' | 'width' | 'height'> | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
