import { createStreamTokenPatch, remapStreamTokenBirths } from './streamTokenPatch'
import { splitTextGraphemes } from './grapheme'
import type {
  TrMarkdownStreamTokenSchedule,
  TrMarkdownStreamTokenScheduleAction,
  TrMarkdownStreamTokenScheduleSegment,
} from './streamingAnimation.type'

export interface TrMarkdownStreamTokenSchedulerOptions {
  charDelay: number
  currentBirths: number[]
  maxLeadMs: number
  nextRevision: number
  nextText: string
  nowMs: number
  previousActive: boolean
  previousRevision: number
  previousText: string
}

const createInsertedBirths = (
  currentBirths: number[],
  startIndex: number,
  count: number,
  nowMs: number,
  charDelay: number,
  maxLeadMs: number,
) => {
  if (count === 0) {
    return []
  }

  const births: number[] = []
  const cap = nowMs + maxLeadMs
  const previousBirth = currentBirths[startIndex - 1]
  let cursor = typeof previousBirth === 'number' ? previousBirth : nowMs - charDelay

  for (let index = 0; index < count; index += 1) {
    cursor = Math.min(cap, Math.max(nowMs, cursor + charDelay))
    births.push(cursor)
  }

  return births
}

const buildBirths = (count: number, nowMs: number, charDelay: number, maxLeadMs: number) => {
  return createInsertedBirths([], 0, count, nowMs, charDelay, maxLeadMs)
}

const appendBirths = (
  currentBirths: number[],
  nextCount: number,
  nowMs: number,
  charDelay: number,
  maxLeadMs: number,
) => {
  const births = currentBirths.slice()
  births.push(...createInsertedBirths(births, births.length, nextCount - births.length, nowMs, charDelay, maxLeadMs))

  return births
}

const countSegmentTokens = (start: number, end: number) => Math.max(0, end - start)

const createAppendSegments = (previousCount: number, nextCount: number): TrMarkdownStreamTokenScheduleSegment[] => {
  const segments: TrMarkdownStreamTokenScheduleSegment[] = []

  if (previousCount > 0) {
    segments.push({
      action: 'preserve',
      kind: 'equal',
      previousStart: 0,
      previousEnd: previousCount,
      nextStart: 0,
      nextEnd: previousCount,
      previousText: '',
      nextText: '',
    })
  }

  if (nextCount > previousCount) {
    segments.push({
      action: 'reveal',
      kind: 'insert',
      previousStart: previousCount,
      previousEnd: previousCount,
      nextStart: previousCount,
      nextEnd: nextCount,
      previousText: '',
      nextText: '',
    })
  }

  return segments
}

const toScheduledSegments = (
  patch: ReturnType<typeof createStreamTokenPatch>,
): TrMarkdownStreamTokenScheduleSegment[] => {
  return patch.segments.map((segment) => ({
    ...segment,
    action: segment.kind === 'equal' ? 'preserve' : segment.kind === 'delete' ? 'drop' : 'reveal',
  }))
}

const summarizeSegments = (
  action: TrMarkdownStreamTokenScheduleAction,
  segments: TrMarkdownStreamTokenScheduleSegment[],
  nextCount: number,
) => {
  if (action === 'reset') {
    return {
      preservedCount: 0,
      insertedCount: nextCount,
      deletedCount: 0,
      replacedCount: 0,
    }
  }

  return segments.reduce(
    (summary, segment) => {
      if (segment.kind === 'equal') {
        summary.preservedCount += countSegmentTokens(segment.nextStart, segment.nextEnd)
      }

      if (segment.kind === 'insert') {
        summary.insertedCount += countSegmentTokens(segment.nextStart, segment.nextEnd)
      }

      if (segment.kind === 'delete') {
        summary.deletedCount += countSegmentTokens(segment.previousStart, segment.previousEnd)
      }

      if (segment.kind === 'replace') {
        summary.replacedCount += countSegmentTokens(segment.nextStart, segment.nextEnd)
      }

      return summary
    },
    {
      preservedCount: 0,
      insertedCount: 0,
      deletedCount: 0,
      replacedCount: 0,
    },
  )
}

export const useStreamTokenScheduler = () => {
  const schedule = ({
    charDelay,
    currentBirths,
    maxLeadMs,
    nextRevision,
    nextText,
    nowMs,
    previousActive,
    previousRevision,
    previousText,
  }: TrMarkdownStreamTokenSchedulerOptions): TrMarkdownStreamTokenSchedule => {
    const sameRevision = nextRevision === previousRevision
    const previousTokens = splitTextGraphemes(previousText)
    const nextTokens = splitTextGraphemes(nextText)
    const nextCount = nextTokens.length

    if (nextCount === 0) {
      return {
        action: 'idle',
        births: [],
        insertedCount: 0,
        deletedCount: previousTokens.length,
        preservedCount: 0,
        replacedCount: 0,
        reset: false,
        revisionChanged: false,
        segments: [],
      }
    }

    if (!previousActive) {
      return {
        action: 'reset',
        births: buildBirths(nextCount, nowMs, charDelay, maxLeadMs),
        insertedCount: nextCount,
        deletedCount: 0,
        preservedCount: 0,
        replacedCount: 0,
        reset: true,
        revisionChanged: true,
        segments: [
          {
            action: 'reveal',
            kind: 'insert',
            previousStart: 0,
            previousEnd: 0,
            nextStart: 0,
            nextEnd: nextCount,
            previousText: '',
            nextText,
          },
        ],
      }
    }

    const isAppend = nextText.startsWith(previousText) && sameRevision
    if (isAppend) {
      const births =
        nextCount > currentBirths.length
          ? appendBirths(currentBirths, nextCount, nowMs, charDelay, maxLeadMs)
          : currentBirths.slice(0, nextCount)
      const segments = createAppendSegments(currentBirths.length, nextCount)
      const summary = summarizeSegments('append', segments, nextCount)

      return {
        action: 'append',
        births,
        ...summary,
        reset: false,
        revisionChanged: nextCount > currentBirths.length,
        segments,
      }
    }

    const patch = sameRevision ? createStreamTokenPatch(previousText, nextText) : undefined
    const canPatchRewrite =
      Boolean(patch) &&
      (patch?.commonPrefixLength || 0) > 0 &&
      (patch?.commonSuffixLength || 0) > 0 &&
      currentBirths.length === patch?.previousTokens.length

    if (patch && canPatchRewrite) {
      const births = remapStreamTokenBirths(currentBirths, patch, (startIndex, count) =>
        createInsertedBirths(currentBirths, startIndex, count, nowMs, charDelay, maxLeadMs),
      )
      const segments = toScheduledSegments(patch)
      const summary = summarizeSegments('patch', segments, nextCount)

      return {
        action: 'patch',
        births,
        patch,
        ...summary,
        reset: false,
        revisionChanged: true,
        segments,
      }
    }

    return {
      action: 'reset',
      births: buildBirths(nextCount, nowMs, charDelay, maxLeadMs),
      insertedCount: nextCount,
      deletedCount: previousTokens.length,
      preservedCount: 0,
      replacedCount: 0,
      reset: true,
      revisionChanged: true,
      segments: [
        {
          action: 'reveal',
          kind: previousTokens.length > 0 ? 'replace' : 'insert',
          previousStart: 0,
          previousEnd: previousTokens.length,
          nextStart: 0,
          nextEnd: nextCount,
          previousText,
          nextText,
        },
      ],
    }
  }

  return {
    schedule,
  }
}
