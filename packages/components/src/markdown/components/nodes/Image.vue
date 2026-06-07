<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
  title?: string
  previewable?: boolean
  galleryIndex?: number
}>()

const emit = defineEmits<{
  preview: []
}>()

const previewLabel = computed(() => {
  if (props.alt) {
    return `Preview image: ${props.alt}`
  }

  if (props.title) {
    return `Preview image: ${props.title}`
  }

  return 'Preview image'
})

const handlePreview = () => {
  if (!props.previewable) {
    return
  }

  emit('preview')
}
</script>

<template>
  <button
    v-if="previewable"
    type="button"
    class="tr-markdown__image-button"
    :data-image-gallery-trigger="true"
    :data-image-gallery-index="galleryIndex"
    :aria-label="previewLabel"
    @click="handlePreview"
  >
    <img class="tr-markdown__image" :src="src" :alt="alt" :title="title" />
  </button>
  <img v-else class="tr-markdown__image" :src="src" :alt="alt" :title="title" />
</template>
