<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { TrMarkdown } from '@opentiny/tiny-robot'
import type {
  MarkdownDemoCase,
  MarkdownDemoControls,
  MarkdownDemoView,
  MarkdownStreamingTelemetry,
} from '../types/markdownDemo'

const props = defineProps<{
  demoCase: MarkdownDemoCase
  viewMode: MarkdownDemoView
}>()

const cardRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const previewReady = ref(!props.demoCase.deferPreview)
const controlsExpanded = ref(props.viewMode === 'internal')
let previewObserver: IntersectionObserver | null = null
let telemetryObserver: MutationObserver | null = null

const defaultVisibleControls = {
  content: true,
  variant: true,
  fontSize: true,
  headerMultiple: true,
  lineHeight: true,
  marginMultiple: true,
  copyable: false,
  showLanguage: false,
  inlineColorPreview: false,
  blockMode: false,
  highlightEngine: false,
  enableTransformer: false,
  defaultExpand: false,
}

const createControls = (demoCase: MarkdownDemoCase): MarkdownDemoControls => {
  const code = demoCase.markdownProps?.code
  const highlight = code?.highlight
  const streaming = demoCase.markdownProps?.streaming
  const streamingEnabled =
    typeof streaming === 'boolean' ? streaming : Boolean(streaming && streaming.enabled !== false)

  return {
    content: demoCase.initialContent,
    variant: demoCase.markdownProps?.variant || 'default',
    streamingActive: streamingEnabled && (typeof streaming === 'boolean' ? streaming : streaming?.active !== false),
    fontSize: 16,
    headerMultiple: 1,
    lineHeight: 1.8,
    marginMultiple: 2,
    copyable: code?.copyable !== false,
    showLanguage: code?.showLanguage !== false,
    inlineColorPreview: code?.inlineColorPreview !== false,
    blockMode: code?.blockMode || 'overlay',
    highlightEngine: highlight?.engine || 'highlightjs',
    enableTransformer: Boolean(highlight?.enableTransformer),
    defaultExpand: code?.defaultExpand !== false,
  }
}

const controls = reactive(createControls(props.demoCase))

const createStreamingTelemetry = (): MarkdownStreamingTelemetry => ({
  state: 'idle',
  schedulerPhase: 'idle',
  updateKind: 'init',
  hardReset: false,
  skippedCharCount: 0,
  skippedNodeCount: 0,
  skippedBuckets: '[]',
  queueLength: 0,
  blockCount: 0,
  activeIndex: -1,
  animatingIndex: -1,
  streamingIndex: -1,
  charDelay: 0,
  fadeDuration: 0,
  settleHoldMs: 0,
  activeBlockCount: 0,
  revealedCount: 0,
  pendingCount: 0,
  liveCharCount: 0,
  rewriteCount: 0,
  resetCount: 0,
  parseCount: 0,
  profilerEnabled: false,
  profilerEventCount: 0,
  profilerLastEvent: 'none',
  profilerTimeline: [],
  profilerInputCount: 0,
  profilerInputAppendChars: 0,
  profilerInputRewriteCount: 0,
  profilerParseCount: 0,
  profilerParseAvgMs: 0,
  profilerBlockDiffCount: 0,
  profilerBlockDiffAvgMs: 0,
  profilerQueueTransitionCount: 0,
  profilerSettleCount: 0,
  profilerFinalizeCount: 0,
  profilerAnimationFrameCount: 0,
  profilerRevealFrameCount: 0,
  profilerSkippedFrameCount: 0,
  profilerSlowFrameCount: 0,
  profilerFrameAvgMs: 0,
  profilerFrameLastMs: 0,
  profilerFrameMaxMs: 0,
  profilerFrameIntervalAvgMs: 0,
  profilerFpsSampleCount: 0,
  profilerFpsCurrent: 0,
  profilerFpsAvg: 0,
  profilerFpsMin: 0,
  profilerFpsMax: 0,
  profilerFpsIndex: 0,
  profilerMaxBacklog: 0,
  profilerLastBacklog: 0,
  profilerRootCommitCount: 0,
  profilerRootCommitAvgMs: 0,
  profilerRootCommitLastMs: 0,
  profilerRootCommitMaxMs: 0,
  profilerRootCommitLastPhase: 'none',
  profilerRootCommitLastBlockCount: 0,
  profilerRootCommitLastTextLength: 0,
  profilerRootCommitMountCount: 0,
  profilerRootCommitUpdateCount: 0,
  profilerBlockCommitCount: 0,
  profilerBlockCommitAvgMs: 0,
  profilerBlockCommitLastMs: 0,
  profilerBlockCommitMaxMs: 0,
  profilerBlockCommitLastState: 'none',
  profilerTrackedBlockCount: 0,
  profilerBlockCommitMountCount: 0,
  profilerBlockCommitUpdateCount: 0,
  profilerTokenScheduleCount: 0,
  profilerTokenScheduleAvgMs: 0,
  profilerTokenPreservedCount: 0,
  profilerTokenInsertedCount: 0,
  profilerTokenDeletedCount: 0,
  profilerTokenReplacedCount: 0,
})

const streamingTelemetry = reactive(createStreamingTelemetry())

const stopPreviewObserver = () => {
  previewObserver?.disconnect()
  previewObserver = null
}

const stopTelemetryObserver = () => {
  telemetryObserver?.disconnect()
  telemetryObserver = null
}

const resetStreamingTelemetry = () => {
  Object.assign(streamingTelemetry, createStreamingTelemetry())
}

const mountPreview = () => {
  previewReady.value = true
  stopPreviewObserver()
}

const setupPreviewObserver = () => {
  stopPreviewObserver()

  if (previewReady.value || !props.demoCase.deferPreview || typeof IntersectionObserver === 'undefined') {
    previewReady.value = true
    return
  }

  if (!cardRef.value) {
    return
  }

  previewObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        mountPreview()
      }
    },
    {
      rootMargin: '320px 0px',
    },
  )

  previewObserver.observe(cardRef.value)
}

const readStreamingTelemetry = () => {
  const root = previewRef.value?.querySelector<HTMLElement>('.tr-markdown-root')

  if (!root) {
    resetStreamingTelemetry()
    return
  }

  const snapshot = (() => {
    const raw = root.dataset.streamSnapshot
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return null
    }
  })()
  const profilerDebug = (() => {
    const raw = root.dataset.streamProfilerDebug
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return null
    }
  })()

  Object.assign(streamingTelemetry, {
    state: (snapshot?.phase as MarkdownStreamingTelemetry['state']) || 'idle',
    schedulerPhase: (snapshot?.schedulerPhase as MarkdownStreamingTelemetry['schedulerPhase']) || 'idle',
    updateKind: (snapshot?.updateKind as MarkdownStreamingTelemetry['updateKind']) || 'init',
    hardReset: Boolean(snapshot?.hardReset),
    skippedCharCount: Number(snapshot?.skippedCharCount || 0),
    skippedNodeCount: Number(snapshot?.skippedNodeCount || 0),
    skippedBuckets: JSON.stringify(snapshot?.skippedBuckets || []),
    queueLength: Number(snapshot?.queueLength || 0),
    blockCount: Number(snapshot?.blockCount || 0),
    activeIndex: Number(snapshot?.activeIndex || -1),
    animatingIndex: Number(snapshot?.animatingIndex || -1),
    streamingIndex: Number(snapshot?.streamingIndex || -1),
    charDelay: 0,
    fadeDuration: 0,
    settleHoldMs: 0,
    activeBlockCount: Number(snapshot?.activeBlockCount || 0),
    revealedCount: 0,
    pendingCount: Number(snapshot?.pendingCount || 0),
    liveCharCount: root.querySelectorAll('.tr-markdown__stream-char').length,
    rewriteCount: Number(snapshot?.rewriteCount || 0),
    resetCount: Number(snapshot?.resetCount || 0),
    parseCount: Number(snapshot?.parseCount || 0),
    profilerEnabled: Boolean(snapshot?.profilerEnabled),
    profilerEventCount: Number(snapshot?.profilerEventCount || 0),
    profilerLastEvent: String(profilerDebug?.lastEventName || 'none'),
    profilerTimeline: Array.isArray(profilerDebug?.timeline) ? (profilerDebug.timeline as string[]) : [],
    profilerInputCount: Number(profilerDebug?.inputCount || 0),
    profilerInputAppendChars: Number(profilerDebug?.inputAppendChars || 0),
    profilerInputRewriteCount: Number(profilerDebug?.inputRewriteCount || 0),
    profilerParseCount: Number(profilerDebug?.parseCount || 0),
    profilerParseAvgMs: Number(profilerDebug?.parseAvgMs || 0),
    profilerBlockDiffCount: Number(profilerDebug?.blockDiffCount || 0),
    profilerBlockDiffAvgMs: Number(profilerDebug?.blockDiffAvgMs || 0),
    profilerQueueTransitionCount: Number(profilerDebug?.queueTransitionCount || 0),
    profilerSettleCount: Number(profilerDebug?.settleCount || 0),
    profilerFinalizeCount: Number(profilerDebug?.finalizeCount || 0),
    profilerAnimationFrameCount: Number(profilerDebug?.animationFrameCount || 0),
    profilerRevealFrameCount: Number(profilerDebug?.revealFrameCount || 0),
    profilerSkippedFrameCount: Number(profilerDebug?.skippedFrameCount || 0),
    profilerSlowFrameCount: Number(profilerDebug?.slowFrameCount || 0),
    profilerFrameAvgMs: Number(profilerDebug?.frameAvgMs || 0),
    profilerFrameLastMs: Number(profilerDebug?.frameLastMs || 0),
    profilerFrameMaxMs: Number(profilerDebug?.frameMaxMs || 0),
    profilerFrameIntervalAvgMs: Number(profilerDebug?.frameIntervalAvgMs || 0),
    profilerFpsSampleCount: Number(profilerDebug?.fpsSampleCount || 0),
    profilerFpsCurrent: Number(profilerDebug?.fpsCurrent || 0),
    profilerFpsAvg: Number(profilerDebug?.fpsAvg || 0),
    profilerFpsMin: Number(profilerDebug?.fpsMin || 0),
    profilerFpsMax: Number(profilerDebug?.fpsMax || 0),
    profilerFpsIndex: Number(profilerDebug?.fpsIndex || 0),
    profilerMaxBacklog: Number(profilerDebug?.maxBacklog || 0),
    profilerLastBacklog: Number(profilerDebug?.lastBacklog || 0),
    profilerRootCommitCount: Number(profilerDebug?.rootCommitCount || 0),
    profilerRootCommitAvgMs: Number(profilerDebug?.rootCommitAvgMs || 0),
    profilerRootCommitLastMs: Number(profilerDebug?.rootCommitLastMs || 0),
    profilerRootCommitMaxMs: Number(profilerDebug?.rootCommitMaxMs || 0),
    profilerRootCommitLastPhase: String(profilerDebug?.rootCommitLastPhase || 'none'),
    profilerRootCommitLastBlockCount: Number(profilerDebug?.rootCommitLastBlockCount || 0),
    profilerRootCommitLastTextLength: Number(profilerDebug?.rootCommitLastTextLength || 0),
    profilerRootCommitMountCount: Number(profilerDebug?.rootCommitMountCount || 0),
    profilerRootCommitUpdateCount: Number(profilerDebug?.rootCommitUpdateCount || 0),
    profilerBlockCommitCount: Number(profilerDebug?.blockCommitCount || 0),
    profilerBlockCommitAvgMs: Number(profilerDebug?.blockCommitAvgMs || 0),
    profilerBlockCommitLastMs: Number(profilerDebug?.blockCommitLastMs || 0),
    profilerBlockCommitMaxMs: Number(profilerDebug?.blockCommitMaxMs || 0),
    profilerBlockCommitLastState: String(profilerDebug?.blockCommitLastState || 'none'),
    profilerTrackedBlockCount: Number(profilerDebug?.trackedBlockCount || 0),
    profilerBlockCommitMountCount: Number(profilerDebug?.blockCommitMountCount || 0),
    profilerBlockCommitUpdateCount: Number(profilerDebug?.blockCommitUpdateCount || 0),
    profilerTokenScheduleCount: Number(profilerDebug?.tokenScheduleCount || 0),
    profilerTokenScheduleAvgMs: Number(profilerDebug?.tokenScheduleAvgMs || 0),
    profilerTokenPreservedCount: Number(profilerDebug?.tokenPreservedCount || 0),
    profilerTokenInsertedCount: Number(profilerDebug?.tokenInsertedCount || 0),
    profilerTokenDeletedCount: Number(profilerDebug?.tokenDeletedCount || 0),
    profilerTokenReplacedCount: Number(profilerDebug?.tokenReplacedCount || 0),
  })
}

const setupTelemetryObserver = () => {
  stopTelemetryObserver()
  resetStreamingTelemetry()

  if (!previewReady.value || !previewRef.value || typeof MutationObserver === 'undefined') {
    return
  }

  telemetryObserver = new MutationObserver(() => {
    readStreamingTelemetry()
  })

  telemetryObserver.observe(previewRef.value, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  })

  readStreamingTelemetry()
}

watch(
  () => props.demoCase.id,
  async () => {
    Object.assign(controls, createControls(props.demoCase))
    previewReady.value = !props.demoCase.deferPreview
    controlsExpanded.value = props.viewMode === 'internal'
    resetStreamingTelemetry()
    await nextTick()
    setupPreviewObserver()
    setupTelemetryObserver()
  },
)

watch(
  () => props.viewMode,
  (viewMode) => {
    controlsExpanded.value = viewMode === 'internal'
  },
)

watch(previewReady, async () => {
  await nextTick()
  setupTelemetryObserver()
})

onMounted(() => {
  setupPreviewObserver()
  void nextTick().then(() => {
    setupTelemetryObserver()
  })
})

onUnmounted(() => {
  stopPreviewObserver()
  stopTelemetryObserver()
})

const visibleControls = computed(() => ({
  ...defaultVisibleControls,
  ...props.demoCase.controls,
}))

const hasControlsContent = computed(() => {
  return (
    Boolean(props.demoCase.controlsComponent) ||
    visibleControls.value.content ||
    visibleControls.value.variant ||
    visibleControls.value.fontSize ||
    visibleControls.value.headerMultiple ||
    visibleControls.value.lineHeight ||
    visibleControls.value.marginMultiple ||
    visibleControls.value.blockMode ||
    visibleControls.value.highlightEngine ||
    visibleControls.value.copyable ||
    visibleControls.value.showLanguage ||
    visibleControls.value.inlineColorPreview ||
    visibleControls.value.enableTransformer ||
    visibleControls.value.defaultExpand
  )
})

const controlsSummary = computed(() => {
  if (props.viewMode === 'internal') {
    return 'Regression controls'
  }

  if (hasStreamingTelemetry.value) {
    return 'Playground and telemetry'
  }

  return 'Open playground controls'
})

const hasStreamingTelemetry = computed(() => {
  const streaming = props.demoCase.markdownProps?.streaming
  return typeof streaming === 'boolean' ? streaming : Boolean(streaming && streaming.enabled !== false)
})

const showStreamingTelemetry = computed(() => {
  return hasStreamingTelemetry.value && props.demoCase.showStreamingTelemetry !== false
})

const isPublicView = computed(() => props.viewMode === 'public')

const codeFontSize = computed(() => `${(controls.fontSize * 0.85).toFixed(2)}px`)

const markdownStyle = computed(() => ({
  '--tr-markdown-font-size': `${controls.fontSize}px`,
  '--tr-markdown-line-height': `${controls.lineHeight}`,
  '--tr-markdown-heading-scale': `${controls.headerMultiple}`,
  '--tr-markdown-spacing-scale': `${controls.marginMultiple}`,
  '--tr-markdown-code-font-size': codeFontSize.value,
  '--tr-markdown-code-line-height': `${controls.lineHeight}`,
}))

const markdownProps = computed(() => {
  const baseProps = props.demoCase.markdownProps || {}
  const baseCode = baseProps.code || {}
  const baseHighlight = baseCode.highlight || {}
  const baseStreaming = baseProps.streaming
  const resolvedStreaming =
    typeof baseStreaming === 'boolean'
      ? baseStreaming
        ? {
            enabled: true,
            active: controls.streamingActive,
          }
        : false
      : baseStreaming
        ? {
            ...baseStreaming,
            active: controls.streamingActive,
          }
        : undefined

  return {
    ...baseProps,
    variant: controls.variant,
    streaming: resolvedStreaming,
    code: {
      ...baseCode,
      blockMode: controls.blockMode,
      copyable: controls.copyable,
      defaultExpand: controls.defaultExpand,
      inlineColorPreview: controls.inlineColorPreview,
      showLanguage: controls.showLanguage,
      highlight: {
        ...baseHighlight,
        enabled: baseHighlight.enabled !== false,
        enableTransformer: controls.enableTransformer,
        engine: controls.highlightEngine,
      },
    },
  }
})

const updateNumber = <K extends 'fontSize' | 'headerMultiple' | 'lineHeight' | 'marginMultiple'>(
  key: K,
  value: string | number,
) => {
  controls[key] = Number(value) as (typeof controls)[K]
}

const setContent = (content: string) => {
  controls.content = content
}

const setStreamingActive = (active: boolean) => {
  controls.streamingActive = active
}
</script>

<template>
  <section ref="cardRef" class="demo-card">
    <div class="demo-card__header">
      <span class="demo-card__dot demo-card__dot--red"></span>
      <span class="demo-card__dot demo-card__dot--yellow"></span>
      <span class="demo-card__dot demo-card__dot--green"></span>
    </div>

    <div class="demo-card__body" :class="{ 'demo-card__body--stacked': isPublicView }">
      <div ref="previewRef" class="demo-card__preview">
        <component
          :is="demoCase.previewComponent"
          v-if="previewReady && demoCase.previewComponent"
          :controls="controls"
          :markdown-props="markdownProps"
          :markdown-style="markdownStyle"
        />
        <TrMarkdown
          v-else-if="previewReady"
          :content="controls.content"
          :style="markdownStyle"
          v-bind="markdownProps"
        />
        <div v-else class="demo-card__preview-placeholder">
          <p>Preview will mount when this case enters the viewport.</p>
        </div>
      </div>

      <aside
        v-if="hasControlsContent"
        class="demo-card__controls"
        :class="{
          'demo-card__controls--collapsed': !controlsExpanded,
          'demo-card__controls--stacked': isPublicView,
        }"
      >
        <button type="button" class="demo-card__controls-toggle" @click="controlsExpanded = !controlsExpanded">
          <span>{{ controlsSummary }}</span>
          <strong>{{ controlsExpanded ? 'Hide' : 'Show' }}</strong>
        </button>

        <div v-if="controlsExpanded" class="demo-card__controls-body">
          <component
            :is="demoCase.controlsComponent"
            v-if="demoCase.controlsComponent"
            :controls="controls"
            :demo-case="demoCase"
            :markdown-props="markdownProps"
            :markdown-style="markdownStyle"
            :set-content="setContent"
            :set-streaming-active="setStreamingActive"
            :streaming-telemetry="showStreamingTelemetry ? streamingTelemetry : undefined"
          />

          <label v-if="visibleControls.content" class="control-group control-group--textarea">
            <span>children</span>
            <textarea v-model="controls.content" />
          </label>

          <label v-if="visibleControls.variant" class="control-group">
            <span>variant</span>
            <select v-model="controls.variant">
              <option value="default">default</option>
              <option value="bubble">bubble</option>
              <option value="article">article</option>
            </select>
          </label>

          <label v-if="visibleControls.fontSize" class="control-group">
            <span>fontSize</span>
            <div class="control-row">
              <input
                :value="controls.fontSize"
                type="range"
                min="12"
                max="28"
                step="1"
                @input="updateNumber('fontSize', ($event.target as HTMLInputElement).value)"
              />
              <output>{{ controls.fontSize }}</output>
            </div>
          </label>

          <label v-if="visibleControls.headerMultiple" class="control-group">
            <span>headerMultiple</span>
            <div class="control-row">
              <input
                :value="controls.headerMultiple"
                type="range"
                min="0"
                max="3"
                step="0.1"
                @input="updateNumber('headerMultiple', ($event.target as HTMLInputElement).value)"
              />
              <output>{{ controls.headerMultiple.toFixed(1) }}</output>
            </div>
          </label>

          <label v-if="visibleControls.lineHeight" class="control-group">
            <span>lineHeight</span>
            <div class="control-row">
              <input
                :value="controls.lineHeight"
                type="range"
                min="1"
                max="3"
                step="0.1"
                @input="updateNumber('lineHeight', ($event.target as HTMLInputElement).value)"
              />
              <output>{{ controls.lineHeight.toFixed(1) }}</output>
            </div>
          </label>

          <label v-if="visibleControls.marginMultiple" class="control-group">
            <span>marginMultiple</span>
            <div class="control-row">
              <input
                :value="controls.marginMultiple"
                type="range"
                min="0"
                max="4"
                step="0.1"
                @input="updateNumber('marginMultiple', ($event.target as HTMLInputElement).value)"
              />
              <output>{{ controls.marginMultiple.toFixed(1) }}</output>
            </div>
          </label>

          <label v-if="visibleControls.blockMode" class="control-group">
            <span>blockMode</span>
            <select v-model="controls.blockMode">
              <option value="overlay">overlay</option>
              <option value="full">full</option>
            </select>
          </label>

          <label v-if="visibleControls.highlightEngine" class="control-group">
            <span>highlightEngine</span>
            <select v-model="controls.highlightEngine">
              <option value="highlightjs">highlightjs</option>
              <option value="shiki">shiki</option>
            </select>
          </label>

          <label
            v-if="
              visibleControls.copyable ||
              visibleControls.showLanguage ||
              visibleControls.inlineColorPreview ||
              visibleControls.enableTransformer ||
              visibleControls.defaultExpand
            "
            class="control-group"
          >
            <span>code options</span>
            <div class="control-stack">
              <label v-if="visibleControls.copyable" class="control-check">
                <input v-model="controls.copyable" type="checkbox" />
                <span>copyable</span>
              </label>
              <label v-if="visibleControls.showLanguage" class="control-check">
                <input v-model="controls.showLanguage" type="checkbox" />
                <span>showLanguage</span>
              </label>
              <label v-if="visibleControls.inlineColorPreview" class="control-check">
                <input v-model="controls.inlineColorPreview" type="checkbox" />
                <span>inlineColorPreview</span>
              </label>
              <label v-if="visibleControls.enableTransformer" class="control-check">
                <input v-model="controls.enableTransformer" type="checkbox" />
                <span>enableTransformer</span>
              </label>
              <label v-if="visibleControls.defaultExpand" class="control-check">
                <input v-model="controls.defaultExpand" type="checkbox" />
                <span>defaultExpand</span>
              </label>
            </div>
          </label>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.demo-card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
  box-shadow: var(--tr-shadow-sm);
}

.demo-card__header {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
}

.demo-card__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.demo-card__dot--red {
  background: #ff5f57;
}

.demo-card__dot--yellow {
  background: #ffbd2e;
}

.demo-card__dot--green {
  background: #28c840;
}

.demo-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  min-height: 560px;
}

.demo-card__body--stacked {
  grid-template-columns: 1fr;
  min-height: auto;
}

.demo-card__preview {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 42px 36px;
  border-right: 1px solid color-mix(in srgb, var(--tr-border-color-default) 16%, transparent);
  min-width: 0;
  overflow: auto;
}

.demo-card__body--stacked .demo-card__preview {
  border-right: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--tr-border-color-default) 16%, transparent);
}

.demo-card__preview-placeholder {
  display: grid;
  place-items: center;
  min-height: 260px;
  border: 1px dashed color-mix(in srgb, var(--tr-border-color-default) 28%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, transparent);
  color: var(--tr-text-secondary);
  text-align: center;
}

.demo-card__preview-placeholder p {
  max-width: 260px;
  margin: 0;
  line-height: 1.6;
}

.demo-card__controls {
  display: grid;
  gap: 12px;
  align-content: start;
  max-height: 720px;
  padding: 18px 16px;
  overflow: auto;
  background: color-mix(in srgb, var(--tr-container-bg-default) 68%, var(--tr-page-bg-default) 32%);
}

.demo-card__controls--stacked {
  max-height: none;
  padding: 14px 16px 16px;
}

.demo-card__controls--collapsed {
  align-content: start;
}

.demo-card__controls-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 24%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 84%, transparent);
  color: var(--tr-text-primary);
  font: inherit;
  cursor: pointer;
}

.demo-card__controls-toggle span,
.demo-card__controls-toggle strong {
  font-size: 12px;
}

.demo-card__controls-toggle span {
  color: var(--tr-text-secondary);
  font-weight: 600;
}

.demo-card__controls-toggle strong {
  color: var(--tr-text-primary);
  font-weight: 700;
}

.demo-card__controls-body {
  display: grid;
  gap: 12px;
}

.control-group {
  display: grid;
  gap: 8px;
}

.control-group span {
  font-size: 12px;
  font-weight: 600;
  color: var(--tr-text-secondary);
}

.control-group textarea,
.control-group select {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 32%, transparent);
  border-radius: 12px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font: inherit;
}

.control-group textarea {
  min-height: 140px;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.55;
}

.control-group select {
  height: 38px;
  padding: 0 12px;
}

.control-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px;
  gap: 10px;
  align-items: center;
}

.control-row input[type='range'] {
  width: 100%;
}

.control-row output {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 30px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 76%, transparent);
  color: var(--tr-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.control-stack {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 28%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, transparent);
}

.control-check {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--tr-text-primary);
}

.control-check input {
  margin: 0;
}

.control-check span {
  font-size: 13px;
  font-weight: 500;
  color: inherit;
}

@media (max-width: 1080px) {
  .demo-card__body {
    grid-template-columns: 1fr;
  }

  .demo-card__preview {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--tr-border-color-default) 16%, transparent);
  }
}
</style>
