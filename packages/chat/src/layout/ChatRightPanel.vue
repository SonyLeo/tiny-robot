<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatRightPanelSlotProps, ChatRightPanelSlots } from '@/types/layout'

defineOptions({
  name: 'ChatRightPanel',
})

defineSlots<ChatRightPanelSlots>()

const { isMobile, rightPanelOpen } = useChatLayoutStoreContext()

const slotProps = computed<ChatRightPanelSlotProps>(() => ({
  isMobile: isMobile.value,
  open: rightPanelOpen.value,
  mode: isMobile.value ? 'drawer' : 'panel',
}))
</script>

<template>
  <aside class="tr-chat-right-panel" :class="{ 'tr-chat-right-panel--mobile': isMobile }">
    <slot v-bind="slotProps" />
  </aside>
</template>
