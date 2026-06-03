<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutPlacement } from '../index.type'

defineOptions({
  name: 'LayoutSurfaceResizeTrigger',
})

interface LayoutSurfaceResizeTriggerProps {
  edge: LayoutPlacement
  active?: boolean
}

const props = defineProps<LayoutSurfaceResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const ariaLabel = computed(() =>
  props.edge === 'left' ? 'Resize floating panel from left edge' : 'Resize floating panel from right edge',
)
</script>

<template>
  <button
    type="button"
    class="tr-layout-surface__resize-trigger"
    :class="`tr-layout-surface__resize-trigger--${edge}`"
    data-part="surface-resize-trigger"
    :data-edge="edge"
    :data-active="active ? '' : undefined"
    :aria-label="ariaLabel"
    tabindex="-1"
    @pointerdown="emit('pointerdown', $event)"
  >
    <span
      class="tr-layout-surface__resize-trigger-indicator"
      data-part="surface-resize-trigger-indicator"
      aria-hidden="true"
    />
  </button>
</template>

<style lang="less" scoped>
.tr-layout-surface__resize-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--hit-area-size);
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: col-resize;
  z-index: 4;
  display: flex;
  align-items: center;
  isolation: isolate;

  &--left {
    left: calc(var(--hit-area-size) / -2);
    justify-content: flex-end;
    cursor: w-resize;

    .tr-layout-surface__resize-trigger-indicator {
      transform: translateX(calc(var(--indicator-idle-offset) * -1)) scale(0.92);
    }
  }

  &--right {
    right: calc(var(--hit-area-size) / -2);
    justify-content: flex-start;
    cursor: e-resize;
  }

  &-indicator {
    position: relative;
    display: block;
    width: var(--indicator-width);
    height: var(--indicator-height);
    border-radius: 999px;
    background: var(--indicator-bg);
    border: 1px solid var(--indicator-border);
    opacity: var(--indicator-idle-opacity);
    transform: translateX(var(--indicator-idle-offset)) scale(0.92);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &:hover {
    .tr-layout-surface__resize-trigger-indicator {
      opacity: var(--indicator-hover-opacity);
      transform: translateX(0) scale(1);
    }
  }

  &[data-active],
  &:focus-visible {
    .tr-layout-surface__resize-trigger-indicator {
      opacity: 1;
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
      transform: translateX(0) scale(1);
    }
  }
}
</style>
