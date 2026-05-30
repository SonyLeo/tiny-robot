<script setup lang="ts">
defineProps<{
  src?: string
  alt?: string
}>()
</script>

<template>
  <img class="tr-markdown__image" :src="src" :alt="alt" />
</template>
