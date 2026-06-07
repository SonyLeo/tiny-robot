import { computed, shallowRef, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { toValue } from 'vue'
import type { TrMarkdownRenderNode } from '../../index.type'
import { collectImageGalleryItems, resolveImageGalleryConfig } from '../../utils/imageGallery'
import type { TrMarkdownImageGalleryConfig } from '../../index.type'

export const useMarkdownImageGallery = (
  nodes: MaybeRefOrGetter<TrMarkdownRenderNode[]>,
  config: MaybeRefOrGetter<boolean | TrMarkdownImageGalleryConfig | undefined>,
) => {
  const resolvedConfig = computed(() => resolveImageGalleryConfig(toValue(config)))
  const collection = computed(() => collectImageGalleryItems(toValue(nodes)))
  const isOpen = shallowRef(false)
  const currentIndex = shallowRef(0)

  const openAt = (index: number) => {
    if (!resolvedConfig.value.enabled) {
      return
    }

    if (index < 0 || index >= collection.value.items.length) {
      return
    }

    currentIndex.value = index
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  watch(
    () => collection.value.items.length,
    (length) => {
      if (!length) {
        close()
        currentIndex.value = 0
        return
      }

      if (currentIndex.value >= length) {
        currentIndex.value = length - 1
      }
    },
    {
      immediate: true,
    },
  )

  return {
    config: resolvedConfig,
    items: computed(() => collection.value.items),
    indexMap: computed(() => collection.value.indexMap),
    isOpen: isOpen as ShallowRef<boolean>,
    currentIndex: currentIndex as ShallowRef<number>,
    openAt,
    close,
  }
}
