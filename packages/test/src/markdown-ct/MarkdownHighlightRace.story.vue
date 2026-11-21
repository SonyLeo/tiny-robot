<script setup lang="ts">
import { computed } from 'vue'
import { useCodeHighlight } from '../../../components/src/markdown/components/code-block/useCodeHighlight'
import type { HighlightCodeOptions } from '../../../components/src/markdown/utils/highlight'
import ThemeProvider from '../../../components/src/theme-provider/index.vue'

const props = withDefaults(
  defineProps<{
    code?: string
    enabled?: boolean
    engine?: 'highlightjs' | 'shiki'
    language?: string
    colorMode?: 'light' | 'dark'
    highlightCode: (code: string, options: HighlightCodeOptions) => Promise<string | null>
  }>(),
  {
    code: '',
    enabled: true,
    engine: 'highlightjs',
    language: 'text',
    colorMode: 'light',
  },
)

const codeText = computed(() => props.code)
const { highlightedHtml } = useCodeHighlight({
  getCode: () => codeText.value,
  getColorMode: () => props.colorMode,
  getDisplay: () => 'block',
  getEngine: () => props.engine,
  getHighlight: () => props.enabled,
  getLanguage: () => props.language,
  highlightCode: (code, options) => props.highlightCode(code, { ...options, colorMode: props.colorMode }),
})
</script>

<template>
  <ThemeProvider :key="colorMode" :color-mode="colorMode">
    <div class="markdown-highlight-race">
      <pre v-if="!highlightedHtml" data-testid="plain-source"><code>{{ code }}</code></pre>
      <div v-else data-testid="highlight-result" v-html="highlightedHtml"></div>
    </div>
  </ThemeProvider>
</template>
