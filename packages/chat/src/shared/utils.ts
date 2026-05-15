import { Comment, Fragment, Text, type Slot, type VNode } from 'vue'

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

export function hasSlotContent(slot?: Slot): boolean {
  return Boolean(slot && hasRenderableNodes(slot()))
}

function hasRenderableNodes(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) {
      return false
    }

    if (node.type === Text) {
      return typeof node.children === 'string' && node.children.trim().length > 0
    }

    if (node.type === Fragment) {
      return Array.isArray(node.children) && hasRenderableNodes(node.children as VNode[])
    }

    return true
  })
}
