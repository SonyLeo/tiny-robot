import type { TrMarkdownCitationItem, TrMarkdownRenderNode } from '../index.type'

const blockLatexPattern = /\$\$[\s\S]*?\$\$/g
const inlineLatexPattern = /(?<!\\)\$[^$\n]+(?<!\\)\$/g
const citationHrefPrefix = 'citation-'
const citationRecursionSkipTypes = new Set([
  'link',
  'citation',
  'image',
  'video',
  'inline-code',
  'code-block',
  'html',
  'math-inline',
  'math-block',
])

type CitationRange = {
  start: number
  end: number
}

export interface TrMarkdownResolvedCitationRenderProps extends Record<string, unknown> {
  citation?: TrMarkdownCitationItem
  href?: string
  index?: number
  label: string
  url?: string
  title?: string
  alt?: string
  summary?: string
}

const collectRanges = (source: string, pattern: RegExp) => {
  const ranges: CitationRange[] = []

  for (const match of source.matchAll(pattern)) {
    const index = match.index
    const content = match[0]

    if (typeof index !== 'number' || !content) {
      continue
    }

    ranges.push({
      start: index,
      end: index + content.length,
    })
  }

  return ranges
}

const isInRanges = (index: number, ranges: CitationRange[]) => {
  return ranges.some((range) => index >= range.start && index < range.end)
}

export const getCitationHref = (index: number) => `${citationHrefPrefix}${index}`

export const getCitationLabel = (index: number) => {
  if (!Number.isInteger(index) || index <= 0) {
    return '[?]'
  }

  return `[${index}]`
}

export const isCitationHref = (href?: string) => {
  return typeof href === 'string' && /^citation-\d+$/.test(href)
}

export const getCitationIndexFromHref = (href?: string) => {
  if (typeof href !== 'string' || !isCitationHref(href)) {
    return
  }

  const value = Number(href.replace(citationHrefPrefix, ''))

  if (!Number.isInteger(value) || value <= 0) {
    return
  }

  return value
}

export const resolveCitationItemByIndex = (citations: TrMarkdownCitationItem[] | undefined, index?: number) => {
  if (!index || !citations?.length) {
    return
  }

  return citations[index - 1]
}

export const resolveCitationRenderProps = (
  citations: TrMarkdownCitationItem[] | undefined,
  options: {
    href?: string
    index?: unknown
    label?: unknown
  },
): TrMarkdownResolvedCitationRenderProps => {
  const href = typeof options.href === 'string' ? options.href : undefined
  const hrefIndex = getCitationIndexFromHref(href)
  const rawIndex = typeof options.index === 'number' ? options.index : Number(options.index)
  const index = hrefIndex || (Number.isInteger(rawIndex) && rawIndex > 0 ? rawIndex : undefined)
  const citation = resolveCitationItemByIndex(citations, index)

  return {
    href,
    index,
    label: typeof options.label === 'string' ? options.label : getCitationLabel(index || 0),
    citation,
    url: citation?.url,
    title: citation?.title,
    alt: citation?.alt,
    summary: citation?.summary,
  }
}

const createCitationNode = (index: number): TrMarkdownRenderNode => ({
  type: 'citation',
  tag: 'sup',
  attrs: {
    href: getCitationHref(index),
    index,
    label: getCitationLabel(index),
  },
})

const splitTextNodeByCitations = (
  node: TrMarkdownRenderNode,
  citations: TrMarkdownCitationItem[],
): TrMarkdownRenderNode[] => {
  const text = node.text || ''

  if (!text || citations.length === 0) {
    return [node]
  }

  const ranges = [...collectRanges(text, blockLatexPattern), ...collectRanges(text, inlineLatexPattern)]
  const pattern = /\[(\d+)\]/g
  const result: TrMarkdownRenderNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index
    const raw = match[0]
    const value = Number(match[1])

    if (
      typeof index !== 'number' ||
      !raw ||
      !Number.isInteger(value) ||
      value <= 0 ||
      value > citations.length ||
      isInRanges(index, ranges)
    ) {
      continue
    }

    const before = text.slice(lastIndex, index)
    if (before) {
      result.push({
        ...node,
        text: before,
      })
    }

    result.push(createCitationNode(value))
    lastIndex = index + raw.length
  }

  if (result.length === 0) {
    return [node]
  }

  const after = text.slice(lastIndex)
  if (after) {
    result.push({
      ...node,
      text: after,
    })
  }

  return result
}

export const applyCitationNodes = (
  nodes: TrMarkdownRenderNode[],
  citations: TrMarkdownCitationItem[] | undefined,
): TrMarkdownRenderNode[] => {
  if (!citations?.length) {
    return nodes
  }

  return nodes.flatMap((node) => {
    if (node.type === 'text') {
      return splitTextNodeByCitations(node, citations)
    }

    if (!node.children?.length || citationRecursionSkipTypes.has(node.type)) {
      return [node]
    }

    return [
      {
        ...node,
        children: applyCitationNodes(node.children, citations),
      },
    ]
  })
}
