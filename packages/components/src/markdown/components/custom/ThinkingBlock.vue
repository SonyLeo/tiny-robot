<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  content?: string
  defaultOpen?: boolean
}>()

const resolvedTitle = computed(() => props.title || 'Thinking')
</script>

<template>
  <details
    class="tr-markdown__thinking"
    data-thinking-block="true"
    :data-thinking-open="defaultOpen ? 'true' : 'false'"
    :open="defaultOpen || undefined"
  >
    <summary class="tr-markdown__thinking-trigger" data-thinking-trigger="true">
      <span class="tr-markdown__thinking-eyebrow">Reasoning</span>
      <strong class="tr-markdown__thinking-title">{{ resolvedTitle }}</strong>
      <span class="tr-markdown__thinking-chevron" aria-hidden="true">›</span>
    </summary>
    <div class="tr-markdown__thinking-body" data-thinking-body="true">
      <slot>
        <p class="tr-markdown__thinking-copy">{{ content }}</p>
      </slot>
    </div>
  </details>
</template>
