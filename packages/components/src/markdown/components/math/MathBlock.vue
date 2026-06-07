<script setup lang="ts">
import { computed } from 'vue'
import CopyButton from '../code-block/CopyButton.vue'
import MarkdownFloatingToolbar from '../shared/MarkdownFloatingToolbar.vue'
import MarkdownLoadingSurface from '../shared/MarkdownLoadingSurface.vue'
import MarkdownSourceBlock from '../shared/MarkdownSourceBlock.vue'
import MarkdownStatusSurface from '../shared/MarkdownStatusSurface.vue'
import { useKatexRenderer } from './useKatexRenderer'

const props = withDefaults(
  defineProps<{
    copyable?: boolean
    formula?: string
  }>(),
  {
    copyable: true,
  },
)

const sourceText = computed(() => props.formula || '')
const { errorMessage, hasKatexError, renderedHtml, state } = useKatexRenderer({
  displayMode: () => true,
  formula: () => sourceText.value,
})
</script>

<template>
  <div
    class="tr-markdown__code-block-wrap tr-markdown__math-block-wrap"
    data-code-type="math"
    data-language="math"
    data-math-display="block"
    :data-math-state="state"
    :data-math-error="String(hasKatexError)"
  >
    <MarkdownFloatingToolbar v-if="copyable" class-name="tr-markdown__math-block-toolbar">
      <CopyButton :code="sourceText" size="small" />
    </MarkdownFloatingToolbar>

    <MarkdownLoadingSurface
      v-if="state === 'loading'"
      badge-class="tr-markdown__math-loading-badge"
      label="Rendering math formula"
      wrapper-class="tr-markdown__math-block-loading"
    >
      <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__math-source" :code-text="sourceText" />
    </MarkdownLoadingSurface>

    <template v-else-if="renderedHtml">
      <MarkdownStatusSurface
        v-if="hasKatexError"
        badge-class="tr-markdown__math-error-badge"
        class-name="tr-markdown__math-block-preview tr-markdown__math-block-preview--error"
        header-class="tr-markdown__math-error-header"
        label="KaTeX fallback rendered"
      >
        <div class="tr-markdown__math-rendered" v-html="renderedHtml"></div>
        <p v-if="errorMessage" class="tr-markdown__math-error-message">{{ errorMessage }}</p>
        <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__math-source" :code-text="sourceText" />
      </MarkdownStatusSurface>
      <div v-else class="tr-markdown__math-block-preview">
        <div class="tr-markdown__math-rendered" v-html="renderedHtml"></div>
      </div>
    </template>

    <MarkdownStatusSurface
      v-else
      badge-class="tr-markdown__math-error-badge"
      class-name="tr-markdown__math-block-error"
      header-class="tr-markdown__math-error-header"
      label="Math render failed"
    >
      <p v-if="errorMessage" class="tr-markdown__math-error-message">{{ errorMessage }}</p>
      <MarkdownSourceBlock class-name="tr-markdown__code-block tr-markdown__math-source" :code-text="sourceText" />
    </MarkdownStatusSurface>
  </div>
</template>
