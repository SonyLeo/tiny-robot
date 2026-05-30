<script setup lang="ts">
defineProps<{
  ordered?: boolean
}>()
</script>

<template>
  <component :is="ordered ? 'ol' : 'ul'" class="tr-markdown__list">
    <slot />
  </component>
</template>
