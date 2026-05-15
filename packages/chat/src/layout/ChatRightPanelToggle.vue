<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatPanelToggleProps } from '@/types/layout'

defineOptions({
  name: 'ChatRightPanelToggle',
})

const props = withDefaults(defineProps<ChatPanelToggleProps>(), {
  ariaLabel: '切换右侧面板',
})

const { rightPanelOpen, toggleRightPanel } = useChatLayoutStoreContext()
const expanded = computed(() => rightPanelOpen.value)

function handleClick(): void {
  toggleRightPanel()
}
</script>

<template>
  <button
    class="tr-chat-panel-toggle tr-chat-panel-toggle--right"
    type="button"
    :aria-expanded="expanded"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <slot>
      {{ expanded ? '关闭扩展区' : '打开扩展区' }}
    </slot>
  </button>
</template>
