<script setup lang="ts">
import { computed } from 'vue'
import { useKatexRenderer } from './useKatexRenderer'

const props = defineProps<{
  formula?: string
}>()

const sourceText = computed(() => props.formula || '')
const { errorMessage, hasKatexError, renderedHtml, state } = useKatexRenderer({
  displayMode: () => false,
  formula: () => sourceText.value,
})
</script>

<template>
  <span
    class="tr-markdown__math-inline"
    data-math-display="inline"
    :data-math-state="state"
    :data-math-error="String(hasKatexError)"
    :title="hasKatexError && errorMessage ? errorMessage : undefined"
  >
    <span v-if="renderedHtml" class="tr-markdown__math-inline-rendered" v-html="renderedHtml"></span>
    <code v-else class="tr-markdown__math-inline-fallback">{{ sourceText }}</code>
  </span>
</template>
