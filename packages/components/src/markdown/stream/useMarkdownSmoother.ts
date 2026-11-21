const punctuationBoundaryPattern = /(?:[。！？!?；;：:,，]\s*|\n+)/g
import { scanMarkdownFences } from './markdownFenceScanner'

const moveInlineWhitespaceToTail = (content: string, index: number) => {
  let resolvedIndex = index

  while (resolvedIndex > 0 && /[ \t]/.test(content[resolvedIndex - 1] || '')) {
    resolvedIndex -= 1
  }

  return resolvedIndex
}

export interface TrMarkdownSmoothState {
  stableContent: string
  tailContent: string
}

const resolveFenceRangeAt = (content: string, index: number) => {
  const fence = scanMarkdownFences(content).fences.find((candidate) => index > candidate.start && index < candidate.end)

  if (fence) {
    return {
      closed: fence.closed,
      end: fence.end,
      start: fence.start,
    }
  }
}

export const splitMarkdownTail = (content: string, smoothingChars = 32): TrMarkdownSmoothState => {
  if (!content) {
    return {
      stableContent: '',
      tailContent: '',
    }
  }

  if (content.endsWith('\n')) {
    return {
      stableContent: content,
      tailContent: '',
    }
  }

  const maxTailChars = Math.max(8, smoothingChars)
  if (content.length <= maxTailChars) {
    return {
      stableContent: '',
      tailContent: content,
    }
  }

  const searchStart = Math.max(0, content.length - maxTailChars * 3)
  const recentContent = content.slice(searchStart)

  let stableEnd = -1
  punctuationBoundaryPattern.lastIndex = 0
  for (const match of recentContent.matchAll(punctuationBoundaryPattern)) {
    const end = searchStart + (match.index ?? 0) + match[0].length
    if (end < content.length) {
      stableEnd = end
    }
  }

  if (stableEnd < 0) {
    const whitespaceBoundary = content.lastIndexOf(' ', content.length - Math.floor(maxTailChars / 2))
    if (whitespaceBoundary > searchStart) {
      stableEnd = whitespaceBoundary + 1
    }
  }

  if (stableEnd < 0) {
    stableEnd = Math.max(0, content.length - maxTailChars)
  }

  // Markdown parsers commonly trim trailing inline whitespace from a block.
  // Keep that separator in the raw tail so the stable node and tail still
  // concatenate to the exact source text (for example, "is already").
  stableEnd = moveInlineWhitespaceToTail(content, stableEnd)

  const fenceRange = resolveFenceRangeAt(content, stableEnd)
  if (fenceRange) {
    stableEnd = fenceRange.closed ? fenceRange.end : fenceRange.start
  }

  return {
    stableContent: content.slice(0, stableEnd),
    tailContent: content.slice(stableEnd),
  }
}
