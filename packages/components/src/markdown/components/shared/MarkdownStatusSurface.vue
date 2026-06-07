<script setup lang="ts">
import MarkdownStatusHeader from './MarkdownStatusHeader.vue'

defineProps<{
  badgeClass: string
  className: string
  headerClass: string
  label: string
}>()
</script>

<template>
  <div :class="className">
    <MarkdownStatusHeader :badge-class="badgeClass" :class-name="headerClass" :label="label">
      <slot name="actions" />
    </MarkdownStatusHeader>
    <slot />
  </div>
</template>
