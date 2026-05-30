<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level: number
}>()

const tag = computed(() => `h${Math.min(Math.max(props.level, 1), 6)}`)
</script>

<template>
  <component :is="tag" class="tr-markdown__heading" :data-level="level">
    <slot />
  </component>
</template>
