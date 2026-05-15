<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatRightPanelSlotProps } from '@/types/layout'

defineOptions({
  name: 'ChatRightPanel',
})

const { isMobile, rightPanelOpen } = useChatLayoutStoreContext()

const slotProps = computed<ChatRightPanelSlotProps>(() => ({
  isMobile: isMobile.value,
  open: rightPanelOpen.value,
}))
</script>

<template>
  <aside class="tr-chat-right-panel" :class="{ 'tr-chat-right-panel--mobile': isMobile }">
    <slot v-bind="slotProps" />
  </aside>
</template>
