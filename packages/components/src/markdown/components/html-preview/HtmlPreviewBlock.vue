<script setup lang="ts">
import { IconCheck, IconCopy, IconDownload } from '@opentiny/tiny-robot-svgs'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TrIconButton from '../../../icon-button'
import { useTheme } from '../../../theme-provider'
import type { TrMarkdownCodeHighlightEngine, TrMarkdownHtmlPreviewMode } from '../../index.type'
import { useCodeHighlight } from '../code-block/useCodeHighlight'
import HtmlPreviewIframe from './HtmlPreviewIframe.vue'

const props = withDefaults(
  defineProps<{
    code?: string
    copyable?: boolean
    defaultHeight?: number
    defaultMode?: TrMarkdownHtmlPreviewMode
    downloadable?: boolean
    enableTransformer?: boolean
    fileName?: string
    highlight?: boolean
    highlightEngine?: TrMarkdownCodeHighlightEngine
    sandbox?: string
  }>(),
  {
    copyable: true,
    defaultHeight: 400,
    defaultMode: 'preview',
    downloadable: true,
    fileName: 'preview.html',
    highlight: true,
    highlightEngine: 'highlightjs',
    sandbox: 'allow-scripts allow-forms allow-modals',
  },
)

const mode = ref<TrMarkdownHtmlPreviewMode>(props.defaultMode)
const copyState = ref<'idle' | 'copied' | 'error'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | null = null
const { resolvedColorMode } = useTheme()

const codeText = computed(() => (props.code || '').trim())
const copyIcon = computed(() => (copyState.value === 'copied' ? IconCheck : IconCopy))
const iframeBackground = computed(() => {
  return resolvedColorMode?.value === 'dark' ? '#1f1f1f' : '#ffffff'
})

const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getDisplay: () => 'block',
  getEnableTransformer: () => Boolean(props.enableTransformer),
  getEngine: () => props.highlightEngine,
  getHighlight: () => Boolean(props.highlight),
  getLanguage: () => 'html',
})

const clearCopyTimer = () => {
  if (copyTimer) {
    clearTimeout(copyTimer)
    copyTimer = null
  }
}

const restoreCopyState = () => {
  clearCopyTimer()
  copyTimer = setTimeout(() => {
    copyState.value = 'idle'
    copyTimer = null
  }, 1800)
}

const fallbackCopy = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()
  const successful = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!successful) {
    throw new Error('Copy command failed')
  }
}

const copySource = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(codeText.value)
    } else {
      fallbackCopy(codeText.value)
    }
    copyState.value = 'copied'
  } catch {
    try {
      fallbackCopy(codeText.value)
      copyState.value = 'copied'
    } catch {
      copyState.value = 'error'
    }
  }
  restoreCopyState()
}

const downloadSource = () => {
  const blob = new Blob([codeText.value], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = props.fileName || 'preview.html'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const setMode = (nextMode: TrMarkdownHtmlPreviewMode) => {
  mode.value = nextMode
}

watch(
  () => props.defaultMode,
  (nextMode) => {
    mode.value = nextMode
  },
)

onBeforeUnmount(clearCopyTimer)
</script>

<template>
  <div
    class="tr-markdown__code-block-wrap tr-markdown__html-preview-wrap"
    data-code-type="html-preview"
    data-language="html"
  >
    <div class="tr-markdown__html-preview-toolbar" @click.stop>
      <div class="tr-markdown__html-preview-segmented" role="group" aria-label="HTML preview mode">
        <button
          type="button"
          class="tr-markdown__html-preview-segment"
          :class="{ 'tr-markdown__html-preview-segment--active': mode === 'preview' }"
          @click="setMode('preview')"
        >
          Preview
        </button>
        <button
          type="button"
          class="tr-markdown__html-preview-segment"
          :class="{ 'tr-markdown__html-preview-segment--active': mode === 'source' }"
          @click="setMode('source')"
        >
          Code
        </button>
      </div>

      <TrIconButton
        v-if="copyable"
        class="tr-markdown__copy-button"
        :icon="copyIcon"
        size="24px"
        svg-size="14px"
        aria-label="Copy HTML code"
        :title="copyState === 'copied' ? 'Copied' : 'Copy HTML code'"
        @click="copySource"
      />
      <TrIconButton
        v-if="downloadable"
        class="tr-markdown__html-preview-icon-button"
        :icon="IconDownload"
        size="24px"
        svg-size="14px"
        aria-label="Download HTML"
        title="Download HTML"
        @click="downloadSource"
      />
    </div>

    <div v-show="mode === 'preview'" class="tr-markdown__html-preview-body">
      <HtmlPreviewIframe
        :background="iframeBackground"
        :content="codeText"
        :default-height="defaultHeight"
        :sandbox="sandbox"
      />
    </div>

    <div v-show="mode === 'source'" class="tr-markdown__html-preview-body">
      <div class="tr-markdown__code-block tr-markdown__html-preview-source">
        <pre v-if="!highlightedHtml" class="tr-markdown__code-plain"><code>{{ codeText }}</code></pre>
        <div
          v-else
          class="tr-markdown__code-highlight tr-markdown__code-highlight--block"
          v-html="highlightedHtml"
        ></div>
      </div>
    </div>
  </div>
</template>
