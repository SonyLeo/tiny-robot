<script setup lang="ts">
defineProps<{
  className: string
  label: string
}>()
</script>

<template>
  <div :class="className">{{ label }}</div>
</template>
