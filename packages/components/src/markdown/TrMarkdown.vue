<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { provideMarkdownContext } from './context'
import type { TrMarkdownProps, TrMarkdownRenderNode } from './index.type'
import { markdownItAdapter } from './parser/markdownItAdapter'
import NodeRenderer from './NodeRenderer'
import StreamBlockRenderer from './components/stream/StreamBlockRenderer.vue'
import StreamTail from './components/stream/StreamTail.vue'
import { resolveStreamingConfig, useMarkdownStreamState } from './stream/useMarkdownStreamState'
import { createTrMarkdownStreamProfiler, resolveTrMarkdownStreamProfilerOptions } from './stream/streamProfiler'
import { useStreamBlockDiff } from './stream/useStreamBlockDiff'
import { useStreamRevealQueue } from './stream/useStreamRevealQueue'

const defaultCodeConfig = {
  copyable: true,
  showLanguage: true,
  inlineColorPreview: true,
  blockMode: 'overlay',
  defaultExpand: true,
  highlight: {
    enabled: true,
    engine: 'highlightjs',
    enableTransformer: false,
  },
} as const

const props = withDefaults(defineProps<TrMarkdownProps>(), {
  content: '',
  variant: 'default',
  parser: () => markdownItAdapter,
  parserOptions: () => ({
    html: false,
    linkify: true,
    typographer: false,
    breaks: false,
  }),
  features: () => ({
    html: false,
  }),
  code: () => ({
    copyable: true,
    showLanguage: true,
    inlineColorPreview: true,
    blockMode: 'overlay',
    defaultExpand: true,
    highlight: {
      enabled: true,
      engine: 'highlightjs',
      enableTransformer: false,
    },
  }),
  link: () => ({
    target: '_blank',
    rel: 'noopener noreferrer',
  }),
  components: () => ({}),
})

const resolvedCode = computed(() => ({
  ...defaultCodeConfig,
  ...props.code,
  highlight: {
    ...defaultCodeConfig.highlight,
    ...props.code?.highlight,
  },
}))

provideMarkdownContext({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  components: props.components,
})

const nodes = ref<TrMarkdownRenderNode[]>([])
const parsedStableContent = ref('')
const parserOptionsKey = computed(() => JSON.stringify(props.parserOptions || {}))
const featuresKey = computed(() => JSON.stringify(props.features || {}))
const streamingConfig = computed(() => resolveStreamingConfig(props.streaming))
const streamProfilerOptions = computed(() => resolveTrMarkdownStreamProfilerOptions(streamingConfig.value.profile))
const streamProfiler = createTrMarkdownStreamProfiler(streamProfilerOptions)
const streamProfilerSnapshot = computed(() => streamProfiler.snapshot.value)
const streamState = useMarkdownStreamState(() => props.content || '', streamingConfig)
const animatedStreamingEnabled = computed(
  () => streamingConfig.value.enabled && streamingConfig.value.mode === 'animated',
)
const markdownContext = computed(() => ({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  components: props.components,
}))
const streamBlockDiff = useStreamBlockDiff(
  () => nodes.value,
  () => parsedStableContent.value,
  () => streamProfiler,
)
const streamRevealQueue = useStreamRevealQueue(
  () => streamBlockDiff.value.blocks,
  () => ({
    enabled: animatedStreamingEnabled.value,
    active: streamState.value.active,
    resetRevision: streamBlockDiff.value.resetRevision,
    preset: streamingConfig.value.preset,
  }),
  () => streamProfiler,
)
const streamQueueItems = computed(() => streamRevealQueue.items.value)
const streamQueueLength = computed(() => streamRevealQueue.queueLength.value)
const streamSchedulerPhase = computed(() => (animatedStreamingEnabled.value ? streamRevealQueue.phase.value : 'idle'))
const streamRevealedCount = computed(() => streamRevealQueue.revealedCount.value)
const streamPendingCount = computed(() => streamRevealQueue.pendingCount.value)
const streamResetCount = computed(() => streamRevealQueue.rewriteCount.value)
const streamResetRevision = computed(() => streamBlockDiff.value.resetRevision)
const streamingPreset = computed(() => streamingConfig.value.preset)
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
  if (!streamingConfig.value.enabled) {
    return 'idle'
  }

  if (animatedStreamingEnabled.value) {
    if (streamState.value.active) {
      return 'streaming'
    }

    if (streamSchedulerPhase.value === 'settling') {
      return 'settling'
    }

    if (streamSchedulerPhase.value === 'finalized') {
      return 'finalized'
    }
  }

  if (streamState.value.active) {
    return 'streaming'
  }

  return 'finalized'
})
const streamParseCount = ref(0)
let parseRequestId = 0
let previousProfilerContent = ''
let rootCommitStartedAt = 0
let rootCommitSeen = false

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

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

const parseMarkdown = async () => {
  const requestId = ++parseRequestId
  const source = streamState.value.stableContent
  const parseStart = typeof performance === 'undefined' ? Date.now() : performance.now()
  const parsedNodes = await props.parser.parse(source, {
    ...props.parserOptions,
    html: props.features?.html || props.parserOptions?.html,
  })

  if (requestId !== parseRequestId) {
    return
  }

  nodes.value = parsedNodes
  parsedStableContent.value = source
  streamParseCount.value += 1
  streamProfiler.recordCalculation({
    durationMs: (typeof performance === 'undefined' ? Date.now() : performance.now()) - parseStart,
    itemCount: parsedNodes.length,
    name: 'parse',
    textLength: source.length,
  })
}

watch([() => streamState.value.stableContent, () => props.parser, parserOptionsKey, featuresKey], parseMarkdown, {
  immediate: true,
})

const rootClass = computed(() => [
  `tr-markdown`,
  `tr-markdown--${props.variant}`,
  {
    'tr-markdown--streaming': streamingConfig.value.enabled,
    'tr-markdown--streaming-active': streamingConfig.value.enabled && streamingConfig.value.active,
    'tr-markdown--streaming-has-tail': streamingConfig.value.enabled && Boolean(streamState.value.tailContent),
    'tr-markdown--streaming-animated': animatedStreamingEnabled.value,
  },
])

const handleStreamBlockSettled = (blockKey: string) => {
  streamRevealQueue.onBlockSettled(blockKey)
}

watch(
  [() => nodes.value.length, () => streamPhase.value, () => parsedStableContent.value],
  () => {
    rootCommitStartedAt = getNow()
  },
  {
    immediate: true,
    flush: 'pre',
  },
)

watch(
  [() => nodes.value.length, () => streamPhase.value, () => parsedStableContent.value],
  ([blockCount, , stableContent]) => {
    streamProfiler.recordRootCommit({
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
</script>

<template>
  <div
    class="tr-markdown-root"
    :class="rootClass"
    :data-stream-state="streamPhase"
    :data-stream-mode="streamingConfig.mode"
    :data-stream-active="String(streamState.active)"
    :data-stream-scheduler-phase="streamSchedulerPhase"
    :data-stream-tail-kind="streamState.tailKind"
    :data-stream-update-kind="streamBlockDiff.updateKind"
    :data-stream-hard-reset="String(streamBlockDiff.hardReset)"
    :data-stream-skipped-char-count="streamBlockDiff.skippedCharCount"
    :data-stream-skipped-node-count="streamBlockDiff.skippedNodeCount"
    :data-stream-skipped-buckets="JSON.stringify(streamBlockDiff.skippedBuckets)"
    :data-stream-queue-length="streamQueueLength"
    :data-stream-block-count="streamBlockCount"
    :data-stream-active-index="streamActiveIndex"
    :data-stream-animating-index="streamAnimatingIndex"
    :data-stream-streaming-index="streamStreamingIndex"
    :data-stream-char-delay="streamCharDelay.toFixed(2)"
    :data-stream-fade-duration="streamFadeDuration"
    :data-stream-settle-hold-ms="streamSettleHoldMs"
    :data-stream-active-block-count="streamActiveBlockCount"
    :data-stream-revealed-count="streamRevealedCount"
    :data-stream-pending-count="streamPendingCount"
    :data-stream-rewrite-count="streamBlockDiff.rewriteCount"
    :data-stream-reset-count="streamResetCount"
    :data-stream-parse-count="streamParseCount"
    :data-stream-profiler-enabled="String(streamProfilerSnapshot.enabled)"
    :data-stream-profiler-event-count="streamProfilerSnapshot.eventCount"
    :data-stream-profiler-last-event="streamProfilerSnapshot.lastEventName"
    :data-stream-profiler-timeline="streamProfilerSnapshot.timeline.join('|')"
    :data-stream-profiler-input-count="streamProfilerSnapshot.inputCount"
    :data-stream-profiler-input-append-chars="streamProfilerSnapshot.inputAppendChars"
    :data-stream-profiler-input-rewrite-count="streamProfilerSnapshot.inputRewriteCount"
    :data-stream-profiler-parse-count="streamProfilerSnapshot.parseCount"
    :data-stream-profiler-parse-avg-ms="streamProfilerSnapshot.parseAvgMs.toFixed(2)"
    :data-stream-profiler-block-diff-count="streamProfilerSnapshot.blockDiffCount"
    :data-stream-profiler-block-diff-avg-ms="streamProfilerSnapshot.blockDiffAvgMs.toFixed(2)"
    :data-stream-profiler-queue-transition-count="streamProfilerSnapshot.queueTransitionCount"
    :data-stream-profiler-settle-count="streamProfilerSnapshot.settleCount"
    :data-stream-profiler-finalize-count="streamProfilerSnapshot.finalizeCount"
    :data-stream-profiler-animation-frame-count="streamProfilerSnapshot.animationFrameCount"
    :data-stream-profiler-reveal-frame-count="streamProfilerSnapshot.revealFrameCount"
    :data-stream-profiler-skipped-frame-count="streamProfilerSnapshot.skippedFrameCount"
    :data-stream-profiler-slow-frame-count="streamProfilerSnapshot.slowFrameCount"
    :data-stream-profiler-frame-avg-ms="streamProfilerSnapshot.frameAvgMs.toFixed(2)"
    :data-stream-profiler-frame-last-ms="streamProfilerSnapshot.frameLastMs.toFixed(2)"
    :data-stream-profiler-frame-max-ms="streamProfilerSnapshot.frameMaxMs.toFixed(2)"
    :data-stream-profiler-frame-interval-avg-ms="streamProfilerSnapshot.frameIntervalAvgMs.toFixed(2)"
    :data-stream-profiler-fps-sample-count="streamProfilerSnapshot.fpsSampleCount"
    :data-stream-profiler-fps-current="streamProfilerSnapshot.fpsCurrent.toFixed(2)"
    :data-stream-profiler-fps-avg="streamProfilerSnapshot.fpsAvg.toFixed(2)"
    :data-stream-profiler-fps-min="streamProfilerSnapshot.fpsMin.toFixed(2)"
    :data-stream-profiler-fps-max="streamProfilerSnapshot.fpsMax.toFixed(2)"
    :data-stream-profiler-fps-index="streamProfilerSnapshot.fpsIndex"
    :data-stream-profiler-max-backlog="streamProfilerSnapshot.maxBacklog"
    :data-stream-profiler-last-backlog="streamProfilerSnapshot.lastBacklog"
    :data-stream-profiler-root-commit-count="streamProfilerSnapshot.rootCommitCount"
    :data-stream-profiler-root-commit-avg-ms="streamProfilerSnapshot.rootCommitAvgMs.toFixed(2)"
    :data-stream-profiler-root-commit-last-ms="streamProfilerSnapshot.rootCommitLastMs.toFixed(2)"
    :data-stream-profiler-root-commit-max-ms="streamProfilerSnapshot.rootCommitMaxMs.toFixed(2)"
    :data-stream-profiler-root-commit-last-phase="streamProfilerSnapshot.rootCommitLastPhase"
    :data-stream-profiler-root-commit-last-block-count="streamProfilerSnapshot.rootCommitLastBlockCount"
    :data-stream-profiler-root-commit-last-text-length="streamProfilerSnapshot.rootCommitLastTextLength"
    :data-stream-profiler-root-commit-mount-count="streamProfilerSnapshot.rootCommitMountCount"
    :data-stream-profiler-root-commit-update-count="streamProfilerSnapshot.rootCommitUpdateCount"
    :data-stream-profiler-block-commit-count="streamProfilerSnapshot.blockCommitCount"
    :data-stream-profiler-block-commit-avg-ms="streamProfilerSnapshot.blockCommitAvgMs.toFixed(2)"
    :data-stream-profiler-block-commit-last-ms="streamProfilerSnapshot.blockCommitLastMs.toFixed(2)"
    :data-stream-profiler-block-commit-max-ms="streamProfilerSnapshot.blockCommitMaxMs.toFixed(2)"
    :data-stream-profiler-block-commit-last-state="streamProfilerSnapshot.blockCommitLastState"
    :data-stream-profiler-block-commit-tracked-count="streamProfilerSnapshot.trackedBlockCount"
    :data-stream-profiler-block-commit-mount-count="streamProfilerSnapshot.blockCommitMountCount"
    :data-stream-profiler-block-commit-update-count="streamProfilerSnapshot.blockCommitUpdateCount"
    :data-stream-profiler-token-schedule-count="streamProfilerSnapshot.tokenScheduleCount"
    :data-stream-profiler-token-schedule-avg-ms="streamProfilerSnapshot.tokenScheduleAvgMs.toFixed(2)"
    :data-stream-profiler-token-preserved-count="streamProfilerSnapshot.tokenPreservedCount"
    :data-stream-profiler-token-inserted-count="streamProfilerSnapshot.tokenInsertedCount"
    :data-stream-profiler-token-deleted-count="streamProfilerSnapshot.tokenDeletedCount"
    :data-stream-profiler-token-replaced-count="streamProfilerSnapshot.tokenReplacedCount"
  >
    <template v-if="animatedStreamingEnabled">
      <StreamBlockRenderer
        v-for="item in streamQueueItems"
        :key="item.block.key"
        :block="item.block"
        :block-index="item.index"
        :state="item.state"
        :context="markdownContext"
        :queue-length="streamQueueLength"
        :preset="streamingPreset"
        :profiler="streamProfiler"
        :reset-revision="streamResetRevision"
        @settled="handleStreamBlockSettled"
      />
    </template>
    <template v-else>
      <NodeRenderer
        v-for="(node, index) in nodes"
        :key="`${node.position?.charStart ?? index}:${node.type}:${node.tag || 'node'}`"
        :node="node"
        :context="markdownContext"
      />
    </template>
    <StreamTail :content="streamState.tailContent" :kind="streamState.tailKind" :show-cursor="streamState.showCursor" />
  </div>
</template>
