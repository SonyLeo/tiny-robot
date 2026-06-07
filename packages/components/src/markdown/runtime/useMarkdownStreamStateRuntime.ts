import { computed, watch } from 'vue'
import type { TrMarkdownProps } from '../index.type'
import { createTrMarkdownStreamProfiler, resolveTrMarkdownStreamProfilerOptions } from '../stream/streamProfiler'
import { resolveStreamingConfig, useMarkdownStreamState } from '../stream/useMarkdownStreamState'

export const useMarkdownStreamStateRuntime = (props: Readonly<TrMarkdownProps>) => {
  const streamingConfig = computed(() => resolveStreamingConfig(props.streaming))
  const streamProfilerOptions = computed(() => resolveTrMarkdownStreamProfilerOptions(streamingConfig.value.profile))
  const streamProfiler = createTrMarkdownStreamProfiler(streamProfilerOptions)
  const streamProfilerSnapshot = computed(() => streamProfiler.snapshot.value)
  const streamState = useMarkdownStreamState(() => props.content || '', streamingConfig)
  const animatedStreamingEnabled = computed(
    () => streamingConfig.value.enabled && streamingConfig.value.mode === 'animated',
  )

  let previousProfilerContent = ''

  watch(
    () => props.content || '',
    (nextContent) => {
      const updateKind = !previousProfilerContent
        ? 'init'
        : nextContent.startsWith(previousProfilerContent)
          ? 'append'
          : 'rewrite'

      streamProfiler.recordInput({
        appendedChars: updateKind === 'append' ? nextContent.length - previousProfilerContent.length : 0,
        contentLength: nextContent.length,
        updateKind,
      })
      previousProfilerContent = nextContent
    },
    {
      immediate: true,
    },
  )

  return {
    animatedStreamingEnabled,
    streamProfiler,
    streamProfilerSnapshot,
    streamState,
    streamingConfig,
  }
}
