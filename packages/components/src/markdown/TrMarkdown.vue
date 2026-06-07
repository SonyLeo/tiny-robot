<script setup lang="ts">
import { computed } from 'vue'
import { provideMarkdownContext } from './context'
import type { TrMarkdownProps } from './index.type'
import { markdownItAdapter } from './parser/markdownItAdapter'
import NodeRenderer from './NodeRenderer'
import MarkdownImageGalleryPreview from './components/image-gallery/MarkdownImageGalleryPreview.vue'
import StreamBlockRenderer from './components/stream/StreamBlockRenderer.vue'
import StreamTail from './components/stream/StreamTail.vue'
import { useMarkdownAnimatedStreamRuntime } from './runtime/useMarkdownAnimatedStreamRuntime'
import { useMarkdownImageGalleryRuntime } from './runtime/useMarkdownImageGalleryRuntime'
import { useMarkdownParseRuntime } from './runtime/useMarkdownParseRuntime'
import { useMarkdownRootCommitRuntime } from './runtime/useMarkdownRootCommitRuntime'
import { useMarkdownStreamStateRuntime } from './runtime/useMarkdownStreamStateRuntime'

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
  citations: () => [],
  parser: () => markdownItAdapter,
  parserOptions: () => ({
    html: false,
    linkify: true,
    typographer: false,
    breaks: false,
  }),
  renderOptions: () => ({}),
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
  componentProps: () => ({}),
})

const resolvedCode = computed(() => ({
  ...defaultCodeConfig,
  ...props.code,
  highlight: {
    ...defaultCodeConfig.highlight,
    ...props.code?.highlight,
  },
}))

const { animatedStreamingEnabled, streamProfiler, streamProfilerSnapshot, streamState, streamingConfig } =
  useMarkdownStreamStateRuntime(props)
const { nodes, parsedStableContent, streamParseCount } = useMarkdownParseRuntime(
  props,
  () => streamState.value.stableContent,
  () => streamProfiler,
)
const {
  imageGallery,
  imageGalleryCloseOnEscape,
  imageGalleryCurrentIndex,
  imageGalleryEnabled,
  imageGalleryItems,
  imageGalleryShowCaption,
  showImageGalleryPreview,
} = useMarkdownImageGalleryRuntime(
  () => nodes.value,
  () => props.features?.imageGallery,
)
const markdownContext = computed(() => ({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  citations: props.citations,
  components: props.components,
  componentProps: props.componentProps,
  renderOptions: props.renderOptions,
  imageGalleryIndexMap: imageGalleryEnabled.value ? imageGallery.indexMap.value : undefined,
  openImageGallery: imageGalleryEnabled.value ? imageGallery.openAt : undefined,
}))
provideMarkdownContext({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  citations: props.citations,
  components: props.components,
  componentProps: props.componentProps,
  renderOptions: props.renderOptions,
  imageGalleryIndexMap: imageGalleryEnabled.value ? imageGallery.indexMap.value : undefined,
  openImageGallery: imageGalleryEnabled.value ? imageGallery.openAt : undefined,
})
const {
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
} = useMarkdownAnimatedStreamRuntime({
  animatedStreamingEnabled,
  nodes: () => nodes.value,
  parsedStableContent: () => parsedStableContent.value,
  streamProfiler: () => streamProfiler,
  streamState: () => streamState.value,
  streamingConfig: () => streamingConfig.value,
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

useMarkdownRootCommitRuntime({
  nodesLength: () => nodes.value.length,
  parsedStableContent: () => parsedStableContent.value,
  streamPhase: () => streamPhase.value,
  streamProfiler: () => streamProfiler,
})
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
    :data-image-gallery-enabled="String(imageGalleryEnabled)"
    :data-image-gallery-count="imageGalleryItems.length"
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
    <StreamTail
      :content="streamState.tailContent"
      :kind="streamState.tailKind"
      :html-preview="props.features?.htmlPreview"
      :show-cursor="streamState.showCursor"
    />
    <MarkdownImageGalleryPreview
      v-if="showImageGalleryPreview"
      v-model:current-index="imageGalleryCurrentIndex"
      :images="imageGalleryItems"
      :show-caption="imageGalleryShowCaption"
      :close-on-escape="imageGalleryCloseOnEscape"
      @close="imageGallery.close"
    />
  </div>
</template>
