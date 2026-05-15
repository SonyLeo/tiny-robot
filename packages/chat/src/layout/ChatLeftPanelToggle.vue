<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatPanelToggleProps } from '@/types/layout'

defineOptions({
  name: 'ChatLeftPanelToggle',
})

const props = withDefaults(defineProps<ChatPanelToggleProps>(), {
  ariaLabel: '切换左侧面板',
})

const { isMobile, leftDrawerOpen, leftPanelOpen, toggleLeftDrawer, toggleLeftPanel } = useChatLayoutStoreContext()

const expanded = computed(() => (isMobile.value ? leftDrawerOpen.value : leftPanelOpen.value))

function handleClick(): void {
  if (isMobile.value) {
    toggleLeftDrawer()
    return
  }

  toggleLeftPanel()
}
</script>

<template>
  <button
    class="tr-chat-panel-toggle tr-chat-panel-toggle--left"
    type="button"
    :aria-expanded="expanded"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <slot>
      {{ expanded ? '收起导航' : '展开导航' }}
    </slot>
  </button>
</template>
