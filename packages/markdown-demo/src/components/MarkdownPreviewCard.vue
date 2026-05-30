<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import TrMarkdown from '../../../components/src/markdown'
import type { MarkdownDemoCase, MarkdownDemoControls } from '../types/markdownDemo'

const props = defineProps<{
  demoCase: MarkdownDemoCase
}>()

const cardRef = ref<HTMLElement | null>(null)
const previewReady = ref(!props.demoCase.deferPreview)
let previewObserver: IntersectionObserver | null = null

const defaultVisibleControls = {
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

  return {
    content: demoCase.initialContent,
    variant: demoCase.markdownProps?.variant || 'default',
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

const stopPreviewObserver = () => {
  previewObserver?.disconnect()
  previewObserver = null
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

watch(
  () => props.demoCase.id,
  async () => {
    Object.assign(controls, createControls(props.demoCase))
    previewReady.value = !props.demoCase.deferPreview
    await nextTick()
    setupPreviewObserver()
  },
)

onMounted(() => {
  setupPreviewObserver()
})

onUnmounted(() => {
  stopPreviewObserver()
})

const visibleControls = computed(() => ({
  ...defaultVisibleControls,
  ...props.demoCase.controls,
}))

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

  return {
    ...baseProps,
    variant: controls.variant,
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
</script>

<template>
  <section ref="cardRef" class="demo-card">
    <div class="demo-card__header">
      <span class="demo-card__dot demo-card__dot--red"></span>
      <span class="demo-card__dot demo-card__dot--yellow"></span>
      <span class="demo-card__dot demo-card__dot--green"></span>
    </div>

    <div class="demo-card__body">
      <div class="demo-card__preview">
        <TrMarkdown v-if="previewReady" :content="controls.content" :style="markdownStyle" v-bind="markdownProps" />
        <div v-else class="demo-card__preview-placeholder">
          <p>Preview will mount when this case enters the viewport.</p>
        </div>
      </div>

      <aside class="demo-card__controls">
        <label class="control-group control-group--textarea">
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
      </aside>
    </div>
  </section>
</template>

<style scoped>
.demo-card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 20%, transparent);
  border-radius: 24px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 92%, transparent);
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
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 520px;
}

.demo-card__preview {
  padding: 24px;
  border-right: 1px solid color-mix(in srgb, var(--tr-border-color-default) 16%, transparent);
  min-width: 0;
  overflow: auto;
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
  gap: 14px;
  align-content: start;
  padding: 22px 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 80%, var(--tr-page-bg-default) 20%);
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
