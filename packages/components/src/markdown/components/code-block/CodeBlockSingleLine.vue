<script setup lang="ts">
import { computed } from 'vue'
import type { TrMarkdownCodeActionsRender, TrMarkdownCodeHighlightEngine } from '../../index.type'
import CodeBlockToolbar from './CodeBlockToolbar'
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
  }>(),
  {
    copyable: true,
    enableTransformer: false,
    highlight: true,
    highlightEngine: 'highlightjs',
  },
)

const codeText = computed(() => props.code || '')
const highlightDisplay = computed(() => (props.highlightEngine === 'shiki' ? 'block' : 'inline'))
const highlightClassName = computed(() =>
  highlightDisplay.value === 'inline'
    ? 'tr-markdown__code-highlight tr-markdown__code-highlight--inline'
    : 'tr-markdown__code-highlight tr-markdown__code-highlight--snippet',
)

const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getDisplay: () => highlightDisplay.value,
  getEnableTransformer: () => Boolean(props.enableTransformer),
  getEngine: () => props.highlightEngine,
  getHighlight: () => Boolean(props.highlight),
  getLanguage: () => props.language,
})
</script>

<template>
  <div class="tr-markdown__code-snippet-wrap" :data-language="language || undefined">
    <div class="tr-markdown__code-snippet">
      <div class="tr-markdown__code-snippet-content">
        <code v-if="!highlightedHtml" class="tr-markdown__code-inline-block">
          {{ codeText }}
        </code>
        <div v-else :class="highlightClassName" v-html="highlightedHtml"></div>
      </div>

      <CodeBlockToolbar
        :actions-render="actionsRender"
        always-visible
        :code="codeText"
        :copyable="copyable"
        :language="language"
        size="small"
      />
    </div>
  </div>
</template>
