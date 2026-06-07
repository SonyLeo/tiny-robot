import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TrMarkdownFeatureFlags, TrMarkdownRenderNode } from '../index.type'
import { useMarkdownImageGallery } from '../components/image-gallery/useMarkdownImageGallery'

export const useMarkdownImageGalleryRuntime = (
  nodes: MaybeRefOrGetter<TrMarkdownRenderNode[]>,
  featureConfig: MaybeRefOrGetter<TrMarkdownFeatureFlags['imageGallery'] | undefined>,
) => {
  const imageGallery = useMarkdownImageGallery(
    () => toValue(nodes),
    computed(() => toValue(featureConfig)),
  )

  const imageGalleryEnabled = computed(() => imageGallery.config.value.enabled)
  const imageGalleryItems = computed(() => imageGallery.items.value)
  const imageGalleryCurrentIndex = imageGallery.currentIndex
  const imageGalleryShowCaption = computed(() => imageGallery.config.value.showCaption)
  const imageGalleryCloseOnEscape = computed(() => imageGallery.config.value.closeOnEscape)
  const showImageGalleryPreview = computed(
    () => imageGalleryEnabled.value && imageGallery.isOpen.value && imageGalleryItems.value.length > 0,
  )

  return {
    imageGallery,
    imageGalleryCloseOnEscape,
    imageGalleryCurrentIndex,
    imageGalleryEnabled,
    imageGalleryItems,
    imageGalleryShowCaption,
    showImageGalleryPreview,
  }
}
