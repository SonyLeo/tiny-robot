import { computed, shallowRef, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'
import type { TrMarkdownStreamingPreset } from '../index.type'
import { countTextGraphemes } from './grapheme'
import {
  computeStreamCharDelay,
  getStreamAnimationPresetConfig,
  resolveStreamSettleHoldMs,
} from './streamAnimationPreset'
import type {
  TrMarkdownStreamBlock,
  TrMarkdownStreamBlockState,
  TrMarkdownStreamSchedulerPhase,
  TrMarkdownStreamSchedulerSnapshot,
} from './streamingAnimation.type'
import type { TrMarkdownStreamProfiler } from './streamProfiler'

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export interface TrMarkdownStreamRevealQueueOptions {
  enabled: boolean
  active: boolean
  resetRevision: number
  preset: TrMarkdownStreamingPreset
}

export interface TrMarkdownStreamRevealQueueItem {
  block: TrMarkdownStreamBlock
  index: number
  state: TrMarkdownStreamBlockState
}

export interface TrMarkdownStreamRevealQueueState {
  items: ComputedRef<TrMarkdownStreamRevealQueueItem[]>
  activeIndex: ComputedRef<number>
  animatingIndex: ComputedRef<number>
  streamingIndex: ComputedRef<number>
  queueLength: ComputedRef<number>
  blockCount: ComputedRef<number>
  charDelay: Readonly<Ref<number>>
  fadeDuration: ComputedRef<number>
  settleHoldMs: ComputedRef<number>
  snapshot: ComputedRef<TrMarkdownStreamSchedulerSnapshot>
  phase: Readonly<Ref<TrMarkdownStreamSchedulerPhase>>
  revealedCount: ComputedRef<number>
  pendingCount: ComputedRef<number>
  rewriteCount: Readonly<Ref<number>>
  onBlockSettled: (blockKey: string) => void
}

export const useStreamRevealQueue = (
  blocks: MaybeRefOrGetter<TrMarkdownStreamBlock[]>,
  options: MaybeRefOrGetter<TrMarkdownStreamRevealQueueOptions>,
  profiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>,
): TrMarkdownStreamRevealQueueState => {
  const revealedCount = shallowRef(0)
  const minRevealedCount = shallowRef(0)
  const rewriteCount = shallowRef(0)
  const phase = shallowRef<TrMarkdownStreamSchedulerPhase>('idle')
  let previousBlockCount = 0
  let previousResetRevision = -1
  let settleStartedAt = 0
  let finalizeTimer: ReturnType<typeof setTimeout> | null = null
  const charDelay = shallowRef(getStreamAnimationPresetConfig('balanced').baseDelay)
  const frozenDelayToken = shallowRef('')
  let previousQueueSignature = ''
  let previousProfilerPhase: TrMarkdownStreamSchedulerPhase = 'idle'

  const resolvedRevealedCount = computed(() => {
    return Math.max(revealedCount.value, minRevealedCount.value)
  })
  const blockCount = computed(() => toValue(blocks).length)
  const fadeDuration = computed(() => getStreamAnimationPresetConfig(toValue(options).preset).fadeDuration)
  const settleHoldMs = computed(() => {
    return resolveStreamSettleHoldMs(charDelay.value, fadeDuration.value)
  })

  const clearFinalizeTimer = () => {
    if (!finalizeTimer) {
      return
    }

    clearTimeout(finalizeTimer)
    finalizeTimer = null
  }

  const setPhase = (nextPhase: TrMarkdownStreamSchedulerPhase) => {
    if (phase.value === nextPhase) {
      return
    }

    phase.value = nextPhase
  }

  const enterSettling = () => {
    if (phase.value !== 'settling') {
      settleStartedAt = getNow()
    }

    setPhase('settling')
  }

  const scheduleFinalize = () => {
    clearFinalizeTimer()

    const remaining = Math.max(0, settleHoldMs.value - (getNow() - settleStartedAt))

    if (remaining === 0) {
      setPhase('finalized')
      return
    }

    finalizeTimer = setTimeout(() => {
      setPhase('finalized')
      finalizeTimer = null
    }, remaining)
  }

  watch(
    [() => toValue(blocks), () => toValue(options)],
    ([nextBlocks, nextOptions]) => {
      const blockCount = nextBlocks.length
      const resetChanged = nextOptions.resetRevision !== previousResetRevision

      if (!nextOptions.enabled) {
        clearFinalizeTimer()
        revealedCount.value = blockCount
        minRevealedCount.value = blockCount
        setPhase('idle')
        previousBlockCount = blockCount
        previousResetRevision = nextOptions.resetRevision
        return
      }

      if (resetChanged) {
        revealedCount.value = 0
        minRevealedCount.value = 0
        if (previousResetRevision >= 0) {
          rewriteCount.value += 1
        }
      }

      if (blockCount === 0) {
        clearFinalizeTimer()
        revealedCount.value = 0
        minRevealedCount.value = 0
        setPhase(nextOptions.active ? 'streaming' : 'finalized')
        previousBlockCount = 0
        previousResetRevision = nextOptions.resetRevision
        return
      }

      if (!resetChanged && blockCount > previousBlockCount && previousBlockCount > 0) {
        // Promote the previous tail so already-visible chars do not restart when new blocks arrive.
        minRevealedCount.value = Math.max(minRevealedCount.value, previousBlockCount)
      }

      revealedCount.value = Math.min(revealedCount.value, blockCount)
      minRevealedCount.value = Math.min(minRevealedCount.value, blockCount)

      const nextResolvedRevealed = Math.max(revealedCount.value, minRevealedCount.value)

      if (nextOptions.active) {
        clearFinalizeTimer()
        setPhase('streaming')
      } else {
        enterSettling()

        if (nextResolvedRevealed >= blockCount) {
          scheduleFinalize()
        } else {
          clearFinalizeTimer()
        }
      }

      previousBlockCount = blockCount
      previousResetRevision = nextOptions.resetRevision
    },
    {
      immediate: true,
    },
  )

  const activeIndex = computed(() => {
    const nextBlocks = toValue(blocks)
    const nextOptions = toValue(options)

    if (!nextOptions.enabled || nextBlocks.length === 0) {
      return -1
    }

    if (phase.value === 'finalized') {
      return -1
    }

    return animatingIndex.value >= 0 ? animatingIndex.value : streamingIndex.value
  })

  const animatingIndex = computed(() => {
    const nextBlocks = toValue(blocks)
    const nextOptions = toValue(options)
    const resolvedRevealed = resolvedRevealedCount.value
    const lastIndex = nextBlocks.length - 1

    if (!nextOptions.enabled || nextBlocks.length === 0 || phase.value === 'finalized') {
      return -1
    }

    if (resolvedRevealed < 0 || resolvedRevealed >= nextBlocks.length) {
      return -1
    }

    if (!nextOptions.active) {
      return resolvedRevealed
    }

    return resolvedRevealed < lastIndex ? resolvedRevealed : -1
  })

  const streamingIndex = computed(() => {
    const nextBlocks = toValue(blocks)
    const nextOptions = toValue(options)
    const resolvedRevealed = resolvedRevealedCount.value
    const lastIndex = nextBlocks.length - 1

    if (!nextOptions.enabled || !nextOptions.active || nextBlocks.length === 0 || phase.value === 'finalized') {
      return -1
    }

    if (resolvedRevealed < 0 || resolvedRevealed > lastIndex) {
      return -1
    }

    return lastIndex
  })

  const getBlockState = (index: number): TrMarkdownStreamBlockState => {
    const nextOptions = toValue(options)
    const resolvedRevealed = resolvedRevealedCount.value

    if (!nextOptions.enabled) {
      return 'revealed'
    }

    if (phase.value === 'finalized') {
      return 'revealed'
    }

    if (index < resolvedRevealed) {
      return 'revealed'
    }

    if (index === animatingIndex.value) {
      return 'animating'
    }

    if (index === streamingIndex.value) {
      return 'streaming'
    }

    if (activeIndex.value >= 0 && index > activeIndex.value) {
      return 'queued'
    }

    return 'revealed'
  }

  const items = computed(() => {
    return toValue(blocks).map((block, index) => ({
      block,
      index,
      state: getBlockState(index),
    }))
  })

  const queueLength = computed(() => {
    const nextBlocks = toValue(blocks)
    const lastIndex = nextBlocks.length - 1
    const currentActiveIndex = activeIndex.value

    if (currentActiveIndex < 0 || lastIndex < 0) {
      return 0
    }

    if (streamingIndex.value >= 0) {
      return Math.max(0, streamingIndex.value - currentActiveIndex - 1)
    }

    return Math.max(0, nextBlocks.length - currentActiveIndex - 1)
  })

  const pendingCount = computed(() => {
    const nextBlocks = toValue(blocks)

    if (!toValue(options).enabled) {
      return 0
    }

    return Math.max(0, nextBlocks.length - resolvedRevealedCount.value)
  })

  watch(
    [
      activeIndex,
      queueLength,
      blockCount,
      () => toValue(blocks),
      () => toValue(options).preset,
      () => toValue(options).resetRevision,
    ],
    ([nextActiveIndex, nextQueueLength, nextBlockCount, nextBlocks, nextPreset, nextResetRevision]) => {
      const preset = getStreamAnimationPresetConfig(nextPreset)

      if (nextActiveIndex < 0 || nextActiveIndex >= nextBlockCount) {
        if (phase.value === 'idle' || nextBlockCount === 0) {
          charDelay.value = preset.baseDelay
          frozenDelayToken.value = ''
        }

        return
      }

      const activeBlock = nextBlocks[nextActiveIndex]
      const delayToken = `${nextPreset}:${nextResetRevision}:${activeBlock?.key || nextActiveIndex}`

      if (frozenDelayToken.value === delayToken) {
        return
      }

      const activeCharCount = countTextGraphemes(activeBlock?.animationText || '')

      charDelay.value = computeStreamCharDelay(nextQueueLength, activeCharCount, preset)
      frozenDelayToken.value = delayToken
    },
    {
      immediate: true,
    },
  )

  const snapshot = computed<TrMarkdownStreamSchedulerSnapshot>(() => ({
    activeIndex: activeIndex.value,
    animatingIndex: animatingIndex.value,
    streamingIndex: streamingIndex.value,
    queueLength: queueLength.value,
    blockCount: blockCount.value,
    charDelay: charDelay.value,
    fadeDuration: fadeDuration.value,
    settleHoldMs: settleHoldMs.value,
  }))

  watch(
    [phase, activeIndex, animatingIndex, streamingIndex, queueLength, blockCount],
    ([nextPhase, nextActiveIndex, nextAnimatingIndex, nextStreamingIndex, nextQueueLength, nextBlockCount]) => {
      const queueSignature = [
        nextPhase,
        nextActiveIndex,
        nextAnimatingIndex,
        nextStreamingIndex,
        nextQueueLength,
        nextBlockCount,
      ].join(':')

      if (queueSignature === previousQueueSignature) {
        return
      }

      toValue(profiler)?.recordQueueTransition({
        activeIndex: nextActiveIndex,
        animatingIndex: nextAnimatingIndex,
        blockCount: nextBlockCount,
        fromPhase: previousProfilerPhase,
        phase: nextPhase,
        queueLength: nextQueueLength,
        streamingIndex: nextStreamingIndex,
      })

      previousProfilerPhase = nextPhase
      previousQueueSignature = queueSignature
    },
    {
      immediate: true,
    },
  )

  const onBlockSettled = (blockKey: string) => {
    const nextBlocks = toValue(blocks)
    const nextOptions = toValue(options)
    const resolvedActiveIndex = activeIndex.value
    const activeBlock = resolvedActiveIndex >= 0 ? nextBlocks[resolvedActiveIndex] : undefined

    if (!activeBlock || activeBlock.key !== blockKey) {
      return
    }

    if (nextOptions.active && resolvedActiveIndex === nextBlocks.length - 1) {
      return
    }

    revealedCount.value = Math.min(nextBlocks.length, Math.max(resolvedRevealedCount.value, resolvedActiveIndex + 1))

    if (!nextOptions.active && revealedCount.value >= nextBlocks.length) {
      enterSettling()
      scheduleFinalize()
    }
  }

  return {
    items,
    activeIndex,
    animatingIndex,
    streamingIndex,
    queueLength,
    blockCount,
    charDelay,
    fadeDuration,
    settleHoldMs,
    snapshot,
    phase,
    revealedCount: resolvedRevealedCount,
    pendingCount,
    rewriteCount,
    onBlockSettled,
  }
}
