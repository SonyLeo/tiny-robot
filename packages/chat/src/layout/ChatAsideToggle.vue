<script setup lang="ts">
import { computed } from 'vue'
import { useChatAside } from '@/composables/useChatAside'
import type { ChatAsideToggleProps, ChatAsideToggleSlotProps } from '@/types/layout'
import type { ChatAsideToggleSlots } from '@/types/layout.internal'

defineOptions({
  name: 'ChatAsideToggle',
})

defineSlots<ChatAsideToggleSlots>()

const props = defineProps<ChatAsideToggleProps>()

const { isOpen, toggle } = useChatAside(() => props.side)

const slotProps = computed<ChatAsideToggleSlotProps>(() => ({
  isOpen: isOpen.value,
}))

const defaultAriaLabels = {
  left: '切换左侧面板',
  right: '切换右侧面板',
} as const

const fallbackTexts = {
  left: {
    open: '收起导航',
    closed: '展开导航',
  },
  right: {
    open: '关闭扩展区',
    closed: '打开扩展区',
  },
} as const

const ariaLabel = computed(() => props.ariaLabel ?? defaultAriaLabels[props.side])

const fallbackText = computed(() => {
  const text = fallbackTexts[props.side]
  return isOpen.value ? text.open : text.closed
})
</script>

<template>
  <button class="tr-chat-panel-toggle" type="button" :aria-expanded="isOpen" :aria-label="ariaLabel" @click="toggle">
    <slot v-bind="slotProps">
      {{ fallbackText }}
    </slot>
  </button>
</template>
