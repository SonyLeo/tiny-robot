<script setup lang="ts">
import { computed } from 'vue'
import { useChatAside } from '@/composables/useChatAside'
import type { ChatAsideProps, ChatAsideSlotProps } from '@/types/layout'
import type { ChatAsideSlots } from '@/types/layout.internal'

defineOptions({
  name: 'ChatAside',
})

const props = defineProps<ChatAsideProps>()
defineSlots<ChatAsideSlots>()

const { isMobile, state, isOpen, isCollapsed } = useChatAside(() => props.side)

const slotProps = computed<ChatAsideSlotProps>(() => ({
  state: state.value,
  isMobile: isMobile.value,
  isOpen: isOpen.value,
}))
</script>

<template>
  <aside
    class="tr-chat-aside"
    :class="{
      'tr-chat-aside--left': props.side === 'left',
      'tr-chat-aside--right': props.side === 'right',
      'tr-chat-aside--mobile': isMobile,
      'tr-chat-aside--collapsed': isCollapsed,
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>
