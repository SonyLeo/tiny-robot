const punctuationBoundaryPattern = /(?:[。！？!?；;：:,，]\s*|\n+)/g

export interface TrMarkdownSmoothState {
  stableContent: string
  tailContent: string
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

  return {
    stableContent: content.slice(0, stableEnd),
    tailContent: content.slice(stableEnd),
  }
}
