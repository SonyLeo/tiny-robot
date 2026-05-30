<script setup lang="ts">
import { computed } from 'vue'
import type { TrMarkdownCodeBlockMode } from '../../index.type'
import { getCodeLanguageMeta } from '../../utils/code'

const props = withDefaults(
  defineProps<{
    language?: string
    mode?: TrMarkdownCodeBlockMode | 'snippet'
  }>(),
  {
    mode: 'overlay',
  },
)

const meta = computed(() => getCodeLanguageMeta(props.language))
</script>

<template>
  <span v-if="language" class="tr-markdown__code-language" :data-mode="mode">
    <span class="tr-markdown__code-language-badge">
      {{ meta.badge }}
    </span>
    <span class="tr-markdown__code-language-label">
      {{ meta.label }}
    </span>
  </span>
</template>
