<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutPlacement } from '../index.type'

defineOptions({
  name: 'LayoutAsideResizeTrigger',
})

interface LayoutAsideResizeTriggerProps {
  placement: LayoutPlacement
  draggingPlacement?: LayoutPlacement | null
}

const props = defineProps<LayoutAsideResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const isDragging = computed(() => props.draggingPlacement === props.placement)
</script>

<template>
  <button
    type="button"
    class="tr-layout__resize-trigger"
    :class="`tr-layout__resize-trigger--${placement}`"
    data-part="resize-trigger"
    :data-placement="placement"
    :data-dragging="isDragging ? '' : undefined"
    tabindex="-1"
    @pointerdown="emit('pointerdown', $event)"
  >
    <span class="tr-layout__resize-trigger-indicator" data-part="resize-trigger-indicator" aria-hidden="true" />
  </button>
</template>

<style lang="less" scoped>
.tr-layout__resize-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--tr-layout-resize-trigger-size);
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: col-resize;
  z-index: 2;
  display: grid;
  place-items: center;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset-block: 0;
    left: 50%;
    width: 1px;
    background: var(--tr-layout-resize-line-color);
    transform: translateX(-50%);
    transition: background-color 180ms ease;
    z-index: 0;
  }

  &--left {
    right: calc(var(--tr-layout-resize-trigger-size) / -2);

    .tr-layout__resize-trigger-indicator {
      transform: translateX(calc(var(--tr-layout-resize-indicator-idle-offset) * -1)) scale(0.92);
    }
  }

  &--right {
    left: calc(var(--tr-layout-resize-trigger-size) / -2);
  }

  &-indicator {
    position: relative;
    display: block;
    width: var(--tr-layout-resize-indicator-width);
    height: var(--tr-layout-resize-indicator-height);
    border-radius: 999px;
    background: var(--tr-layout-resize-indicator-bg);
    border: 1px solid var(--tr-layout-resize-indicator-border);
    opacity: var(--tr-layout-resize-indicator-idle-opacity);
    transform: translateX(var(--tr-layout-resize-indicator-idle-offset)) scale(0.92);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &:hover,
  &:focus-visible,
  &[data-dragging] {
    .tr-layout__resize-trigger-indicator {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  &:hover::before,
  &[data-dragging]::before {
    background: var(--tr-layout-resize-line-hover-color);
  }

  &[data-dragging] {
    &::before {
      background: var(--tr-layout-resize-line-active-color);
    }

    .tr-layout__resize-trigger-indicator {
      background: var(--tr-layout-resize-indicator-active-bg);
      border-color: var(--tr-layout-resize-indicator-active-border);
      box-shadow: var(--tr-layout-resize-indicator-active-shadow);
    }
  }
}
</style>
