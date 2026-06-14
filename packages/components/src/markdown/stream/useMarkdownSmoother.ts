const punctuationBoundaryPattern = /(?:[。！？!?；;：:,，]\s*|\n+)/g
const codeFenceLinePattern = /^ {0,3}(```+|~~~+).*$/

export interface TrMarkdownSmoothState {
  stableContent: string
  tailContent: string
}

const resolveFenceRangeAt = (content: string, index: number) => {
  let openFence: { marker: string; size: number; start: number } | null = null
  let offset = 0

  for (const line of content.split('\n')) {
    const matched = line.match(codeFenceLinePattern)
    const lineStart = offset
    const lineEnd = offset + line.length
    offset = lineEnd + 1

    if (!matched) {
      continue
    }

    const markerToken = matched[1]
    const marker = markerToken[0]
    const size = markerToken.length

    if (!openFence) {
      openFence = { marker, size, start: lineStart }
      continue
    }

    if (openFence.marker === marker && size >= openFence.size) {
      const closeEnd = Math.min(content.length, lineEnd)
      if (index > openFence.start && index < closeEnd) {
        return {
          closed: true,
          end: closeEnd,
          start: openFence.start,
        }
      }
      openFence = null
    }
  }

  if (openFence && index > openFence.start) {
    return {
      closed: false,
      end: content.length,
      start: openFence.start,
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

  const fenceRange = resolveFenceRangeAt(content, stableEnd)
  if (fenceRange) {
    stableEnd = fenceRange.closed ? fenceRange.end : fenceRange.start
  }

  return {
    stableContent: content.slice(0, stableEnd),
    tailContent: content.slice(stableEnd),
  }
}
