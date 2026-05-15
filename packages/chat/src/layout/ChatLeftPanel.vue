<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useChatLayoutConfigContext, useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatLeftPanelSlotProps } from '@/types/layout'

defineOptions({
  name: 'ChatLeftPanel',
})

const slots = useSlots()
const { isMobile, leftPanelOpen, leftPanelVisible } = useChatLayoutStoreContext()
const { leftRailWidth } = useChatLayoutConfigContext()

const collapsed = computed(() => !isMobile.value && !leftPanelOpen.value)
const showRail = computed(() => collapsed.value && leftRailWidth.value > 0 && Boolean(slots.rail))
const showDefault = computed(() => isMobile.value || leftPanelOpen.value || !showRail.value)

const slotProps = computed<ChatLeftPanelSlotProps>(() => ({
  isMobile: isMobile.value,
  open: leftPanelVisible.value,
  collapsed: collapsed.value,
}))
</script>

<template>
  <aside
    v-if="showRail || showDefault"
    class="tr-chat-left-panel"
    :class="{
      'tr-chat-left-panel--mobile': isMobile,
      'tr-chat-left-panel--collapsed': collapsed,
      'tr-chat-left-panel--rail': showRail,
    }"
  >
    <slot v-if="showDefault" v-bind="slotProps" />
    <slot v-else name="rail" v-bind="slotProps" />
  </aside>
</template>
