import type { TrMarkdownStreamTailKind } from '../index.type'

export interface TrMarkdownIncompleteState {
  holdIndex: number
  kind: TrMarkdownStreamTailKind
  reason: 'code-fence' | 'image' | 'link' | 'table'
}

type Candidate = TrMarkdownIncompleteState | undefined

const codeFencePattern = /^ {0,3}(```+|~~~+).*$/gm
const tableDelimiterPattern = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+(?:\s*:?-{3,}:?\s*)?\|?\s*$/
const tableLinePattern = /^\s*\|.*\|?\s*$/
const markdownImageTargetPattern = /!\[[^\]\n]*\]\([^\)\n]*$/
const markdownImageAltPattern = /!\[[^\]\n]*$/
const markdownLinkTargetPattern = /\[[^\]\n]*\]\([^\)\n]*$/
const markdownLinkLabelPattern = /\[[^\]\n]*$/

type LineInfo = {
  start: number
  text: string
}

const getLineStartIndex = (content: string, index: number) => {
  const lineStart = content.lastIndexOf('\n', Math.max(0, index - 1))
  return lineStart < 0 ? 0 : lineStart + 1
}

const getLineInfos = (content: string): LineInfo[] => {
  const lines = content.split('\n')
  const result: LineInfo[] = []
  let offset = 0

  for (const line of lines) {
    result.push({
      start: offset,
      text: line,
    })
    offset += line.length + 1
  }

  return result
}

const getUnclosedCodeFenceState = (content: string): Candidate => {
  let openFence: { marker: string; size: number; index: number } | null = null
  codeFencePattern.lastIndex = 0

  for (const match of content.matchAll(codeFencePattern)) {
    const markerToken = match[1]
    const marker = markerToken[0]
    const size = markerToken.length
    const index = match.index ?? 0

    if (!openFence) {
      openFence = { marker, size, index }
      continue
    }

    if (openFence.marker === marker && size >= openFence.size) {
      openFence = null
    }
  }

  if (!openFence) {
    return
  }

  return {
    holdIndex: openFence.index,
    kind: 'code',
    reason: 'code-fence',
  }
}

const getTrailingTableState = (content: string): Candidate => {
  const lineInfos = getLineInfos(content)
  if (lineInfos.length < 2) {
    return
  }

  const effectiveLastIndex =
    lineInfos.length > 1 && lineInfos[lineInfos.length - 1].text === '' ? lineInfos.length - 2 : lineInfos.length - 1

  if (effectiveLastIndex < 1) {
    return
  }

  for (let delimiterIndex = effectiveLastIndex; delimiterIndex >= 1; delimiterIndex -= 1) {
    const delimiterLine = lineInfos[delimiterIndex].text
    const headerLine = lineInfos[delimiterIndex - 1].text

    if (!tableDelimiterPattern.test(delimiterLine) || !tableLinePattern.test(headerLine)) {
      continue
    }

    let blockEnd = delimiterIndex
    for (let index = delimiterIndex + 1; index <= effectiveLastIndex; index += 1) {
      if (!tableLinePattern.test(lineInfos[index].text)) {
        break
      }
      blockEnd = index
    }

    if (blockEnd !== effectiveLastIndex) {
      continue
    }

    const hasDataRows = effectiveLastIndex > delimiterIndex
    if (!hasDataRows) {
      return {
        holdIndex: lineInfos[delimiterIndex - 1].start,
        kind: 'table',
        reason: 'table',
      }
    }

    if (!content.endsWith('\n')) {
      return {
        holdIndex: lineInfos[effectiveLastIndex].start,
        kind: 'table',
        reason: 'table',
      }
    }
  }
}

const getIncompleteLinkState = (content: string): Candidate => {
  const targetMatch = content.match(markdownLinkTargetPattern)
  if (targetMatch && typeof targetMatch.index === 'number') {
    return {
      holdIndex: getLineStartIndex(content, targetMatch.index),
      kind: 'link',
      reason: 'link',
    }
  }

  const labelMatch = content.match(markdownLinkLabelPattern)
  if (labelMatch && typeof labelMatch.index === 'number') {
    const slice = content.slice(labelMatch.index)
    if (!/^\[(?: |x|X)\]\s/.test(slice)) {
      return {
        holdIndex: getLineStartIndex(content, labelMatch.index),
        kind: 'link',
        reason: 'link',
      }
    }
  }
}

const getIncompleteImageState = (content: string): Candidate => {
  const targetMatch = content.match(markdownImageTargetPattern)
  if (targetMatch && typeof targetMatch.index === 'number') {
    return {
      holdIndex: getLineStartIndex(content, targetMatch.index),
      kind: 'image',
      reason: 'image',
    }
  }

  const altMatch = content.match(markdownImageAltPattern)
  if (altMatch && typeof altMatch.index === 'number') {
    return {
      holdIndex: getLineStartIndex(content, altMatch.index),
      kind: 'image',
      reason: 'image',
    }
  }
}

export const resolveIncompleteMarkdown = (content: string): TrMarkdownIncompleteState | undefined => {
  const candidates = [
    getUnclosedCodeFenceState(content),
    getTrailingTableState(content),
    getIncompleteImageState(content),
    getIncompleteLinkState(content),
  ]
    .filter(Boolean)
    .sort((left, right) => left!.holdIndex - right!.holdIndex)

  return candidates[0]
}
