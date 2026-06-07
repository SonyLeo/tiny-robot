<script setup lang="ts">
import MarkdownStatusBadge from './MarkdownStatusBadge.vue'

defineProps<{
  badgeClass: string
  className: string
  label: string
}>()
</script>

<template>
  <div :class="className">
    <MarkdownStatusBadge :class-name="badgeClass" :label="label" />
    <slot />
  </div>
</template>
