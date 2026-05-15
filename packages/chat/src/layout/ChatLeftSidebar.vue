<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatLeftSidebarSlotProps, ChatLeftSidebarSlots } from '@/types/layout'

defineOptions({
  name: 'ChatLeftSidebar',
})

defineSlots<ChatLeftSidebarSlots>()

const { isMobile, leftSidebarOpen, leftSidebarVisible } = useChatLayoutStoreContext()

const collapsed = computed(() => !isMobile.value && !leftSidebarOpen.value)

const slotProps = computed<ChatLeftSidebarSlotProps>(() => ({
  isMobile: isMobile.value,
  open: leftSidebarVisible.value,
  collapsed: collapsed.value,
  mode: isMobile.value ? 'drawer' : collapsed.value ? 'rail' : 'open',
}))
</script>

<template>
  <aside
    class="tr-chat-left-sidebar"
    :class="{
      'tr-chat-left-sidebar--mobile': isMobile,
      'tr-chat-left-sidebar--collapsed': collapsed,
      'tr-chat-left-sidebar--rail': collapsed,
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>
