<script setup lang="ts">
defineProps<{
  node?: Record<string, unknown>
}>()
</script>

<template>
  <p class="tr-markdown__paragraph">
    <slot />
  </p>
</template>
