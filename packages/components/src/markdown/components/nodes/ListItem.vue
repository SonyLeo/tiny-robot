<script setup lang="ts">
defineProps<{
  task?: boolean
  checked?: boolean
}>()
</script>

<template>
  <li
    class="tr-markdown__list-item"
    :class="{ 'tr-markdown__task-list-item': task }"
    :data-checked="task ? String(Boolean(checked)) : undefined"
  >
    <slot />
  </li>
</template>
