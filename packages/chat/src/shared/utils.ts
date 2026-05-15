import type { Slot } from 'vue'

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
  return typeof value === 'number' ? `${value}px` : value
}

export function hasSlotContent(slot?: Slot): boolean {
  return Boolean(slot && slot().length > 0)
}
