<script setup lang="ts">
import { computed } from 'vue'
import TrMarkdown from '../../../components/src/markdown'
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
  <div class="case-source">
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
</template>

<style scoped>
.case-source {
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
  padding: 12px 14px;
}
</style>
