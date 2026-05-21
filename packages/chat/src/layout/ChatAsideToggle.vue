<script setup lang="ts">
import { computed } from 'vue'
import { useChatAside } from '@/composables/useChatAside'
import type { ChatAsideToggleProps, ChatAsideToggleSlots } from '@/types/layout'

defineOptions({
  name: 'ChatAsideToggle',
})

defineSlots<ChatAsideToggleSlots>()

const props = defineProps<ChatAsideToggleProps>()

const { isExpanded, toggle } = useChatAside(() => props.placement)

const slotProps = computed(() => ({
  isExpanded: isExpanded.value,
}))

const defaultAriaLabels = {
  left: '切换左侧面板',
  right: '切换右侧面板',
} as const

const fallbackTexts = {
  left: {
    expanded: '收起导航',
    collapsed: '展开导航',
  },
  right: {
    expanded: '关闭扩展区',
    collapsed: '打开扩展区',
  },
} as const

const ariaLabel = computed(() => props.ariaLabel ?? defaultAriaLabels[props.placement])

const fallbackText = computed(() => {
  const text = fallbackTexts[props.placement]
  return isExpanded.value ? text.expanded : text.collapsed
})
</script>

<template>
  <button
    class="tr-chat-panel-toggle"
    type="button"
    :aria-expanded="isExpanded"
    :aria-label="ariaLabel"
    @click="toggle"
  >
    <slot v-bind="slotProps">
      {{ fallbackText }}
    </slot>
  </button>
</template>
