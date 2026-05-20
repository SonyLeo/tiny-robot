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

const { isExpanded, isDock, isDrawer, isRail, isHidden } = useChatAside(() => props.placement)

const slotProps = computed<ChatAsideSlotProps>(() => ({
  isExpanded: isExpanded.value,
}))
</script>

<template>
  <aside
    class="tr-chat-aside"
    :class="{
      'tr-chat-aside--left': props.placement === 'left',
      'tr-chat-aside--right': props.placement === 'right',
      'tr-chat-aside--dock': isDock,
      'tr-chat-aside--drawer': isDrawer,
      'tr-chat-aside--expanded': isExpanded,
      'tr-chat-aside--rail': isRail,
      'tr-chat-aside--hidden': isHidden,
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>
