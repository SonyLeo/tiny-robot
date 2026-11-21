<script setup lang="ts">
defineProps<{
  ordered?: boolean
  start?: number
}>()
</script>

<template>
  <component :is="ordered ? 'ol' : 'ul'" class="tr-markdown__list" :start="ordered ? start : undefined">
    <slot />
  </component>
</template>
