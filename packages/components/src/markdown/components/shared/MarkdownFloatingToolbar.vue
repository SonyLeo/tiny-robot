<script setup lang="ts">
defineProps<{
  className: string
}>()
</script>

<template>
  <div :class="className" @click.stop>
    <slot />
  </div>
</template>
