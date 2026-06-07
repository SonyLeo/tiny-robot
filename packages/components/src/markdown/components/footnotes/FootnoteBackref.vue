<script setup lang="ts">
import { computed } from 'vue'
import { getFootnoteBackrefHref, getFootnoteCaption } from '../../utils/footnotes'

const props = defineProps<{
  id?: unknown
  subId?: unknown
  label?: string
}>()

const href = computed(() => getFootnoteBackrefHref(props.id, props.subId))
const caption = computed(() => getFootnoteCaption(props.id, props.subId))
const ariaLabel = computed(() => `Back to reference ${caption.value}`)
</script>

<template>
  <a
    class="tr-markdown__footnote-backref"
    :href="href"
    :aria-label="ariaLabel"
    :data-footnote-label="label || undefined"
  >
    ↩
  </a>
</template>
