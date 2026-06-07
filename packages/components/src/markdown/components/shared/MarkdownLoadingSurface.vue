<script setup lang="ts">
import MarkdownStatusBadge from './MarkdownStatusBadge.vue'

defineProps<{
  badgeClass: string
  label: string
  wrapperClass: string
}>()
</script>

<template>
  <div :class="wrapperClass">
    <MarkdownStatusBadge :class-name="badgeClass" :label="label" />
    <slot />
  </div>
</template>
