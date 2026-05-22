import { computed, type Ref } from 'vue'
import type { ChatAsideConfig } from '@/types/layout'
import type { ChatLayoutAsideStoreInput } from '@/types/layout.internal'

const emptyAsideConfig: ChatAsideConfig = {}

export function createChatLayoutAsideStoreInput(state: Ref<ChatAsideConfig | undefined>): ChatLayoutAsideStoreInput {
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
