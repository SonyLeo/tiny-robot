<script setup lang="ts">
defineProps<{
  className: string
  codeText: string
  highlightedHtml?: string
}>()
</script>

<template>
  <div :class="className">
    <pre v-if="!highlightedHtml" class="tr-markdown__code-plain"><code>{{ codeText }}</code></pre>
    <div v-else class="tr-markdown__code-highlight tr-markdown__code-highlight--block" v-html="highlightedHtml"></div>
  </div>
</template>
