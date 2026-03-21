import type { ChatContentNavigationItem } from '../../../types'

export function shouldRenderContentNavigation(
  items: ChatContentNavigationItem[] | undefined,
  minItems: number | undefined,
) {
  const threshold = minItems ?? 2
  return (items?.length ?? 0) >= threshold
}

export function coerceContentNavigationItemId<T extends { id: string }>(options: {
  items: T[] | undefined
  requestedId?: string
}) {
  const items = options.items ?? []

  if (options.requestedId && items.some((item) => item.id === options.requestedId)) {
    return options.requestedId
  }

  return items[0]?.id
}
