<script setup lang="ts">
import { computed } from 'vue'
import { TrMarkdown } from '@opentiny/tiny-robot'
import type { MarkdownDemoSourceCode } from '../types/markdownDemo'

const props = defineProps<{
  sourceCode: MarkdownDemoSourceCode
}>()

const content = computed(() => {
  const language = props.sourceCode.language || ''
  return `\`\`\`${language}\n${props.sourceCode.code}\n\`\`\``
})
</script>

<template>
  <details class="case-source">
    <summary class="case-source__summary">source</summary>
    <div class="case-source__body">
      <TrMarkdown
        :content="content"
        variant="article"
        :code="{
          blockMode: 'overlay',
          copyable: true,
          showLanguage: true,
          highlight: {
            engine: 'highlightjs',
          },
        }"
      />
    </div>
  </details>
</template>

<style scoped>
.case-source {
  display: grid;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
  padding: 12px 14px;
}

.case-source__summary {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  color: var(--tr-text-secondary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  user-select: none;
}

.case-source__summary::-webkit-details-marker {
  display: none;
}

.case-source__body {
  min-width: 0;
}
</style>
