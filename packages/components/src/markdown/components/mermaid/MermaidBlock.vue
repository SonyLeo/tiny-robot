<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useDefaultModeState } from '../../composables/useDefaultModeState'
import CopyButton from '../code-block/CopyButton.vue'
import MarkdownFloatingToolbar from '../shared/MarkdownFloatingToolbar.vue'
import MarkdownLoadingSurface from '../shared/MarkdownLoadingSurface.vue'
import PreviewSourceToggle from '../shared/PreviewSourceToggle.vue'
import MarkdownSourceBlock from '../shared/MarkdownSourceBlock.vue'
import MarkdownStatusSurface from '../shared/MarkdownStatusSurface.vue'
import { useTheme } from '../../../theme-provider'
import type { TrMarkdownMermaidMode } from '../../index.type'
import { renderMermaid } from './renderMermaid'
import { getMermaidErrorMessage } from './utils'

const props = withDefaults(
  defineProps<{
    code?: string
    copyable?: boolean
    defaultMode?: TrMarkdownMermaidMode
  }>(),
  {
    copyable: true,
    defaultMode: 'preview',
  },
)

const { resolvedColorMode } = useTheme()

const { mode, setMode } = useDefaultModeState<TrMarkdownMermaidMode>(() => props.defaultMode)
const state = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const errorMessage = ref('')
const svgMarkup = ref('')
const previewRef = ref<HTMLElement>()
const codeText = computed(() => props.code || '')
const theme = computed(() => (resolvedColorMode?.value === 'dark' ? 'dark' : 'default'))

let renderRevision = 0

const retryRender = () => {
  void renderDiagram()
}

const renderDiagram = async () => {
  const currentRevision = ++renderRevision
  const source = codeText.value.trim()

  if (!source) {
    svgMarkup.value = ''
    errorMessage.value = ''
    state.value = 'idle'
    return
  }

  state.value = 'loading'
  errorMessage.value = ''
  svgMarkup.value = ''

  try {
    const result = await renderMermaid({
      code: source,
      colorMode: resolvedColorMode?.value || 'light',
      id: `tr-markdown-mermaid-${currentRevision}-${Math.random().toString(36).slice(2)}`,
    })

    if (currentRevision !== renderRevision) {
      return
    }

    svgMarkup.value = result.svg
    state.value = 'ready'
    await nextTick()

    if (currentRevision !== renderRevision || !previewRef.value) {
      return
    }

    result.bindFunctions?.(previewRef.value)
  } catch (error) {
    if (currentRevision !== renderRevision) {
      return
    }

    svgMarkup.value = ''
    errorMessage.value = getMermaidErrorMessage(error)
    state.value = 'error'
  }
}

watch(() => [codeText.value, resolvedColorMode?.value || 'light'], renderDiagram, { immediate: true })

onBeforeUnmount(() => {
  renderRevision += 1
})
</script>

<template>
  <div
    class="tr-markdown__code-block-wrap tr-markdown__mermaid-wrap"
    data-code-type="mermaid"
    data-language="mermaid"
    :data-mermaid-mode="mode"
    :data-mermaid-state="state"
    :data-mermaid-theme="theme"
  >
    <MarkdownFloatingToolbar class-name="tr-markdown__mermaid-toolbar">
      <PreviewSourceToggle
        :active-mode="mode"
        base-class="tr-markdown__mermaid"
        group-label="Mermaid preview mode"
        @select="setMode"
      />
      <CopyButton v-if="copyable" :code="codeText" size="small" />
    </MarkdownFloatingToolbar>

    <div v-show="mode === 'preview'" class="tr-markdown__mermaid-body">
      <MarkdownLoadingSurface
        v-if="state === 'loading'"
        badge-class="tr-markdown__mermaid-loading-badge"
        label="Rendering Mermaid diagram"
        wrapper-class="tr-markdown__mermaid-loading"
      >
        <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__mermaid-source" :code-text="codeText" />
      </MarkdownLoadingSurface>
      <MarkdownStatusSurface
        v-else-if="state === 'error'"
        badge-class="tr-markdown__mermaid-error-badge"
        class-name="tr-markdown__mermaid-error"
        header-class="tr-markdown__mermaid-error-header"
        label="Mermaid render failed"
      >
        <template #actions>
          <button type="button" class="tr-markdown__code-action-button tr-markdown__mermaid-retry" @click="retryRender">
            Retry
          </button>
        </template>
        <p class="tr-markdown__mermaid-error-message">{{ errorMessage }}</p>
        <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__mermaid-source" :code-text="codeText" />
      </MarkdownStatusSurface>
      <div v-else ref="previewRef" class="tr-markdown__mermaid-preview">
        <div class="tr-markdown__mermaid-svg" v-html="svgMarkup"></div>
      </div>
    </div>

    <div v-show="mode === 'source'" class="tr-markdown__mermaid-body">
      <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__mermaid-source" :code-text="codeText" />
    </div>
  </div>
</template>
