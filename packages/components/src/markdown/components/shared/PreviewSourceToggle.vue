<script setup lang="ts">
withDefaults(
  defineProps<{
    activeMode: 'preview' | 'source'
    baseClass: string
    groupLabel: string
    previewLabel?: string
    sourceLabel?: string
  }>(),
  {
    previewLabel: 'Preview',
    sourceLabel: 'Code',
  },
)

const emit = defineEmits<{
  select: [mode: 'preview' | 'source']
}>()

const selectMode = (mode: 'preview' | 'source') => {
  emit('select', mode)
}
</script>

<template>
  <div :class="`${baseClass}-segmented`" role="group" :aria-label="groupLabel">
    <button
      type="button"
      :class="[
        `${baseClass}-segment`,
        {
          [`${baseClass}-segment--active`]: activeMode === 'preview',
        },
      ]"
      @click="selectMode('preview')"
    >
      {{ previewLabel }}
    </button>
    <button
      type="button"
      :class="[
        `${baseClass}-segment`,
        {
          [`${baseClass}-segment--active`]: activeMode === 'source',
        },
      ]"
      @click="selectMode('source')"
    >
      {{ sourceLabel }}
    </button>
  </div>
</template>
