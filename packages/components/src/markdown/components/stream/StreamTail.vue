<script setup lang="ts">
import { computed } from 'vue'
import type { TrMarkdownStreamTailKind } from '../../index.type'

const props = withDefaults(
  defineProps<{
    content?: string
    kind?: TrMarkdownStreamTailKind
    showCursor?: boolean
  }>(),
  {
    content: '',
    kind: 'text',
    showCursor: true,
  },
)

const isBlockTail = computed(() => props.kind === 'code' || props.kind === 'table')
const tailTag = computed(() => (isBlockTail.value ? 'pre' : 'div'))
</script>

<template>
  <component
    :is="tailTag"
    v-if="content"
    class="tr-markdown__stream-tail"
    aria-live="polite"
    aria-atomic="false"
    :class="[
      `tr-markdown__stream-tail--${kind}`,
      {
        'tr-markdown__stream-tail--cursor': showCursor,
      },
    ]"
  >
    <code v-if="kind === 'code'">{{ content }}</code>
    <template v-else>{{ content }}</template>
  </component>
</template>
