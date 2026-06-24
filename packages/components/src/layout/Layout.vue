<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import { computed, ref } from 'vue'
import AsideContent from './components/AsideContent.vue'
import LayoutSurface from './components/LayoutSurface.vue'
import { provideLayoutContext } from './composables/useLayoutContext'
import { createLayoutState } from './composables/useLayoutRootState'
import type { LayoutAsideResizeDetail, LayoutEmits, LayoutProps, LayoutSlots, LayoutFloatingState } from './index.type'
import type { LayoutAsideView, LayoutPanel } from './internal.type'
import { emitAsideResizeEvent } from './utils/asideEventEmitters'
import { hasNonEmptySlotContent } from './utils/slots'
import { useControllableState } from '../shared/composables'
import { DEFAULT_FLOATING_HEIGHT, DEFAULT_FLOATING_OFFSET, DEFAULT_FLOATING_WIDTH } from './utils/surfaceGeometry'

defineOptions({
  name: 'Layout',
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const slots = defineSlots<LayoutSlots>()
const hasLeftAside = computed(() => hasNonEmptySlotContent(slots['left-aside']))
const hasHeader = computed(() => hasNonEmptySlotContent(slots.header))
const hasFooter = computed(() => hasNonEmptySlotContent(slots.footer))
const hasRightAside = computed(() => hasNonEmptySlotContent(slots['right-aside']))

const { leftPanel, rightPanel, leftAsideView, rightAsideView } = createLayoutState(props, emit, {
  left: hasLeftAside,
  right: hasRightAside,
})

function setDrawerOpen(panel: LayoutPanel, sibling: LayoutPanel, nextOpen: boolean): void {
  if (nextOpen && panel.isDrawer.value && sibling.isDrawer.value && sibling.isOpen.value) {
    sibling.setOpen(false)
  }

  panel.setOpen(nextOpen)
}

function toggleDrawer(panel: LayoutPanel, sibling: LayoutPanel): void {
  setDrawerOpen(panel, sibling, !panel.isOpen.value)
}

function toggleLeftDrawer(): void {
  toggleDrawer(leftPanel, rightPanel)
}

function toggleRightDrawer(): void {
  toggleDrawer(rightPanel, leftPanel)
}

const isDrawerVisible = computed(
  () =>
    (hasLeftAside.value && leftPanel.isDrawer.value && leftPanel.isOpen.value) ||
    (hasRightAside.value && rightPanel.isDrawer.value && rightPanel.isOpen.value),
)

function closeDrawers(): void {
  if (leftPanel.isDrawer.value && leftPanel.isOpen.value) {
    leftPanel.setOpen(false)
  }

  if (rightPanel.isDrawer.value && rightPanel.isOpen.value) {
    rightPanel.setOpen(false)
  }
}

const drawer = {
  left: leftPanel,
  right: rightPanel,
  isDrawerVisible,
  closeDrawers,
}

provideLayoutContext({
  left: {
    isOpen: leftPanel.isOpen,
    toggle: toggleLeftDrawer,
  },
  right: {
    isOpen: rightPanel.isOpen,
    toggle: toggleRightDrawer,
  },
})

const isAsideResizing = ref(false)

function onAsideResizeStart(detail: LayoutAsideResizeDetail): void {
  isAsideResizing.value = true
  emitAsideResizeEvent(emit, 'start', detail)
}

function onAsideResize(detail: LayoutAsideResizeDetail): void {
  emitAsideResizeEvent(emit, 'progress', detail)
}

function onAsideResizeEnd(detail: LayoutAsideResizeDetail): void {
  isAsideResizing.value = false
  emitAsideResizeEvent(emit, 'end', detail)
}

function setLeftAsideWidth(width: number): void {
  drawer.left.setWidth(width)
}

function setRightAsideWidth(width: number): void {
  drawer.right.setWidth(width)
}

function isAsidePresent(aside: LayoutAsideView): boolean {
  return aside.present.value
}

const DEFAULT_FLOATING_STATE: LayoutFloatingState = {
  placement: 'center',
  offsetX: DEFAULT_FLOATING_OFFSET,
  offsetY: DEFAULT_FLOATING_OFFSET,
  width: DEFAULT_FLOATING_WIDTH,
  height: DEFAULT_FLOATING_HEIGHT,
}

const floatingState = useControllableState<LayoutFloatingState>({
  value: () => props.floatingState,
  defaultValue: () => props.defaultFloatingState ?? DEFAULT_FLOATING_STATE,
  onChange: (nextState) => emit('update:floatingState', nextState),
})

onKeyDown('Escape', (event) => {
  if (event.defaultPrevented || !drawer.isDrawerVisible.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  drawer.closeDrawers()
})
</script>

<template>
  <LayoutSurface
    :mode="props.mode"
    v-model:floating-state="floatingState"
    :floating-options="floatingOptions"
    :left-aside="leftAsideView"
    :right-aside="rightAsideView"
    :aside-resizing="isAsideResizing"
    @floating-drag-start="emit('floating-drag-start', $event)"
    @floating-drag="emit('floating-drag', $event)"
    @floating-drag-end="emit('floating-drag-end', $event)"
    @floating-resize-start="emit('floating-resize-start', $event)"
    @floating-resize="emit('floating-resize', $event)"
    @floating-resize-end="emit('floating-resize-end', $event)"
  >
    <div class="tr-layout__body">
      <AsideContent
        v-if="isAsidePresent(leftAsideView)"
        :aside="leftAsideView"
        @width-change="setLeftAsideWidth"
        @aside-resize-start="onAsideResizeStart"
        @aside-resize="onAsideResize"
        @aside-resize-end="onAsideResizeEnd"
      >
        <slot name="left-aside" />
      </AsideContent>

      <header v-if="hasHeader" class="tr-layout__header">
        <slot name="header" />
      </header>

      <main class="tr-layout__main">
        <slot name="main" />
      </main>

      <footer v-if="hasFooter" class="tr-layout__footer">
        <slot name="footer" />
      </footer>

      <AsideContent
        v-if="isAsidePresent(rightAsideView)"
        :aside="rightAsideView"
        @width-change="setRightAsideWidth"
        @aside-resize-start="onAsideResizeStart"
        @aside-resize="onAsideResize"
        @aside-resize-end="onAsideResizeEnd"
      >
        <slot name="right-aside" />
      </AsideContent>

      <div
        v-if="drawer.isDrawerVisible.value"
        class="tr-layout__backdrop"
        aria-hidden="true"
        @pointerdown="drawer.closeDrawers"
      />
    </div>
  </LayoutSurface>
</template>

<style lang="less" scoped>
.tr-layout__body,
.tr-layout__header,
.tr-layout__main,
.tr-layout__footer {
  min-width: 0;
  min-height: 0;
}

.tr-layout__body {
  position: relative;
  display: grid;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  grid-template-columns:
    var(--left-width)
    minmax(var(--tr-layout-main-min-width, 320px), 1fr)
    var(--right-width);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'left header right'
    'left main right'
    'left footer right';
  overflow: hidden;
  background: var(--tr-layout-bg);
  border-radius: inherit;
  transition: var(
    --tr-layout-body-transition,
    grid-template-columns var(--transition-duration) var(--transition-easing)
  );
}

.tr-layout__header {
  grid-area: header;
  background: var(--tr-layout-header-bg);
}

.tr-layout__main {
  grid-area: main;
  position: relative;
  overflow: hidden;
  background: var(--tr-layout-main-bg);
}

.tr-layout__footer {
  grid-area: footer;
  background: var(--tr-layout-footer-bg);
}

.tr-layout__backdrop {
  position: absolute;
  inset: 0;
  z-index: calc(var(--overlay-z-index) - 1);
  background: var(--tr-layout-overlay-bg);
  cursor: pointer;
}
</style>
