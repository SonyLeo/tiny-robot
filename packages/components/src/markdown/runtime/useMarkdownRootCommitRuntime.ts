import { toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TrMarkdownStreamProfiler } from '../stream/streamProfiler'

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export const useMarkdownRootCommitRuntime = (options: {
  nodesLength: MaybeRefOrGetter<number>
  parsedStableContent: MaybeRefOrGetter<string>
  streamPhase: MaybeRefOrGetter<string>
  streamProfiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>
}) => {
  let rootCommitStartedAt = 0
  let rootCommitSeen = false

  watch(
    [
      () => toValue(options.nodesLength),
      () => toValue(options.streamPhase),
      () => toValue(options.parsedStableContent),
    ],
    () => {
      rootCommitStartedAt = getNow()
    },
    {
      immediate: true,
      flush: 'pre',
    },
  )

  watch(
    [
      () => toValue(options.nodesLength),
      () => toValue(options.streamPhase),
      () => toValue(options.parsedStableContent),
    ],
    ([blockCount, , stableContent]) => {
      toValue(options.streamProfiler)?.recordRootCommit({
        blockCount,
        durationMs: Math.max(0, getNow() - rootCommitStartedAt),
        phase: rootCommitSeen ? 'update' : 'mount',
        textLength: stableContent.length,
      })
      rootCommitSeen = true
    },
    {
      immediate: true,
      flush: 'post',
    },
  )
}
