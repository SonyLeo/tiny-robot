<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutFloatingResizeHandle } from '../index.type'

defineOptions({
  name: 'LayoutSurfaceResizeTrigger',
})

interface LayoutSurfaceResizeTriggerProps {
  handle: LayoutFloatingResizeHandle
  active?: boolean
}

const props = defineProps<LayoutSurfaceResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const ariaLabelMap: Record<LayoutFloatingResizeHandle, string> = {
  n: 'Resize floating panel from top edge',
  s: 'Resize floating panel from bottom edge',
  e: 'Resize floating panel from right edge',
  w: 'Resize floating panel from left edge',
  ne: 'Resize floating panel from top right corner',
  nw: 'Resize floating panel from top left corner',
  se: 'Resize floating panel from bottom right corner',
  sw: 'Resize floating panel from bottom left corner',
}

const cursorClass = computed(() => {
  if (props.handle === 'n' || props.handle === 's') {
    return 'tr-layout-surface__resize-trigger--ns'
  }

  if (props.handle === 'e' || props.handle === 'w') {
    return 'tr-layout-surface__resize-trigger--ew'
  }

  if (props.handle === 'ne' || props.handle === 'sw') {
    return 'tr-layout-surface__resize-trigger--nesw'
  }

  return 'tr-layout-surface__resize-trigger--nwse'
})

const ariaLabel = computed(() => ariaLabelMap[props.handle])
</script>

<template>
  <button
    type="button"
    class="tr-layout-surface__resize-trigger"
    :class="[`tr-layout-surface__resize-trigger--${handle}`, cursorClass]"
    data-part="surface-resize-trigger"
    :data-handle="handle"
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
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;

  &--n,
  &--s {
    left: 12px;
    right: 12px;
    height: var(--hit-area-size);
  }

  &--e,
  &--w {
    top: 12px;
    bottom: 12px;
    width: var(--hit-area-size);
  }

  &--ne,
  &--nw,
  &--se,
  &--sw {
    width: calc(var(--hit-area-size) + 6px);
    height: calc(var(--hit-area-size) + 6px);
  }

  &--n {
    top: calc(var(--hit-area-size) / -2);
  }

  &--s {
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--e {
    right: calc(var(--hit-area-size) / -2);
  }

  &--w {
    left: calc(var(--hit-area-size) / -2);
  }

  &--ne {
    top: calc(var(--hit-area-size) / -2);
    right: calc(var(--hit-area-size) / -2);
  }

  &--nw {
    top: calc(var(--hit-area-size) / -2);
    left: calc(var(--hit-area-size) / -2);
  }

  &--se {
    right: calc(var(--hit-area-size) / -2);
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--sw {
    left: calc(var(--hit-area-size) / -2);
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--ns {
    cursor: ns-resize;
  }

  &--ew {
    cursor: ew-resize;
  }

  &--nesw {
    cursor: nesw-resize;
  }

  &--nwse {
    cursor: nwse-resize;
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
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &--n .tr-layout-surface__resize-trigger-indicator,
  &--s .tr-layout-surface__resize-trigger-indicator {
    width: 28px;
    height: 6px;
  }

  &--e .tr-layout-surface__resize-trigger-indicator,
  &--w .tr-layout-surface__resize-trigger-indicator {
    width: 6px;
    height: 28px;
  }

  &--ne .tr-layout-surface__resize-trigger-indicator,
  &--nw .tr-layout-surface__resize-trigger-indicator,
  &--se .tr-layout-surface__resize-trigger-indicator,
  &--sw .tr-layout-surface__resize-trigger-indicator {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  &:hover {
    .tr-layout-surface__resize-trigger-indicator {
      opacity: var(--indicator-hover-opacity);
    }
  }

  &[data-active],
  &:focus-visible {
    .tr-layout-surface__resize-trigger-indicator {
      opacity: 1;
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
    }
  }
}
</style>
