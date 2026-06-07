<script setup lang="ts">
import { IconCheck, IconCopy, IconDownload } from '@opentiny/tiny-robot-svgs'
import { computed, ref } from 'vue'
import TrIconButton from '../../../icon-button'
import { useTheme } from '../../../theme-provider'
import { useDefaultModeState } from '../../composables/useDefaultModeState'
import type {
  TrMarkdownCodeHighlightEngine,
  TrMarkdownHtmlPreviewMode,
  TrMarkdownHtmlPreviewStreamingMode,
} from '../../index.type'
import { useClipboardState } from '../../composables/useClipboardState'
import { useCodeHighlight } from '../code-block/useCodeHighlight'
import HtmlPreviewIframe from './HtmlPreviewIframe.vue'
import MarkdownFloatingToolbar from '../shared/MarkdownFloatingToolbar.vue'
import MarkdownLoadingSurface from '../shared/MarkdownLoadingSurface.vue'
import MarkdownSourceBlock from '../shared/MarkdownSourceBlock.vue'
import PreviewSourceToggle from '../shared/PreviewSourceToggle.vue'
import { isFullHtmlDocument } from './utils'
import { useHtmlPreviewStreamSession } from './useHtmlPreviewStreamSession'

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
    streamingActive?: boolean
    streamingMode?: TrMarkdownHtmlPreviewStreamingMode
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
    streamingActive: false,
    streamingMode: 'auto',
  },
)

const { mode, setMode } = useDefaultModeState<TrMarkdownHtmlPreviewMode>(() => props.defaultMode)
const toolbarActive = ref(false)
const { resolvedColorMode } = useTheme()

const codeText = computed(() => (props.code || '').trim())
const { copy: copySource, state: copyState } = useClipboardState({
  value: codeText,
})
const copyIcon = computed(() => (copyState.value === 'copied' ? IconCheck : IconCopy))
const iframeBackground = computed(() => {
  return resolvedColorMode?.value === 'dark' ? '#1f1f1f' : '#ffffff'
})
const isFragment = computed(() => !isFullHtmlDocument(codeText.value))
const streamSession = useHtmlPreviewStreamSession(
  codeText,
  computed(() => Boolean(props.streamingActive)),
  computed(() => props.streamingMode),
)
const previewPending = computed(() => streamSession.previewPending.value)
const pendingReason = computed(() => streamSession.pendingReason.value)
const headClosed = computed(() => streamSession.headClosed.value)
const scriptLocked = computed(() => streamSession.scriptLocked.value)
const liveCommitted = computed(() => streamSession.liveCommitted.value)
const previewStable = computed(() => streamSession.stable.value)
const renderContent = computed(() => streamSession.renderContent.value)
const effectiveMode = computed<TrMarkdownHtmlPreviewMode>(() => {
  if (isFragment.value) {
    return 'source'
  }

  return mode.value
})
const pendingLabel = computed(() => {
  if (!previewPending.value) {
    return ''
  }

  switch (pendingReason.value) {
    case 'head':
      return 'Waiting for document head'
    case 'script':
      return 'Waiting for closing </html> before booting scripts'
    case 'defer':
      return 'Deferred until closing </html>'
    default:
      return 'Streaming preview pending'
  }
})

const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getDisplay: () => 'block',
  getEnableTransformer: () => Boolean(props.enableTransformer),
  getEngine: () => props.highlightEngine,
  getHighlight: () => Boolean(props.highlight),
  getLanguage: () => 'html',
})

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

const setToolbarActive = (active: boolean) => {
  toolbarActive.value = active
}
</script>

<template>
  <div
    class="tr-markdown__code-block-wrap tr-markdown__html-preview-wrap"
    :class="{ 'tr-markdown__html-preview-wrap--toolbar-active': toolbarActive }"
    data-code-type="html-preview"
    data-language="html"
    :data-html-preview-streaming-mode="streamingMode"
    :data-html-preview-fragment="String(isFragment)"
    :data-html-preview-pending="String(previewPending)"
    :data-html-preview-pending-reason="pendingReason"
    :data-html-preview-head-closed="String(headClosed)"
    :data-html-preview-script-locked="String(scriptLocked)"
    :data-html-preview-live-committed="String(liveCommitted)"
    :data-html-preview-stable="String(previewStable)"
    @mouseenter="setToolbarActive(true)"
    @mouseleave="setToolbarActive(false)"
  >
    <MarkdownFloatingToolbar class-name="tr-markdown__html-preview-toolbar">
      <PreviewSourceToggle
        :active-mode="effectiveMode"
        base-class="tr-markdown__html-preview"
        group-label="HTML preview mode"
        @select="setMode"
      />

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
    </MarkdownFloatingToolbar>

    <div v-show="effectiveMode === 'preview'" class="tr-markdown__html-preview-body">
      <MarkdownLoadingSurface
        v-if="previewPending"
        badge-class="tr-markdown__html-preview-loading-badge"
        :label="pendingLabel"
        wrapper-class="tr-markdown__html-preview-loading"
      >
        <MarkdownSourceBlock
          class-name="tr-markdown__code-block tr-markdown__html-preview-source tr-markdown__html-preview-source--pending"
          :code-text="codeText"
          :highlighted-html="highlightedHtml || undefined"
        />
      </MarkdownLoadingSurface>
      <HtmlPreviewIframe
        v-else
        :background="iframeBackground"
        :content="renderContent"
        :default-height="defaultHeight"
        :sandbox="sandbox"
      />
    </div>

    <div v-show="effectiveMode === 'source'" class="tr-markdown__html-preview-body">
      <MarkdownSourceBlock
        class-name="tr-markdown__code-block tr-markdown__html-preview-source"
        :code-text="codeText"
        :highlighted-html="highlightedHtml || undefined"
      />
    </div>
  </div>
</template>
