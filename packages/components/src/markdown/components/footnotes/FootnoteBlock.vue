<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Footnotes',
  },
)
</script>

<template>
  <section class="tr-markdown__footnotes" :aria-label="label">
    <hr class="tr-markdown__footnotes-separator" />
    <ol class="tr-markdown__footnotes-list">
      <slot />
    </ol>
  </section>
</template>
