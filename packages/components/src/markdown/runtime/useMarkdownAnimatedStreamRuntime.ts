import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TrMarkdownRenderNode } from '../index.type'
import type { TrMarkdownStreamProfiler } from '../stream/streamProfiler'
import type { TrMarkdownResolvedStreamingConfig, TrMarkdownStreamState } from '../stream/useMarkdownStreamState'
import { useStreamBlockDiff } from '../stream/useStreamBlockDiff'
import { useStreamRevealQueue } from '../stream/useStreamRevealQueue'

interface UseMarkdownAnimatedStreamRuntimeOptions {
  animatedStreamingEnabled: MaybeRefOrGetter<boolean>
  nodes: MaybeRefOrGetter<TrMarkdownRenderNode[]>
  parsedStableContent: MaybeRefOrGetter<string>
  streamProfiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>
  streamState: MaybeRefOrGetter<TrMarkdownStreamState>
  streamingConfig: MaybeRefOrGetter<TrMarkdownResolvedStreamingConfig>
}

export const useMarkdownAnimatedStreamRuntime = (options: UseMarkdownAnimatedStreamRuntimeOptions) => {
  const streamBlockDiff = useStreamBlockDiff(
    () => toValue(options.nodes),
    () => toValue(options.parsedStableContent),
    () => toValue(options.streamProfiler),
  )

  const streamRevealQueue = useStreamRevealQueue(
    () => streamBlockDiff.value.blocks,
    () => {
      const streamingConfig = toValue(options.streamingConfig)
      const streamState = toValue(options.streamState)

      return {
        enabled: toValue(options.animatedStreamingEnabled),
        active: streamState.active,
        resetRevision: streamBlockDiff.value.resetRevision,
        preset: streamingConfig.preset,
      }
    },
    () => toValue(options.streamProfiler),
  )

  const streamQueueItems = computed(() => streamRevealQueue.items.value)
  const streamQueueLength = computed(() => streamRevealQueue.queueLength.value)
  const streamSchedulerPhase = computed(() =>
    toValue(options.animatedStreamingEnabled) ? streamRevealQueue.phase.value : 'idle',
  )
  const streamRevealedCount = computed(() => streamRevealQueue.revealedCount.value)
  const streamPendingCount = computed(() => streamRevealQueue.pendingCount.value)
  const streamResetCount = computed(() => streamRevealQueue.rewriteCount.value)
  const streamResetRevision = computed(() => streamBlockDiff.value.resetRevision)
  const streamingPreset = computed(() => toValue(options.streamingConfig).preset)
  const streamBlockCount = computed(() => streamRevealQueue.blockCount.value)
  const streamActiveIndex = computed(() => streamRevealQueue.activeIndex.value)
  const streamAnimatingIndex = computed(() => streamRevealQueue.animatingIndex.value)
  const streamStreamingIndex = computed(() => streamRevealQueue.streamingIndex.value)
  const streamCharDelay = computed(() => streamRevealQueue.charDelay.value)
  const streamFadeDuration = computed(() => streamRevealQueue.fadeDuration.value)
  const streamSettleHoldMs = computed(() => streamRevealQueue.settleHoldMs.value)
  const streamActiveBlockCount = computed(
    () => streamQueueItems.value.filter((item) => item.state === 'animating' || item.state === 'streaming').length,
  )
  const streamPhase = computed(() => {
    const streamingConfig = toValue(options.streamingConfig)
    const streamState = toValue(options.streamState)

    if (!streamingConfig.enabled) {
      return 'idle'
    }

    if (toValue(options.animatedStreamingEnabled)) {
      if (streamState.active) {
        return 'streaming'
      }

      if (streamSchedulerPhase.value === 'settling') {
        return 'settling'
      }

      if (streamSchedulerPhase.value === 'finalized') {
        return 'finalized'
      }
    }

    if (streamState.active) {
      return 'streaming'
    }

    return 'finalized'
  })

  const handleStreamBlockSettled = (blockKey: string) => {
    streamRevealQueue.onBlockSettled(blockKey)
  }

  return {
    handleStreamBlockSettled,
    streamActiveBlockCount,
    streamActiveIndex,
    streamAnimatingIndex,
    streamBlockCount,
    streamBlockDiff,
    streamCharDelay,
    streamFadeDuration,
    streamPendingCount,
    streamPhase,
    streamQueueItems,
    streamQueueLength,
    streamResetCount,
    streamResetRevision,
    streamRevealedCount,
    streamSchedulerPhase,
    streamSettleHoldMs,
    streamStreamingIndex,
    streamingPreset,
  }
}
