import { shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import type { TrMarkdownStreamingProfilerConfig } from '../index.type'
import type {
  TrMarkdownStreamBlockState,
  TrMarkdownStreamBlockUpdateKind,
  TrMarkdownStreamSchedulerPhase,
  TrMarkdownStreamTokenScheduleAction,
} from './streamingAnimation.type'

export type TrMarkdownStreamProfilerCommitPhase = 'mount' | 'update'

export type TrMarkdownStreamProfilerEventType =
  | 'input'
  | 'calculation'
  | 'queue-transition'
  | 'animation-frame'
  | 'token-schedule'
  | 'root-commit'
  | 'block-commit'

export interface TrMarkdownStreamProfilerOptions {
  enabled?: boolean
  label?: string
  maxEvents?: number
}

export interface TrMarkdownStreamProfilerEvent {
  id: number
  time: number
  type: TrMarkdownStreamProfilerEventType
  name?: string
  blockKey?: string
  updateKind?: TrMarkdownStreamBlockUpdateKind
  fromPhase?: TrMarkdownStreamSchedulerPhase
  phase?: TrMarkdownStreamSchedulerPhase
  durationMs?: number
  textLength?: number
  itemCount?: number
  appendedChars?: number
  contentLength?: number
  queueLength?: number
  blockCount?: number
  activeIndex?: number
  animatingIndex?: number
  streamingIndex?: number
  inputActive?: boolean
  revealChars?: number
  backlog?: number
  frameIntervalMs?: number
  skipped?: boolean
  commitPhase?: TrMarkdownStreamProfilerCommitPhase
  blockChars?: number
  blockIndex?: number
  blockState?: TrMarkdownStreamBlockState
  baseDurationMs?: number
  tokenAction?: TrMarkdownStreamTokenScheduleAction
  tokenSegmentCount?: number
  tokenPreservedCount?: number
  tokenInsertedCount?: number
  tokenDeletedCount?: number
  tokenReplacedCount?: number
}

export interface TrMarkdownStreamProfilerSnapshot {
  enabled: boolean
  label: string
  sessionId: number
  createdAt: number
  updatedAt: number
  eventCount: number
  lastEventType: TrMarkdownStreamProfilerEventType | 'none'
  lastEventName: string
  timeline: string[]
  inputCount: number
  inputAppendChars: number
  inputRewriteCount: number
  parseCount: number
  parseAvgMs: number
  blockDiffCount: number
  blockDiffAvgMs: number
  queueTransitionCount: number
  settleCount: number
  finalizeCount: number
  animationFrameCount: number
  frameAvgMs: number
  frameLastMs: number
  frameMaxMs: number
  frameIntervalAvgMs: number
  slowFrameCount: number
  revealFrameCount: number
  skippedFrameCount: number
  fpsSampleCount: number
  fpsCurrent: number
  fpsAvg: number
  fpsMin: number
  fpsMax: number
  fpsIndex: number
  maxBacklog: number
  lastBacklog: number
  rootCommitCount: number
  rootCommitAvgMs: number
  rootCommitLastMs: number
  rootCommitMaxMs: number
  rootCommitLastPhase: TrMarkdownStreamProfilerCommitPhase | 'none'
  rootCommitLastBlockCount: number
  rootCommitLastTextLength: number
  rootCommitMountCount: number
  rootCommitUpdateCount: number
  blockCommitCount: number
  blockCommitAvgMs: number
  blockCommitLastMs: number
  blockCommitMaxMs: number
  blockCommitLastState: TrMarkdownStreamBlockState | 'none'
  trackedBlockCount: number
  blockCommitMountCount: number
  blockCommitUpdateCount: number
  tokenScheduleCount: number
  tokenScheduleAvgMs: number
  tokenPreservedCount: number
  tokenInsertedCount: number
  tokenDeletedCount: number
  tokenReplacedCount: number
}

export interface TrMarkdownStreamProfiler {
  snapshot: ShallowRef<TrMarkdownStreamProfilerSnapshot>
  recordAnimationFrame: (sample: {
    backlog: number
    blockKey?: string
    durationMs: number
    frameIntervalMs?: number
    inputActive: boolean
    revealChars: number
    skipped?: boolean
  }) => void
  recordBlockCommit: (sample: {
    blockChars: number
    blockIndex: number
    blockKey: string
    durationMs: number
    phase: TrMarkdownStreamProfilerCommitPhase
    state: TrMarkdownStreamBlockState
  }) => void
  recordCalculation: (sample: {
    durationMs: number
    itemCount?: number
    name: 'parse' | 'block-diff'
    textLength?: number
  }) => void
  recordInput: (sample: {
    appendedChars: number
    contentLength: number
    updateKind: TrMarkdownStreamBlockUpdateKind
  }) => void
  recordQueueTransition: (sample: {
    activeIndex: number
    animatingIndex: number
    blockCount: number
    fromPhase: TrMarkdownStreamSchedulerPhase
    phase: TrMarkdownStreamSchedulerPhase
    queueLength: number
    streamingIndex: number
  }) => void
  recordRootCommit: (sample: {
    blockCount: number
    durationMs: number
    phase: TrMarkdownStreamProfilerCommitPhase
    textLength: number
  }) => void
  recordTokenSchedule: (sample: {
    action: TrMarkdownStreamTokenScheduleAction
    blockKey?: string
    durationMs: number
    insertedCount: number
    deletedCount: number
    preservedCount: number
    replacedCount: number
    segmentCount: number
  }) => void
  reset: () => void
}

const DEFAULT_LABEL = 'tr-markdown-stream'
const DEFAULT_MAX_EVENTS = 48
const SLOW_FRAME_BUDGET_MS = 4
const TARGET_FPS = 60

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

const createSnapshot = (
  options: TrMarkdownStreamProfilerOptions,
  sessionId: number,
): TrMarkdownStreamProfilerSnapshot => {
  const now = getNow()

  return {
    enabled: Boolean(options.enabled),
    label: options.label || DEFAULT_LABEL,
    sessionId,
    createdAt: now,
    updatedAt: now,
    eventCount: 0,
    lastEventType: 'none',
    lastEventName: 'none',
    timeline: [],
    inputCount: 0,
    inputAppendChars: 0,
    inputRewriteCount: 0,
    parseCount: 0,
    parseAvgMs: 0,
    blockDiffCount: 0,
    blockDiffAvgMs: 0,
    queueTransitionCount: 0,
    settleCount: 0,
    finalizeCount: 0,
    animationFrameCount: 0,
    frameAvgMs: 0,
    frameLastMs: 0,
    frameMaxMs: 0,
    frameIntervalAvgMs: 0,
    slowFrameCount: 0,
    revealFrameCount: 0,
    skippedFrameCount: 0,
    fpsSampleCount: 0,
    fpsCurrent: 0,
    fpsAvg: 0,
    fpsMin: 0,
    fpsMax: 0,
    fpsIndex: 0,
    maxBacklog: 0,
    lastBacklog: 0,
    rootCommitCount: 0,
    rootCommitAvgMs: 0,
    rootCommitLastMs: 0,
    rootCommitMaxMs: 0,
    rootCommitLastPhase: 'none',
    rootCommitLastBlockCount: 0,
    rootCommitLastTextLength: 0,
    rootCommitMountCount: 0,
    rootCommitUpdateCount: 0,
    blockCommitCount: 0,
    blockCommitAvgMs: 0,
    blockCommitLastMs: 0,
    blockCommitMaxMs: 0,
    blockCommitLastState: 'none',
    trackedBlockCount: 0,
    blockCommitMountCount: 0,
    blockCommitUpdateCount: 0,
    tokenScheduleCount: 0,
    tokenScheduleAvgMs: 0,
    tokenPreservedCount: 0,
    tokenInsertedCount: 0,
    tokenDeletedCount: 0,
    tokenReplacedCount: 0,
  }
}

const average = (previousAverage: number, previousCount: number, nextValue: number) => {
  return previousCount <= 0 ? nextValue : (previousAverage * previousCount + nextValue) / (previousCount + 1)
}

const clampDuration = (value: number | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value || 0)
}

const clampFps = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(120, value))
}

const formatTimelineLabel = (event: TrMarkdownStreamProfilerEvent) => {
  if (event.type === 'calculation') {
    const group = event.name === 'block-diff' ? 'diff' : 'parse'
    return `${group}:${(event.durationMs || 0).toFixed(2)}ms/${event.itemCount || 0}`
  }

  if (event.type === 'queue-transition') {
    return `queue:${event.fromPhase}->${event.phase}/q${event.queueLength || 0}`
  }

  if (event.type === 'token-schedule') {
    return `token:${event.tokenAction}/+${event.tokenInsertedCount || 0}/=${event.tokenPreservedCount || 0}/-${event.tokenDeletedCount || 0}/~${event.tokenReplacedCount || 0}`
  }

  if (event.type === 'animation-frame') {
    const fps = event.frameIntervalMs ? clampFps(1000 / event.frameIntervalMs).toFixed(0) : '0'
    return `frame:${event.revealChars || 0}/${event.backlog || 0}/${(event.durationMs || 0).toFixed(2)}ms/${fps}fps`
  }

  if (event.type === 'root-commit') {
    return `root:${event.commitPhase}/${(event.durationMs || 0).toFixed(2)}ms/b${event.blockCount || 0}`
  }

  if (event.type === 'block-commit') {
    return `block:${event.blockState}/${(event.durationMs || 0).toFixed(2)}ms/#${event.blockIndex ?? -1}`
  }

  return `input:${event.updateKind}/+${event.appendedChars || 0}`
}

export const resolveTrMarkdownStreamProfilerOptions = (
  value: boolean | TrMarkdownStreamingProfilerConfig | undefined,
): TrMarkdownStreamProfilerOptions => {
  if (value === true) {
    return {
      enabled: true,
      label: DEFAULT_LABEL,
      maxEvents: DEFAULT_MAX_EVENTS,
    }
  }

  if (value === false || value === undefined) {
    return {
      enabled: false,
      label: DEFAULT_LABEL,
      maxEvents: DEFAULT_MAX_EVENTS,
    }
  }

  return {
    enabled: value.enabled !== false,
    label: value.label || DEFAULT_LABEL,
    maxEvents: value.maxEvents || DEFAULT_MAX_EVENTS,
  }
}

export const createTrMarkdownStreamProfiler = (
  options: MaybeRefOrGetter<TrMarkdownStreamProfilerOptions>,
): TrMarkdownStreamProfiler => {
  let sessionId = 1
  let eventId = 0
  let events: TrMarkdownStreamProfilerEvent[] = []
  const trackedBlockKeys = new Set<string>()
  const snapshot = shallowRef(createSnapshot(toValue(options), sessionId))

  const getOptions = () => toValue(options)
  const isEnabled = () => Boolean(getOptions().enabled)

  const reset = () => {
    sessionId += 1
    eventId = 0
    events = []
    trackedBlockKeys.clear()
    snapshot.value = createSnapshot(getOptions(), sessionId)
  }

  const pushEvent = (event: Omit<TrMarkdownStreamProfilerEvent, 'id' | 'time'>) => {
    const nextOptions = getOptions()
    const enabled = Boolean(nextOptions.enabled)

    if (!enabled) {
      if (snapshot.value.enabled) {
        snapshot.value = createSnapshot(nextOptions, sessionId)
      }
      return
    }

    const nextEvent: TrMarkdownStreamProfilerEvent = {
      ...event,
      id: ++eventId,
      time: getNow(),
    }
    const maxEvents = Math.max(8, nextOptions.maxEvents || DEFAULT_MAX_EVENTS)
    events = [...events, nextEvent].slice(-maxEvents)
    const previous = snapshot.value.enabled ? snapshot.value : createSnapshot(nextOptions, sessionId)
    const next = {
      ...previous,
      enabled,
      label: nextOptions.label || DEFAULT_LABEL,
      updatedAt: nextEvent.time,
      eventCount: previous.eventCount + 1,
      lastEventType: nextEvent.type,
      lastEventName: formatTimelineLabel(nextEvent),
      timeline: events.map(formatTimelineLabel).slice(-Math.min(maxEvents, 48)),
    }

    if (nextEvent.type === 'input') {
      next.inputCount += 1
      next.inputAppendChars += nextEvent.updateKind === 'append' ? nextEvent.appendedChars || 0 : 0
      next.inputRewriteCount += nextEvent.updateKind === 'rewrite' ? 1 : 0
    }

    if (nextEvent.type === 'calculation') {
      const duration = nextEvent.durationMs || 0
      if (nextEvent.name === 'parse') {
        next.parseAvgMs = average(next.parseAvgMs, next.parseCount, duration)
        next.parseCount += 1
      }

      if (nextEvent.name === 'block-diff') {
        next.blockDiffAvgMs = average(next.blockDiffAvgMs, next.blockDiffCount, duration)
        next.blockDiffCount += 1
      }
    }

    if (nextEvent.type === 'queue-transition') {
      next.queueTransitionCount += 1
      next.settleCount += nextEvent.phase === 'settling' ? 1 : 0
      next.finalizeCount += nextEvent.phase === 'finalized' ? 1 : 0
    }

    if (nextEvent.type === 'animation-frame') {
      const duration = clampDuration(nextEvent.durationMs)
      next.frameAvgMs = average(next.frameAvgMs, next.animationFrameCount, duration)
      next.frameLastMs = duration
      next.frameMaxMs = Math.max(next.frameMaxMs, duration)
      next.animationFrameCount += 1
      next.slowFrameCount += (nextEvent.durationMs || 0) > SLOW_FRAME_BUDGET_MS ? 1 : 0
      next.revealFrameCount += (nextEvent.revealChars || 0) > 0 ? 1 : 0
      next.skippedFrameCount += nextEvent.skipped ? 1 : 0
      next.lastBacklog = nextEvent.backlog || 0
      next.maxBacklog = Math.max(next.maxBacklog, nextEvent.backlog || 0)

      const frameInterval = clampDuration(nextEvent.frameIntervalMs)
      if (frameInterval > 0) {
        const fps = clampFps(1000 / frameInterval)
        next.frameIntervalAvgMs = average(next.frameIntervalAvgMs, next.fpsSampleCount, frameInterval)
        next.fpsAvg = average(next.fpsAvg, next.fpsSampleCount, fps)
        next.fpsSampleCount += 1
        next.fpsCurrent = fps
        next.fpsMin = next.fpsMin === 0 ? fps : Math.min(next.fpsMin, fps)
        next.fpsMax = Math.max(next.fpsMax, fps)
        next.fpsIndex = Math.round(Math.min(1, fps / TARGET_FPS) * 100)
      }
    }

    if (nextEvent.type === 'root-commit') {
      const duration = clampDuration(nextEvent.durationMs)
      next.rootCommitAvgMs = average(next.rootCommitAvgMs, next.rootCommitCount, duration)
      next.rootCommitCount += 1
      next.rootCommitLastMs = duration
      next.rootCommitMaxMs = Math.max(next.rootCommitMaxMs, duration)
      next.rootCommitLastPhase = nextEvent.commitPhase || 'none'
      next.rootCommitLastBlockCount = nextEvent.blockCount || 0
      next.rootCommitLastTextLength = nextEvent.textLength || 0
      next.rootCommitMountCount += nextEvent.commitPhase === 'mount' ? 1 : 0
      next.rootCommitUpdateCount += nextEvent.commitPhase === 'update' ? 1 : 0
    }

    if (nextEvent.type === 'block-commit') {
      const duration = clampDuration(nextEvent.durationMs)
      next.blockCommitAvgMs = average(next.blockCommitAvgMs, next.blockCommitCount, duration)
      next.blockCommitCount += 1
      next.blockCommitLastMs = duration
      next.blockCommitMaxMs = Math.max(next.blockCommitMaxMs, duration)
      next.blockCommitLastState = nextEvent.blockState || 'none'
      next.blockCommitMountCount += nextEvent.commitPhase === 'mount' ? 1 : 0
      next.blockCommitUpdateCount += nextEvent.commitPhase === 'update' ? 1 : 0
      if (nextEvent.blockKey) {
        trackedBlockKeys.add(nextEvent.blockKey)
      }
      next.trackedBlockCount = trackedBlockKeys.size
    }

    if (nextEvent.type === 'token-schedule') {
      const duration = nextEvent.durationMs || 0
      next.tokenScheduleAvgMs = average(next.tokenScheduleAvgMs, next.tokenScheduleCount, duration)
      next.tokenScheduleCount += 1
      next.tokenPreservedCount += nextEvent.tokenPreservedCount || 0
      next.tokenInsertedCount += nextEvent.tokenInsertedCount || 0
      next.tokenDeletedCount += nextEvent.tokenDeletedCount || 0
      next.tokenReplacedCount += nextEvent.tokenReplacedCount || 0
    }

    snapshot.value = next
  }

  return {
    snapshot,
    recordAnimationFrame(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'animation-frame',
        blockKey: sample.blockKey,
        durationMs: sample.durationMs,
        frameIntervalMs: sample.frameIntervalMs,
        backlog: sample.backlog,
        inputActive: sample.inputActive,
        revealChars: sample.revealChars,
        skipped: sample.skipped,
      })
    },
    recordBlockCommit(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'block-commit',
        blockChars: sample.blockChars,
        blockIndex: sample.blockIndex,
        blockKey: sample.blockKey,
        blockState: sample.state,
        commitPhase: sample.phase,
        durationMs: sample.durationMs,
      })
    },
    recordCalculation(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'calculation',
        name: sample.name,
        durationMs: sample.durationMs,
        itemCount: sample.itemCount,
        textLength: sample.textLength,
      })
    },
    recordInput(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'input',
        updateKind: sample.updateKind,
        appendedChars: sample.appendedChars,
        contentLength: sample.contentLength,
      })
    },
    recordQueueTransition(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'queue-transition',
        activeIndex: sample.activeIndex,
        animatingIndex: sample.animatingIndex,
        blockCount: sample.blockCount,
        fromPhase: sample.fromPhase,
        phase: sample.phase,
        queueLength: sample.queueLength,
        streamingIndex: sample.streamingIndex,
      })
    },
    recordRootCommit(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'root-commit',
        blockCount: sample.blockCount,
        commitPhase: sample.phase,
        durationMs: sample.durationMs,
        textLength: sample.textLength,
      })
    },
    recordTokenSchedule(sample) {
      if (!isEnabled()) return
      pushEvent({
        type: 'token-schedule',
        blockKey: sample.blockKey,
        durationMs: sample.durationMs,
        tokenAction: sample.action,
        tokenDeletedCount: sample.deletedCount,
        tokenInsertedCount: sample.insertedCount,
        tokenPreservedCount: sample.preservedCount,
        tokenReplacedCount: sample.replacedCount,
        tokenSegmentCount: sample.segmentCount,
      })
    },
    reset,
  }
}
