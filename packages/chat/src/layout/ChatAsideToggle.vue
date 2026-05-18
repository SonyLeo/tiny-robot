<script setup lang="ts">
import { computed } from 'vue'
import { useAsideToggle } from '@/composables/useAsideToggle'
import type { ChatAsideToggleProps, ChatAsideToggleSlots } from '@/types/layout'

defineOptions({
  name: 'ChatAsideToggle',
})

defineSlots<ChatAsideToggleSlots>()

const props = defineProps<ChatAsideToggleProps>()

const { isOpen, slotProps, handleClick } = useAsideToggle({
  side: props.side,
})

const ariaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel
  }

  return props.side === 'left' ? '切换左侧面板' : '切换右侧面板'
})

const fallbackText = computed(() => {
  if (props.side === 'left') {
    return isOpen.value ? '收起导航' : '展开导航'
  }

  return isOpen.value ? '关闭扩展区' : '打开扩展区'
})
</script>

<template>
  <button
    class="tr-chat-panel-toggle"
    type="button"
    :aria-expanded="isOpen"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <slot v-bind="slotProps">
      {{ fallbackText }}
    </slot>
  </button>
</template>
