<script setup lang="ts">
import { computed } from 'vue'
import { normalizeColorPreview } from '../../utils/colorPreview'

const props = withDefaults(
  defineProps<{
    code?: string
    colorPreview?: boolean
  }>(),
  {
    colorPreview: true,
  },
)

const colorValue = computed(() => {
  if (!props.colorPreview) return null

  return normalizeColorPreview(props.code || '')
})

const inlineStyle = computed(() => {
  if (!colorValue.value) return undefined

  return {
    '--tr-markdown-inline-color-preview': colorValue.value,
  }
})
</script>

<template>
  <code
    class="tr-markdown__inline-code"
    :class="{ 'tr-markdown__inline-code--color-preview': Boolean(colorValue) }"
    :data-color-preview="colorValue || undefined"
    :style="inlineStyle"
  >
    {{ code }}
  </code>
</template>
