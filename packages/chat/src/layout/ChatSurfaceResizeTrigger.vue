<script setup lang="ts">
import { computed } from 'vue'
import type { ChatPlacement } from '@/types/layout'

defineOptions({
  name: 'ChatSurfaceResizeTrigger',
})

interface ChatSurfaceResizeTriggerProps {
  edge: ChatPlacement
  active?: boolean
}

const props = defineProps<ChatSurfaceResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const ariaLabel = computed(() => (props.edge === 'left' ? '调整悬浮层左侧宽度' : '调整悬浮层右侧宽度'))
</script>

<template>
  <button
    type="button"
    class="tr-chat-layout-surface__resize-trigger"
    :class="`tr-chat-layout-surface__resize-trigger--${edge}`"
    data-part="surface-resize-trigger"
    :data-edge="edge"
    :data-active="active ? '' : undefined"
    :aria-label="ariaLabel"
    tabindex="-1"
    @pointerdown="emit('pointerdown', $event)"
  >
    <span
      class="tr-chat-layout-surface__resize-trigger-indicator"
      data-part="surface-resize-trigger-indicator"
      aria-hidden="true"
    />
  </button>
</template>
