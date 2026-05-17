<script setup lang="ts">
import { computed } from 'vue'
import type { ChatSidebarPanelProps, ChatSidebarPanelSlots } from '@/types/ui'

defineOptions({
  name: 'ChatSidebarPanel',
})

const props = defineProps<ChatSidebarPanelProps>()
defineSlots<ChatSidebarPanelSlots>()

const collapsed = computed(() => props.mode === 'rail')
const slotProps = computed(() => ({
  mode: props.mode,
  collapsed: collapsed.value,
  isRail: props.mode === 'rail',
  isDrawer: props.mode === 'drawer',
}))
</script>

<template>
  <section
    class="tr-chat-sidebar-panel"
    :class="{
      'tr-chat-sidebar-panel--rail': collapsed,
      'tr-chat-sidebar-panel--drawer': props.mode === 'drawer',
    }"
  >
    <div v-if="$slots.header || $slots['primary-action']" class="tr-chat-sidebar-panel__fixed-area">
      <div v-if="$slots.header" class="tr-chat-sidebar-panel__header">
        <slot name="header" v-bind="slotProps" />
      </div>

      <div v-if="$slots['primary-action']" class="tr-chat-sidebar-panel__primary">
        <slot name="primary-action" v-bind="slotProps" />
      </div>
    </div>

    <div
      v-if="$slots.default"
      class="tr-chat-sidebar-panel__content-shell"
      :class="{ 'tr-chat-sidebar-panel__content-shell--hidden': collapsed }"
      :aria-hidden="collapsed ? 'true' : undefined"
      :inert="collapsed"
    >
      <slot v-bind="slotProps" />
    </div>
  </section>
</template>
