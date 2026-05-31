<script setup lang="ts">
import { computed } from 'vue'
import type { TrMarkdownCodeActionsRender, TrMarkdownCodeHighlightEngine } from '../../index.type'
import CodeBlockHeader from './CodeBlockHeader.vue'
import CodeLanguageTag from './CodeLanguageTag.vue'
import { useCodeHighlight } from './useCodeHighlight'

const props = withDefaults(
  defineProps<{
    actionsRender?: TrMarkdownCodeActionsRender
    code?: string
    copyable?: boolean
    enableTransformer?: boolean
    highlight?: boolean
    highlightEngine?: TrMarkdownCodeHighlightEngine
    language?: string
    showLanguage?: boolean
  }>(),
  {
    enableTransformer: false,
    highlight: true,
    highlightEngine: 'highlightjs',
    showLanguage: true,
  },
)

const codeText = computed(() => props.code || '')
const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getDisplay: () => 'block',
  getEnableTransformer: () => Boolean(props.enableTransformer),
  getEngine: () => props.highlightEngine,
  getHighlight: () => Boolean(props.highlight),
  getLanguage: () => props.language,
})
</script>

<template>
  <div
    class="tr-markdown__code-block-wrap tr-markdown__code-block-wrap--overlay"
    :data-language="language || undefined"
  >
    <CodeBlockHeader
      :actions-render="actionsRender"
      :code="codeText"
      :copyable="copyable"
      :language="language"
      :show-language="false"
    />
    <div class="tr-markdown__code-block">
      <pre v-if="!highlightedHtml" class="tr-markdown__code-plain"><code>{{ codeText }}</code></pre>
      <div v-else class="tr-markdown__code-highlight tr-markdown__code-highlight--block" v-html="highlightedHtml"></div>
    </div>
    <CodeLanguageTag v-if="showLanguage" :language="language" mode="overlay" />
  </div>
</template>
