<script setup lang="ts">
import { computed } from 'vue'
import type {
  TrMarkdownCodeActionsRender,
  TrMarkdownCodeBlockMode,
  TrMarkdownCodeHighlightEngine,
  TrMarkdownHtmlPreviewConfig,
  TrMarkdownMermaidConfig,
} from '../../index.type'
import CodeBlock from './CodeBlock.vue'
import CodeBlockFull from './CodeBlockFull.vue'
import CodeBlockSingleLine from './CodeBlockSingleLine.vue'
import HtmlPreviewBlock from '../html-preview/HtmlPreviewBlock.vue'
import MermaidBlock from '../mermaid/MermaidBlock.vue'
import { isFullHtmlDocument, resolveHtmlPreviewConfig } from '../html-preview/utils'
import { resolveMermaidConfig } from '../mermaid/utils'

const props = withDefaults(
  defineProps<{
    actionsRender?: TrMarkdownCodeActionsRender
    blockMode?: TrMarkdownCodeBlockMode
    code?: string
    copyable?: boolean
    defaultExpand?: boolean
    enableTransformer?: boolean
    highlight?: boolean
    highlightEngine?: TrMarkdownCodeHighlightEngine
    htmlPreview?: boolean | TrMarkdownHtmlPreviewConfig
    language?: string
    mermaid?: boolean | TrMarkdownMermaidConfig
    showLanguage?: boolean
    streamingActive?: boolean
  }>(),
  {
    blockMode: 'overlay',
    copyable: true,
    defaultExpand: true,
    enableTransformer: false,
    highlight: true,
    highlightEngine: 'highlightjs',
    showLanguage: true,
  },
)

const sourceCode = computed(() => props.code || '')
const normalizedCode = computed(() => sourceCode.value.replace(/\n$/, ''))

const htmlPreviewConfig = computed(() => resolveHtmlPreviewConfig(props.htmlPreview))
const mermaidConfig = computed(() => resolveMermaidConfig(props.mermaid))
const normalizedLanguage = computed(() => (props.language || '').trim().toLowerCase())

const shouldRenderHtmlPreview = computed(() => {
  return htmlPreviewConfig.value.enabled && normalizedLanguage.value === 'html' && isFullHtmlDocument(sourceCode.value)
})

const shouldRenderMermaid = computed(() => {
  return mermaidConfig.value.enabled && normalizedLanguage.value === 'mermaid'
})

const isSingleLine = computed(() => {
  const content = normalizedCode.value
  return !content.includes('\n') && content.length <= 32
})
</script>

<template>
  <HtmlPreviewBlock
    v-if="shouldRenderHtmlPreview"
    :code="sourceCode"
    :copyable="htmlPreviewConfig.copyable ?? copyable"
    :default-height="htmlPreviewConfig.defaultHeight"
    :default-mode="htmlPreviewConfig.defaultMode"
    :downloadable="htmlPreviewConfig.downloadable"
    :enable-transformer="enableTransformer"
    :file-name="htmlPreviewConfig.fileName"
    :highlight="highlight"
    :highlight-engine="highlightEngine"
    :sandbox="htmlPreviewConfig.sandbox"
    :streaming-active="streamingActive"
    :streaming-mode="htmlPreviewConfig.streamingMode"
  />
  <MermaidBlock
    v-else-if="shouldRenderMermaid"
    :code="normalizedCode"
    :copyable="mermaidConfig.copyable ?? copyable"
    :default-mode="mermaidConfig.defaultMode"
  />
  <CodeBlockSingleLine
    v-else-if="isSingleLine"
    :actions-render="actionsRender"
    :code="normalizedCode"
    :copyable="copyable"
    :enable-transformer="enableTransformer"
    :highlight="highlight"
    :highlight-engine="highlightEngine"
    :language="language"
  />
  <CodeBlockFull
    v-else-if="blockMode === 'full'"
    :actions-render="actionsRender"
    :code="normalizedCode"
    :copyable="copyable"
    :default-expand="defaultExpand"
    :enable-transformer="enableTransformer"
    :highlight="highlight"
    :highlight-engine="highlightEngine"
    :language="language"
    :show-language="showLanguage"
  />
  <CodeBlock
    v-else
    :actions-render="actionsRender"
    :code="normalizedCode"
    :copyable="copyable"
    :enable-transformer="enableTransformer"
    :highlight="highlight"
    :highlight-engine="highlightEngine"
    :language="language"
    :show-language="showLanguage"
  />
</template>
