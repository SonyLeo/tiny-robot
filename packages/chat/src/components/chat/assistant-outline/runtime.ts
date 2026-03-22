import type { ChatAssistantOutlineItem } from '@/types'

export interface AssistantOutlineHeadingEntry {
  id?: string
  text: string
  level: 1 | 2 | 3 | 4
  element?: HTMLElement
}

const HEADING_SELECTOR = '.heading-node'
const FALLBACK_SELECTOR = 'h1, h2, h3, h4'
const MAX_LABEL_LENGTH = 72

export function slugifyAssistantOutlineHeading(text: string) {
  if (!text.trim()) {
    return 'heading'
  }

  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'heading'
  )
}

function coerceHeadingLevel(tagName: string) {
  const level = Number.parseInt(tagName.replace(/^H/i, ''), 10)
  if (!Number.isFinite(level) || level < 1 || level > 4) {
    return undefined
  }

  return level as 1 | 2 | 3 | 4
}

function truncateLabel(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= MAX_LABEL_LENGTH) {
    return normalized
  }

  return `${normalized.slice(0, MAX_LABEL_LENGTH - 3).trimEnd()}...`
}

export function extractAssistantOutlineHeadings(container: Element): AssistantOutlineHeadingEntry[] {
  let nodes = container.querySelectorAll<HTMLElement>(HEADING_SELECTOR)
  if (!nodes.length) {
    nodes = container.querySelectorAll<HTMLElement>(FALLBACK_SELECTOR)
  }

  const idCounts = new Map<string, number>()
  const headings: AssistantOutlineHeadingEntry[] = []

  nodes.forEach((node) => {
    const level = coerceHeadingLevel(node.tagName)
    if (!level || level > 3) {
      return
    }

    const text = node.textContent?.trim() ?? ''
    if (!text) {
      return
    }

    let id = node.id
    if (!id || id.startsWith('assistant-outline-')) {
      const slug = slugifyAssistantOutlineHeading(text)
      const count = idCounts.get(slug) ?? 0
      idCounts.set(slug, count + 1)
      id = count === 0 ? `assistant-outline-${slug}` : `assistant-outline-${slug}-${count}`
      node.id = id
    }

    headings.push({
      id,
      text,
      level,
      element: node,
    })
  })

  return headings
}

export function resolveAssistantOutlineItems(entries: AssistantOutlineHeadingEntry[]) {
  return entries.map<ChatAssistantOutlineItem>((entry) => ({
    id: entry.id ?? slugifyAssistantOutlineHeading(entry.text),
    headingId: entry.id ?? slugifyAssistantOutlineHeading(entry.text),
    label: truncateLabel(entry.text),
    description: undefined,
    level: entry.level,
  }))
}
