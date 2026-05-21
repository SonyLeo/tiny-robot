<script setup lang="ts">
import { computed } from 'vue'
import { useChatAside } from '@/composables/useChatAside'
import type { ChatAsideProps, ChatAsideSlots } from '@/types/layout'

defineOptions({
  name: 'ChatAside',
})

const props = defineProps<ChatAsideProps>()

defineSlots<ChatAsideSlots>()

const { isExpanded, isDock, isDrawer, isRail, isHidden } = useChatAside(() => props.placement)

const slotProps = computed(() => ({
  isExpanded: isExpanded.value,
}))

const collapseMode = computed(() => props.collapseMode ?? 'overlay')
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
      'tr-chat-aside--collapse-overlay': collapseMode === 'overlay',
      'tr-chat-aside--collapse-slide': collapseMode === 'slide',
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>
