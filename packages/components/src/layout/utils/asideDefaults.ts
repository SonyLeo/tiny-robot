import type { LayoutSide } from '../index.type'

const DEFAULT_ASIDE_OPEN = {
  left: true,
  right: false,
} as const

const DEFAULT_ASIDE_MIN_WIDTH = {
  left: 200,
  right: 240,
} as const

const DEFAULT_ASIDE_EXPANDED_WIDTH = {
  left: 300,
  right: 320,
} as const

const DEFAULT_ASIDE_MAX_WIDTH = {
  left: 560,
  right: 640,
} as const

export function getDefaultAsideOpen(side: LayoutSide): boolean {
  return DEFAULT_ASIDE_OPEN[side]
}

export function getDefaultAsideMinWidth(side: LayoutSide): number {
  return DEFAULT_ASIDE_MIN_WIDTH[side]
}

export function getDefaultAsideExpandedWidth(side: LayoutSide): number {
  return DEFAULT_ASIDE_EXPANDED_WIDTH[side]
}

export function getDefaultAsideMaxWidth(side: LayoutSide): number {
  return DEFAULT_ASIDE_MAX_WIDTH[side]
}
