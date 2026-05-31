import { splitGraphemes as splitGraphemesFallback } from 'unicode-segmenter/grapheme'

type GraphemeSegmentRecord = {
  segment: string
}

type GraphemeSegmenterLike = {
  segment: (text: string) => Iterable<GraphemeSegmentRecord>
}

type IntlWithOptionalSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: {
      granularity: 'grapheme'
    },
  ) => GraphemeSegmenterLike
}

const segmenterCtor = (Intl as IntlWithOptionalSegmenter).Segmenter
const graphemeSegmenter =
  typeof segmenterCtor === 'function' ? new segmenterCtor(undefined, { granularity: 'grapheme' }) : null

export const splitTextGraphemes = (text: string): string[] => {
  if (!text) {
    return []
  }

  if (graphemeSegmenter) {
    const segments: string[] = []

    for (const segment of graphemeSegmenter.segment(text)) {
      segments.push(segment.segment)
    }

    return segments
  }

  return Array.from(splitGraphemesFallback(text))
}

export const countTextGraphemes = (text: string): number => {
  return splitTextGraphemes(text).length
}
