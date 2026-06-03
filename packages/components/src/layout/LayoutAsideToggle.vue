<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutAside } from './composables/useLayoutAside'
import type { LayoutAsideToggleProps } from './index.type'

defineOptions({
  name: 'LayoutAsideToggle',
})

const props = defineProps<LayoutAsideToggleProps>()

const { isOpen, isExpanded, toggle } = useLayoutAside(() => props.placement)

const slotProps = computed(() => ({
  isOpen: isOpen.value,
  isExpanded: isExpanded.value,
}))

const defaultAriaLabels = {
  left: 'Toggle left panel',
  right: 'Toggle right panel',
} as const

const fallbackTexts = {
  left: {
    expanded: 'Collapse navigation',
    collapsed: 'Expand navigation',
  },
  right: {
    expanded: 'Hide side panel',
    collapsed: 'Show side panel',
  },
} as const

const ariaLabel = computed(() => props.ariaLabel ?? defaultAriaLabels[props.placement])

const fallbackText = computed(() => {
  const text = fallbackTexts[props.placement]
  return isOpen.value ? text.expanded : text.collapsed
})
</script>

<template>
  <button class="tr-layout-aside-toggle" type="button" :aria-expanded="isOpen" :aria-label="ariaLabel" @click="toggle">
    <slot v-bind="slotProps">
      {{ fallbackText }}
    </slot>
  </button>
</template>

<style scoped>
.tr-layout-aside-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--tr-layout-text-primary);
  cursor: pointer;
}
</style>
