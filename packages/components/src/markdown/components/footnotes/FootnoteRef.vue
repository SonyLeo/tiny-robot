<script setup lang="ts">
import { computed } from 'vue'
import { getFootnoteCaption, getFootnoteItemHref, getFootnoteRefId } from '../../utils/footnotes'

const props = defineProps<{
  id?: unknown
  subId?: unknown
  label?: string
}>()

const caption = computed(() => getFootnoteCaption(props.id, props.subId))
const href = computed(() => getFootnoteItemHref(props.id))
const refId = computed(() => getFootnoteRefId(props.id, props.subId))
const ariaLabel = computed(() => `Jump to footnote ${caption.value}`)
</script>

<template>
  <sup class="tr-markdown__footnote-ref" :data-footnote-label="label || undefined">
    <a class="tr-markdown__footnote-ref-link" :href="href" :id="refId" :aria-label="ariaLabel">{{ caption }}</a>
  </sup>
</template>
