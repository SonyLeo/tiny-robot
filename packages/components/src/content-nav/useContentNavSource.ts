import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useTargetRegistry, type TargetBinder } from '../shared/composables'
import type { ContentNavItem, ContentNavSource } from './index.type'

export function useContentNavSource(options: { items: MaybeRefOrGetter<ContentNavItem[]> }): {
  source: ContentNavSource
  bindTarget: (id: string) => TargetBinder
} {
  const registry = useTargetRegistry()
  const items = computed(() => toValue(options.items))

  const source: ContentNavSource = {
    items,
    resolveTarget: registry.get,
    revision: registry.version,
  }

  watch(
    () => items.value.map((item) => item.id),
    (activeIds) => {
      registry.prune(activeIds)
    },
    { immediate: true },
  )

  return {
    source,
    bindTarget: registry.bindTarget,
  }
}
