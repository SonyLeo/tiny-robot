import type { TrMarkdownAlertConfig, TrMarkdownAlertKind, TrMarkdownRenderNode } from '../index.type'

export interface ResolvedTrMarkdownAlertConfig {
  enabled: boolean
}

export interface ResolvedTrMarkdownAlertBlock {
  kind: TrMarkdownAlertKind
  title: string
  children: TrMarkdownRenderNode[]
}

const alertKindMap = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
} as const satisfies Record<string, TrMarkdownAlertKind>

const alertTitleMap: Record<TrMarkdownAlertKind, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

const alertMarkerPattern = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+|$)/i

export const resolveAlertConfig = (config?: boolean | TrMarkdownAlertConfig): ResolvedTrMarkdownAlertConfig => {
  if (!config) {
    return {
      enabled: false,
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    enabled: options.enabled !== false,
  }
}

export const getAlertTitle = (kind: TrMarkdownAlertKind) => {
  return alertTitleMap[kind]
}

const cloneRenderNodes = (nodes: TrMarkdownRenderNode[]): TrMarkdownRenderNode[] => {
  return nodes.map((node) => ({
    ...node,
    attrs: node.attrs ? { ...node.attrs } : undefined,
    children: node.children ? cloneRenderNodes(node.children) : undefined,
    position: node.position ? { ...node.position } : undefined,
  }))
}

const trimLeadingParagraphChildren = (children: TrMarkdownRenderNode[]) => {
  while (children.length > 0) {
    const firstChild = children[0]

    if (firstChild.type === 'text') {
      firstChild.text = (firstChild.text || '').replace(/^\s+/, '')

      if (firstChild.text) {
        return
      }

      children.shift()
      continue
    }

    if (firstChild.type === 'softbreak') {
      children.shift()
      continue
    }

    return
  }
}

const isInlineNodeEmpty = (node: TrMarkdownRenderNode): boolean => {
  if (node.type === 'text') {
    return !(node.text || '').trim()
  }

  if (node.type === 'softbreak' || node.type === 'hardbreak') {
    return true
  }

  if (!node.children?.length) {
    return false
  }

  return node.children.every(isInlineNodeEmpty)
}

const isParagraphNodeEmpty = (node: TrMarkdownRenderNode) => {
  return !node.children?.length || node.children.every(isInlineNodeEmpty)
}

export const resolveAlertBlock = (node: TrMarkdownRenderNode): ResolvedTrMarkdownAlertBlock | null => {
  if (node.type !== 'blockquote_open' || !node.children?.length) {
    return null
  }

  const [firstChild] = node.children

  if (!firstChild || firstChild.type !== 'paragraph_open' || !firstChild.children?.length) {
    return null
  }

  const [firstInlineChild] = firstChild.children

  if (!firstInlineChild || firstInlineChild.type !== 'text' || !firstInlineChild.text) {
    return null
  }

  const matched = firstInlineChild.text.match(alertMarkerPattern)
  if (!matched) {
    return null
  }

  const markerKind = matched[1]?.toUpperCase() as keyof typeof alertKindMap
  const kind = alertKindMap[markerKind]

  if (!kind) {
    return null
  }

  const normalizedChildren = cloneRenderNodes(node.children)
  const normalizedParagraph = normalizedChildren[0]
  const normalizedText = normalizedParagraph?.children?.[0]

  if (
    normalizedParagraph?.type !== 'paragraph_open' ||
    normalizedText?.type !== 'text' ||
    typeof normalizedText.text !== 'string'
  ) {
    return null
  }

  normalizedText.text = normalizedText.text.replace(alertMarkerPattern, '')
  trimLeadingParagraphChildren(normalizedParagraph.children || [])

  if (isParagraphNodeEmpty(normalizedParagraph)) {
    normalizedChildren.shift()
  }

  return {
    kind,
    title: getAlertTitle(kind),
    children: normalizedChildren,
  }
}
