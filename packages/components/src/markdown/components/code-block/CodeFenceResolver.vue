<script setup lang="ts">
import { computed } from 'vue'
import type {
  TrMarkdownCodeActionsRender,
  TrMarkdownCodeBlockMode,
  TrMarkdownCodeHighlightEngine,
} from '../../index.type'
import CodeBlock from './CodeBlock.vue'
import CodeBlockFull from './CodeBlockFull.vue'
import CodeBlockSingleLine from './CodeBlockSingleLine.vue'

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
    language?: string
    showLanguage?: boolean
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

const normalizedCode = computed(() => {
  return (props.code || '').replace(/\n$/, '')
})

const isSingleLine = computed(() => {
  const content = normalizedCode.value
  return !content.includes('\n') && content.length <= 32
})
</script>

<template>
  <CodeBlockSingleLine
    v-if="isSingleLine"
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
