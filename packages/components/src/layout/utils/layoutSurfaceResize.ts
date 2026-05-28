import type { LayoutFloatingConfig, LayoutPlacement } from '../index.type'
import { DEFAULT_FLOATING_GAP, toCommittedFloatingConfig, type FloatingSnapshot } from './layoutSurfaceGeometry'

interface ResolveFloatingResizeGeometryOptions {
  edge: LayoutPlacement
  deltaX: number
  snapshot: FloatingSnapshot
  viewportWidth: number
}

const FLOATING_RESIZE_EPSILON = 0.01

export function resolveFloatingResizeGeometry(
  options: ResolveFloatingResizeGeometryOptions,
): Pick<LayoutFloatingConfig, 'x' | 'y' | 'width' | 'height'> {
  const minX = DEFAULT_FLOATING_GAP
  const maxRight = options.viewportWidth - DEFAULT_FLOATING_GAP
  const currentLeft = options.snapshot.x
  const currentWidth = options.snapshot.widthPx
  const currentRight = currentLeft + currentWidth

  let nextLeft = currentLeft
  let nextRight = currentRight
  let nextWidth = currentWidth

  if (options.edge === 'left') {
    if (options.deltaX < 0) {
      const distance = -options.deltaX
      const growAmount = Math.min(distance, options.snapshot.maxWidth - currentWidth, currentLeft - minX)

      nextLeft = currentLeft - growAmount
      nextWidth = currentWidth + growAmount

      const remaining = distance - growAmount
      if (remaining > 0 && nextWidth >= options.snapshot.maxWidth - FLOATING_RESIZE_EPSILON) {
        const moveAmount = Math.min(remaining, nextLeft - minX)
        nextLeft -= moveAmount
        nextRight = currentRight - moveAmount
      }
    } else {
      const shrinkAmount = Math.min(options.deltaX, currentWidth - options.snapshot.minWidth)

      nextLeft = currentLeft + shrinkAmount
      nextWidth = currentWidth - shrinkAmount

      const remaining = options.deltaX - shrinkAmount
      if (remaining > 0 && nextWidth <= options.snapshot.minWidth + FLOATING_RESIZE_EPSILON) {
        const moveAmount = Math.min(remaining, maxRight - currentRight)
        nextLeft += moveAmount
        nextRight = currentRight + moveAmount
      }
    }
  } else {
    if (options.deltaX > 0) {
      const growAmount = Math.min(options.deltaX, options.snapshot.maxWidth - currentWidth, maxRight - currentRight)

      nextRight = currentRight + growAmount
      nextWidth = currentWidth + growAmount

      const remaining = options.deltaX - growAmount
      if (remaining > 0 && nextWidth >= options.snapshot.maxWidth - FLOATING_RESIZE_EPSILON) {
        const moveAmount = Math.min(remaining, maxRight - nextRight)
        nextLeft = currentLeft + moveAmount
        nextRight += moveAmount
      }
    } else {
      const distance = -options.deltaX
      const shrinkAmount = Math.min(distance, currentWidth - options.snapshot.minWidth)

      nextRight = currentRight - shrinkAmount
      nextWidth = currentWidth - shrinkAmount

      const remaining = distance - shrinkAmount
      if (remaining > 0 && nextWidth <= options.snapshot.minWidth + FLOATING_RESIZE_EPSILON) {
        const moveAmount = Math.min(remaining, currentLeft - minX)
        nextLeft = currentLeft - moveAmount
        nextRight -= moveAmount
      }
    }
  }

  nextWidth = nextRight - nextLeft

  return {
    ...toCommittedFloatingConfig(options.snapshot),
    x: nextLeft,
    width: nextWidth,
  }
}
