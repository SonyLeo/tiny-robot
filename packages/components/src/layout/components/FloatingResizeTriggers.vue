<script setup lang="ts">
import { computed } from 'vue'
import { usePointerDragSession } from '../composables/usePointerDragSession'
import type { LayoutFloatingResizeHandle } from '../index.type'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'

defineOptions({
  name: 'FloatingResizeTriggers',
})

type ResizeCursorDirection = 'ns' | 'ew' | 'nesw' | 'nwse'

const HANDLE_RESIZE_CURSOR = {
  s: 'ns',
  e: 'ew',
  w: 'ew',
  ne: 'nesw',
  sw: 'nesw',
  nw: 'nwse',
  se: 'nwse',
} satisfies Record<LayoutFloatingResizeHandle, ResizeCursorDirection>

interface FloatingResizeTriggersProps {
  handles: LayoutFloatingResizeHandle[]
}

const props = defineProps<FloatingResizeTriggersProps>()

const emit = defineEmits<{
  (event: 'resize-start', handle: LayoutFloatingResizeHandle): void
  (event: 'resize', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
  (event: 'resize-end', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
}>()

interface FloatingResizeState {
  pointerId: number
  handleEl: HTMLElement
  handle: LayoutFloatingResizeHandle
  startX: number
  startY: number
  lastPointerX: number
  lastPointerY: number
  bodyState: BodyInteractionState
}

interface ResizeTriggerView {
  handle: LayoutFloatingResizeHandle
  class: Array<string | Record<string, boolean>>
}

function resolveResizeDirection(handle: LayoutFloatingResizeHandle): ResizeCursorDirection {
  return HANDLE_RESIZE_CURSOR[handle]
}

const { activeSession: activeResize, startSession } = usePointerDragSession<FloatingResizeState>({
  onMove: (state, event) => {
    if (event.clientX === state.lastPointerX && event.clientY === state.lastPointerY) {
      return
    }

    emitResizeDelta(state, event.clientX, event.clientY, 'resize')
  },
  onStop: (state) => {
    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)
    emitResizeDelta(state, state.lastPointerX, state.lastPointerY, 'resize-end')
  },
})

const resizeTriggerViews = computed<ResizeTriggerView[]>(() =>
  props.handles.map((handle) => {
    const direction = resolveResizeDirection(handle)
    const isActive = activeResize.value?.handle === handle

    return {
      handle,
      class: [
        `tr-layout__floating-resize-trigger--${handle}`,
        `tr-layout__floating-resize-trigger--${direction}`,
        {
          'is-active': isActive,
        },
      ],
    }
  }),
)

function startResize(handle: LayoutFloatingResizeHandle, event: PointerEvent): void {
  if (activeResize.value) {
    return
  }

  const session = startSession(event, (event) => {
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return null
    }

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    return {
      pointerId: event.pointerId,
      handleEl,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      lastPointerX: event.clientX,
      lastPointerY: event.clientY,
      bodyState: lockBodyInteraction(handleEl.ownerDocument.body, `${resolveResizeDirection(handle)}-resize`),
    }
  })

  if (session) {
    emit('resize-start', session.handle)
  }
}

function emitResizeDelta(
  state: FloatingResizeState,
  pointerX: number,
  pointerY: number,
  event: 'resize' | 'resize-end',
): void {
  const deltaX = pointerX - state.startX
  const deltaY = pointerY - state.startY

  state.lastPointerX = pointerX
  state.lastPointerY = pointerY

  if (event === 'resize-end') {
    emit('resize-end', state.handle, deltaX, deltaY)
    return
  }

  emit('resize', state.handle, deltaX, deltaY)
}
</script>

<template>
  <div
    v-for="trigger in resizeTriggerViews"
    :key="trigger.handle"
    class="tr-layout__floating-resize-trigger"
    :class="trigger.class"
    aria-hidden="true"
    @pointerdown="startResize(trigger.handle, $event)"
  >
    <span class="tr-layout__floating-resize-trigger-indicator" aria-hidden="true" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout__floating-resize-trigger {
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

  &--n .tr-layout__floating-resize-trigger-indicator,
  &--s .tr-layout__floating-resize-trigger-indicator {
    width: 28px;
    height: 6px;
  }

  &--e .tr-layout__floating-resize-trigger-indicator,
  &--w .tr-layout__floating-resize-trigger-indicator {
    width: 6px;
    height: 28px;
  }

  &--ne .tr-layout__floating-resize-trigger-indicator,
  &--nw .tr-layout__floating-resize-trigger-indicator,
  &--se .tr-layout__floating-resize-trigger-indicator,
  &--sw .tr-layout__floating-resize-trigger-indicator {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  &:hover {
    .tr-layout__floating-resize-trigger-indicator {
      opacity: var(--indicator-hover-opacity);
    }
  }

  &.is-active {
    .tr-layout__floating-resize-trigger-indicator {
      opacity: 1;
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
    }
  }
}
</style>
