import { computed, type Ref } from 'vue'
import type { LayoutAsideConfig } from './index.type'
import type { LayoutAsideStoreInput } from './internal.type'

const emptyAsideConfig: LayoutAsideConfig = {}

export function createLayoutAsideStoreInput(state: Ref<LayoutAsideConfig | undefined>): LayoutAsideStoreInput {
  const config = computed(() => state.value ?? emptyAsideConfig)

  return {
    layoutMode: computed(() => config.value.layoutMode),
    expanded: computed(() => config.value.expanded),
    expandedWidth: computed(() => config.value.expandedWidth),
    collapsedWidth: computed(() => config.value.collapsedWidth),
    resizable: computed(() => config.value.resizable),
    minExpandedWidth: computed(() => config.value.minExpandedWidth),
    maxExpandedWidth: computed(() => config.value.maxExpandedWidth),
    onUpdate: (nextConfig) => {
      state.value = nextConfig
    },
  }
}
