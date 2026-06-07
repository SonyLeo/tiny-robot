<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { IconArrowLeft, IconArrowRight, IconClose } from '@opentiny/tiny-robot-svgs'
import type { TrMarkdownImageGalleryItem } from '../../utils/imageGallery'
import { resolveImageGalleryCaption } from '../../utils/imageGallery'

const props = withDefaults(
  defineProps<{
    images: TrMarkdownImageGalleryItem[]
    showCaption?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    showCaption: true,
    closeOnEscape: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const currentIndex = defineModel<number>('currentIndex', { required: true })

const currentImage = computed(() => props.images[currentIndex.value])
const currentCaption = computed(() => resolveImageGalleryCaption(currentImage.value, props.showCaption))
const galleryLabel = computed(() => `Image gallery preview (${currentIndex.value + 1} / ${props.images.length})`)
let previousBodyOverflow = ''

const close = () => {
  emit('close')
}

const selectImage = (index: number) => {
  currentIndex.value = index
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value += 1
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevImage()
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextImage()
  }
}

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="tr-markdown__image-gallery"
      role="dialog"
      aria-modal="true"
      :aria-label="galleryLabel"
      data-image-gallery="true"
      :data-image-gallery-current-index="currentIndex"
      @click.self="close"
    >
      <button type="button" class="tr-markdown__image-gallery-close" aria-label="Close image gallery" @click="close">
        <IconClose />
      </button>

      <div class="tr-markdown__image-gallery-shell">
        <button
          type="button"
          class="tr-markdown__image-gallery-nav tr-markdown__image-gallery-nav--prev"
          aria-label="Previous image"
          :disabled="currentIndex === 0"
          @click.stop="prevImage"
        >
          <IconArrowLeft />
        </button>

        <figure class="tr-markdown__image-gallery-figure">
          <img
            :src="currentImage?.src"
            :alt="currentImage?.alt || currentCaption || 'Preview image'"
            class="tr-markdown__image-gallery-image"
          />
          <figcaption v-if="currentCaption" class="tr-markdown__image-gallery-caption">
            {{ currentCaption }}
          </figcaption>
        </figure>

        <button
          type="button"
          class="tr-markdown__image-gallery-nav tr-markdown__image-gallery-nav--next"
          aria-label="Next image"
          :disabled="currentIndex === images.length - 1"
          @click.stop="nextImage"
        >
          <IconArrowRight />
        </button>
      </div>

      <div v-if="images.length > 1" class="tr-markdown__image-gallery-footer">
        <div class="tr-markdown__image-gallery-meta">{{ currentIndex + 1 }} / {{ images.length }}</div>
        <div class="tr-markdown__image-gallery-thumbnails" role="list" aria-label="Gallery thumbnails">
          <button
            v-for="(image, index) in images"
            :key="image.id"
            type="button"
            class="tr-markdown__image-gallery-thumbnail"
            :class="{ 'tr-markdown__image-gallery-thumbnail--active': index === currentIndex }"
            :aria-label="`Preview image ${index + 1}`"
            @click="selectImage(index)"
          >
            <img :src="image.src" :alt="image.alt || image.title || `Thumbnail ${index + 1}`" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="less">
.tr-markdown__image-gallery {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 24px;
  background: color-mix(in srgb, #030712 78%, transparent);
  backdrop-filter: blur(10px);
}

.tr-markdown__image-gallery-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 0;
}

.tr-markdown__image-gallery-close,
.tr-markdown__image-gallery-nav,
.tr-markdown__image-gallery-thumbnail {
  border: 0;
  cursor: pointer;
}

.tr-markdown__image-gallery-close,
.tr-markdown__image-gallery-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 18%, #0f172a 82%);
  color: #fff;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.tr-markdown__image-gallery-close:hover,
.tr-markdown__image-gallery-nav:hover:not(:disabled) {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--tr-container-bg-default) 28%, #111827 72%);
}

.tr-markdown__image-gallery-close {
  justify-self: end;
}

.tr-markdown__image-gallery-nav:disabled {
  opacity: 0.32;
  cursor: not-allowed;
}

.tr-markdown__image-gallery-figure {
  display: grid;
  gap: 12px;
  justify-items: center;
  margin: 0;
  min-width: 0;
  min-height: 0;
}

.tr-markdown__image-gallery-image {
  display: block;
  width: auto;
  max-width: min(100%, 1080px);
  max-height: calc(100vh - 220px);
  border-radius: 20px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.38),
    0 0 0 1px color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  object-fit: contain;
  background: color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
}

.tr-markdown__image-gallery-caption {
  max-width: min(720px, 100%);
  margin: 0;
  color: #fff;
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}

.tr-markdown__image-gallery-footer {
  display: grid;
  gap: 12px;
  justify-items: center;
}

.tr-markdown__image-gallery-meta {
  color: color-mix(in srgb, #fff 78%, transparent);
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.04em;
}

.tr-markdown__image-gallery-thumbnails {
  display: flex;
  gap: 10px;
  max-width: min(100%, 880px);
  padding: 8px 4px;
  overflow-x: auto;
}

.tr-markdown__image-gallery-thumbnail {
  position: relative;
  flex: none;
  width: 72px;
  height: 72px;
  padding: 0;
  border-radius: 14px;
  overflow: hidden;
  background: color-mix(in srgb, var(--tr-container-bg-default) 16%, #111827 84%);
  opacity: 0.62;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.tr-markdown__image-gallery-thumbnail:hover,
.tr-markdown__image-gallery-thumbnail--active {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tr-color-primary) 72%, transparent);
}

.tr-markdown__image-gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .tr-markdown__image-gallery {
    gap: 14px;
    padding: 16px;
  }

  .tr-markdown__image-gallery-shell {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }

  .tr-markdown__image-gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .tr-markdown__image-gallery-nav:hover:not(:disabled) {
    transform: translateY(calc(-50% - 1px));
  }

  .tr-markdown__image-gallery-nav--prev {
    left: 16px;
  }

  .tr-markdown__image-gallery-nav--next {
    right: 16px;
  }

  .tr-markdown__image-gallery-image {
    max-height: calc(100vh - 240px);
  }
}
</style>
