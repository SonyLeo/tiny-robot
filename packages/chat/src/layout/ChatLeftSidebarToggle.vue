<script setup lang="ts">
import { usePanelToggle } from '@/composables/usePanelToggle'
import type { ChatPanelToggleProps, ChatPanelToggleSlots } from '@/types/layout'

defineOptions({
  name: 'ChatLeftSidebarToggle',
})

defineSlots<ChatPanelToggleSlots>()

const props = withDefaults(defineProps<ChatPanelToggleProps>(), {
  ariaLabel: '切换左侧面板',
})

const { expanded, slotProps, handleClick } = usePanelToggle({
  side: 'left',
})
</script>

<template>
  <button
    class="tr-chat-panel-toggle"
    type="button"
    :aria-expanded="expanded"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <slot v-bind="slotProps">
      {{ expanded ? '收起导航' : '展开导航' }}
    </slot>
  </button>
</template>
