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
