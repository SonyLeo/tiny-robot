export function toFiniteNumber(value: number | string): number {
  const normalized = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(normalized)) {
    return 0
  }

  return normalized
}

export function clampNonNegative(value: number | string): number {
  return Math.max(0, toFiniteNumber(value))
}

export function toCssLength(value: number | string): string {
  if (typeof value === 'number') {
    return `${value}px`
  }

  const normalized = value.trim()

  if (normalized && Number.isFinite(Number(normalized))) {
    return `${Number(normalized)}px`
  }

  return value
}
