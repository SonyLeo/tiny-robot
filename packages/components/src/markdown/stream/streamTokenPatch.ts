import { splitTextGraphemes } from './grapheme'
import type { TrMarkdownStreamTokenPatch, TrMarkdownStreamTokenPatchSegment } from './streamingAnimation.type'

const joinTokens = (tokens: string[], start: number, end: number) => tokens.slice(start, end).join('')

export const createStreamTokenPatch = (previousText: string, nextText: string): TrMarkdownStreamTokenPatch => {
  const previousTokens = splitTextGraphemes(previousText)
  const nextTokens = splitTextGraphemes(nextText)
  const previousLength = previousTokens.length
  const nextLength = nextTokens.length
  let commonPrefixLength = 0

  while (
    commonPrefixLength < previousLength &&
    commonPrefixLength < nextLength &&
    previousTokens[commonPrefixLength] === nextTokens[commonPrefixLength]
  ) {
    commonPrefixLength += 1
  }

  let commonSuffixLength = 0
  while (
    commonSuffixLength < previousLength - commonPrefixLength &&
    commonSuffixLength < nextLength - commonPrefixLength &&
    previousTokens[previousLength - commonSuffixLength - 1] === nextTokens[nextLength - commonSuffixLength - 1]
  ) {
    commonSuffixLength += 1
  }

  const segments: TrMarkdownStreamTokenPatchSegment[] = []

  if (commonPrefixLength > 0) {
    segments.push({
      kind: 'equal',
      previousStart: 0,
      previousEnd: commonPrefixLength,
      nextStart: 0,
      nextEnd: commonPrefixLength,
      previousText: joinTokens(previousTokens, 0, commonPrefixLength),
      nextText: joinTokens(nextTokens, 0, commonPrefixLength),
    })
  }

  const previousMiddleStart = commonPrefixLength
  const previousMiddleEnd = previousLength - commonSuffixLength
  const nextMiddleStart = commonPrefixLength
  const nextMiddleEnd = nextLength - commonSuffixLength
  const previousMiddleText = joinTokens(previousTokens, previousMiddleStart, previousMiddleEnd)
  const nextMiddleText = joinTokens(nextTokens, nextMiddleStart, nextMiddleEnd)

  if (previousMiddleStart < previousMiddleEnd || nextMiddleStart < nextMiddleEnd) {
    const kind =
      previousMiddleStart === previousMiddleEnd ? 'insert' : nextMiddleStart === nextMiddleEnd ? 'delete' : 'replace'

    segments.push({
      kind,
      previousStart: previousMiddleStart,
      previousEnd: previousMiddleEnd,
      nextStart: nextMiddleStart,
      nextEnd: nextMiddleEnd,
      previousText: previousMiddleText,
      nextText: nextMiddleText,
    })
  }

  if (commonSuffixLength > 0) {
    segments.push({
      kind: 'equal',
      previousStart: previousLength - commonSuffixLength,
      previousEnd: previousLength,
      nextStart: nextLength - commonSuffixLength,
      nextEnd: nextLength,
      previousText: joinTokens(previousTokens, previousLength - commonSuffixLength, previousLength),
      nextText: joinTokens(nextTokens, nextLength - commonSuffixLength, nextLength),
    })
  }

  return {
    previousText,
    nextText,
    previousTokens,
    nextTokens,
    commonPrefixLength,
    commonSuffixLength,
    preservedGraphemeCount: commonPrefixLength + commonSuffixLength,
    segments,
  }
}

export const remapStreamTokenBirths = (
  previousBirths: number[],
  patch: TrMarkdownStreamTokenPatch,
  createInsertedBirths: (startIndex: number, count: number) => number[],
): number[] => {
  const nextBirths: number[] = []

  for (const segment of patch.segments) {
    if (segment.kind === 'equal') {
      nextBirths.push(...previousBirths.slice(segment.previousStart, segment.previousEnd))
      continue
    }

    if (segment.kind === 'delete') {
      continue
    }

    nextBirths.push(...createInsertedBirths(segment.nextStart, segment.nextEnd - segment.nextStart))
  }

  return nextBirths
}
