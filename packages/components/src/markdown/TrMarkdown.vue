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
  streaming: {
    active: streamState.value.active,
    enabled: streamingConfig.value.enabled,
  },
  citations: props.citations,
  components: props.components,
  componentProps: props.componentProps,
  renderOptions: props.renderOptions,
  imageGalleryIndexMap: imageGalleryEnabled.value ? imageGallery.indexMap.value : undefined,
  openImageGallery: imageGalleryEnabled.value ? imageGallery.openAt : undefined,
}))
provideMarkdownContext(markdownContext)
const {
  handleStreamBlockSettled,
  streamActiveBlockCount,
  streamActiveIndex,
  streamAnimatingIndex,
  streamBlockCount,
  streamBlockDiff,
  streamPendingCount,
  streamPhase,
  streamQueueItems,
  streamQueueLength,
  streamResetCount,
  streamResetRevision,
  streamSchedulerPhase,
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

const streamSnapshot = computed(() => ({
  active: streamState.value.active,
  activeBlockCount: streamActiveBlockCount.value,
  activeIndex: streamActiveIndex.value,
  animatingIndex: streamAnimatingIndex.value,
  blockCount: streamBlockCount.value,
  hardReset: streamBlockDiff.value.hardReset,
  mode: streamingConfig.value.mode,
  parseCount: streamParseCount.value,
  pendingCount: streamPendingCount.value,
  phase: streamPhase.value,
  profilerEnabled: streamProfilerSnapshot.value.enabled,
  profilerEventCount: streamProfilerSnapshot.value.eventCount,
  queueLength: streamQueueLength.value,
  resetCount: streamResetCount.value,
  rewriteCount: streamBlockDiff.value.rewriteCount,
  schedulerPhase: streamSchedulerPhase.value,
  skippedBuckets: streamBlockDiff.value.skippedBuckets,
  skippedCharCount: streamBlockDiff.value.skippedCharCount,
  skippedNodeCount: streamBlockDiff.value.skippedNodeCount,
  streamingIndex: streamStreamingIndex.value,
  tailKind: streamState.value.tailKind,
  updateKind: streamBlockDiff.value.updateKind,
}))
const streamProfilerDebug = computed(() =>
  streamProfilerSnapshot.value.enabled ? streamProfilerSnapshot.value : undefined,
)

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
    :data-stream-active-block-count="streamActiveBlockCount"
    :data-stream-pending-count="streamPendingCount"
    :data-stream-rewrite-count="streamBlockDiff.rewriteCount"
    :data-stream-reset-count="streamResetCount"
    :data-stream-parse-count="streamParseCount"
    :data-stream-profiler-enabled="String(streamProfilerSnapshot.enabled)"
    :data-stream-profiler-event-count="streamProfilerSnapshot.eventCount"
    :data-stream-snapshot="JSON.stringify(streamSnapshot)"
    :data-stream-profiler-debug="streamProfilerDebug ? JSON.stringify(streamProfilerDebug) : undefined"
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
