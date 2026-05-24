<script setup lang="ts">
import { computed } from 'vue'
import type { ChatPlacement } from '@/types/layout'

defineOptions({
  name: 'ChatAsideResizeTrigger',
})

interface ChatAsideResizeTriggerProps {
  placement: ChatPlacement
  draggingPlacement?: ChatPlacement | null
}

const props = defineProps<ChatAsideResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const isDragging = computed(() => props.draggingPlacement === props.placement)
</script>

<template>
  <button
    type="button"
    class="tr-chat-layout__resize-trigger"
    :class="`tr-chat-layout__resize-trigger--${placement}`"
    data-part="resize-trigger"
    :data-placement="placement"
    :data-dragging="isDragging ? '' : undefined"
    tabindex="-1"
    @pointerdown="emit('pointerdown', $event)"
  >
    <span class="tr-chat-layout__resize-trigger-indicator" data-part="resize-trigger-indicator" aria-hidden="true" />
  </button>
</template>
