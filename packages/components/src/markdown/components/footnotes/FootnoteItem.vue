<script setup lang="ts">
import { computed } from 'vue'
import { getFootnoteItemId } from '../../utils/footnotes'

const props = defineProps<{
  id?: unknown
  label?: string
}>()

const itemId = computed(() => getFootnoteItemId(props.id))
</script>

<template>
  <li class="tr-markdown__footnote-item" :id="itemId" :data-footnote-label="label || undefined">
    <slot />
  </li>
</template>
