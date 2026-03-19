import type { ChatWorkspacePanelDefinition, ChatWorkspacePanelHostItem, ChatWorkspacePanelWidth } from '../../types'

export function resolveWorkspaceRegionWidth(width: ChatWorkspacePanelWidth | undefined, side: 'left' | 'right') {
  if (typeof width === 'number') {
    return `${width}px`
  }

  if (width === 'sm') {
    return '220px'
  }

  if (width === 'md') {
    return '248px'
  }

  if (width === 'lg') {
    return '286px'
  }

  return side === 'left' ? '248px' : '286px'
}

export function toWorkspacePanelHostItems(
  panels: ChatWorkspacePanelDefinition[] | undefined,
): ChatWorkspacePanelHostItem[] {
  return (panels ?? []).map((panel) => ({
    id: panel.id,
    label: panel.label ?? panel.title ?? panel.id,
    description: panel.description,
  }))
}

export function resolveWorkspaceCollapsedState({
  collapsible,
  controlledCollapsed,
  uncontrolledCollapsed,
}: {
  collapsible: boolean
  controlledCollapsed?: boolean
  uncontrolledCollapsed: boolean
}) {
  if (!collapsible) {
    return false
  }

  if (controlledCollapsed !== undefined) {
    return controlledCollapsed
  }

  return uncontrolledCollapsed
}

export function coerceWorkspacePanelId<T extends { id: string }>({
  items,
  requestedId,
  fallbackId,
}: {
  items: T[] | undefined
  requestedId?: string
  fallbackId?: string
}) {
  const list = items ?? []

  if (requestedId && list.some((item) => item.id === requestedId)) {
    return requestedId
  }

  if (fallbackId && list.some((item) => item.id === fallbackId)) {
    return fallbackId
  }

  return list[0]?.id
}

export function findWorkspacePanelById<T extends { id: string }>(items: T[] | undefined, panelId?: string) {
  return (items ?? []).find((item) => item.id === panelId)
}
