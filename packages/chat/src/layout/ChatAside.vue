<script setup lang="ts">
import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatAsideProps, ChatAsideSlotProps, ChatAsideSlots } from '@/types/layout'

defineOptions({
  name: 'ChatAside',
})

const props = defineProps<ChatAsideProps>()
defineSlots<ChatAsideSlots>()

const store = useChatLayoutStoreContext()
const controller = props.side === 'left' ? store.left : store.right
const isMobile = store.viewport.isMobile
const state = computed(() => controller.state.value)
const isOpen = computed(() => controller.isOpen.value)
const collapsed = computed(() => state.value === 'collapsed')

const slotProps = computed<ChatAsideSlotProps>(() => ({
  side: props.side,
  state: state.value,
  isMobile: isMobile.value,
  isOpen: isOpen.value,
  collapsed: collapsed.value,
  mode: state.value === 'overlay' ? 'drawer' : collapsed.value ? 'collapsed' : 'panel',
}))
</script>

<template>
  <aside
    class="tr-chat-aside"
    :class="{
      'tr-chat-aside--left': props.side === 'left',
      'tr-chat-aside--right': props.side === 'right',
      'tr-chat-aside--mobile': isMobile,
      'tr-chat-aside--collapsed': collapsed,
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>
