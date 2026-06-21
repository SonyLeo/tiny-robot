<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import { computed, ref, useAttrs } from 'vue'
import AsideContent from './components/AsideContent.vue'
import LayoutSurface from './components/LayoutSurface.vue'
import { provideLayoutContext } from './composables/useLayoutContext'
import { createLayoutState } from './composables/useLayoutRootState'
import type { LayoutAsideResizeEventDetail, LayoutEmits, LayoutProps, LayoutSlots } from './index.type'
import type { LayoutPanelActions, LayoutPanelContext } from './internal.type'
import { toPx } from './utils/cssLength'
import { emitAsideResizeEvent } from './utils/emitAsideEvents'
import { hasNonEmptySlotContent } from './utils/slots'

defineOptions({
  name: 'Layout',
  inheritAttrs: false,
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const attrs = useAttrs()
const slots = defineSlots<LayoutSlots>()

const { leftPanel, rightPanel, floating } = createLayoutState(props, emit)

function createDrawerPanelActions(panel: LayoutPanelContext, getSibling: () => LayoutPanelContext): LayoutPanelActions {
  function open(): void {
    if (panel.state.isDrawer.value) {
      const sibling = getSibling()
      if (sibling.state.isDrawer.value && sibling.state.isOpen.value) {
        sibling.actions.close()
      }
    }

    panel.actions.setOpen(true)
  }

  function close(): void {
    panel.actions.setOpen(false)
  }

  function toggle(): void {
    if (panel.state.isOpen.value) {
      close()
      return
    }

    open()
  }

  return {
    open,
    close,
    toggle,
    setOpen: (nextOpen) => {
      if (nextOpen) {
        open()
        return
      }

      close()
    },
    setWidth: panel.actions.setWidth,
  }
}

let leftDrawerPanel: LayoutPanelContext = leftPanel
let rightDrawerPanel: LayoutPanelContext = rightPanel

leftDrawerPanel = {
  ...leftPanel,
  actions: createDrawerPanelActions(leftPanel, () => rightDrawerPanel),
}

rightDrawerPanel = {
  ...rightPanel,
  actions: createDrawerPanelActions(rightPanel, () => leftDrawerPanel),
}

const isDrawerVisible = computed(
  () =>
    (leftDrawerPanel.state.isDrawer.value && leftDrawerPanel.state.isOpen.value) ||
    (rightDrawerPanel.state.isDrawer.value && rightDrawerPanel.state.isOpen.value),
)

function closeDrawers(): void {
  if (leftDrawerPanel.state.isDrawer.value && leftDrawerPanel.state.isOpen.value) {
    leftDrawerPanel.actions.close()
  }

  if (rightDrawerPanel.state.isDrawer.value && rightDrawerPanel.state.isOpen.value) {
    rightDrawerPanel.actions.close()
  }
}

const drawer = {
  left: leftDrawerPanel,
  right: rightDrawerPanel,
  isDrawerVisible,
  closeDrawers,
}

provideLayoutContext({
  left: {
    isOpen: drawer.left.state.isOpen,
    toggle: drawer.left.actions.toggle,
  },
  right: {
    isOpen: drawer.right.state.isOpen,
    toggle: drawer.right.actions.toggle,
  },
})

const isAsideResizing = ref(false)

function onAsideResizeStart(detail: LayoutAsideResizeEventDetail): void {
  isAsideResizing.value = true
  emitAsideResizeEvent(emit, 'start', detail)
}

function onAsideResize(detail: LayoutAsideResizeEventDetail): void {
  emitAsideResizeEvent(emit, 'progress', detail)
}

function onAsideResizeEnd(detail: LayoutAsideResizeEventDetail): void {
  isAsideResizing.value = false
  emitAsideResizeEvent(emit, 'end', detail)
}

function setLeftAsideWidth(width: number): void {
  drawer.left.actions.setWidth(width)
}

function setRightAsideWidth(width: number): void {
  drawer.right.actions.setWidth(width)
}

function getDockedAsideWidth(panel: LayoutPanelContext): number {
  if (!panel.state.isDock.value || panel.state.isHidden.value) {
    return 0
  }

  return panel.state.isRail.value ? panel.state.collapsedWidth.value : panel.state.width.value
}

const leftDockWidth = computed(() => getDockedAsideWidth(drawer.left))
const rightDockWidth = computed(() => getDockedAsideWidth(drawer.right))

const hasLeftAside = computed(() => hasNonEmptySlotContent(slots['left-aside']))
const hasHeader = computed(() => hasNonEmptySlotContent(slots.header))
const hasFooter = computed(() => hasNonEmptySlotContent(slots.footer))
const hasRightAside = computed(() => hasNonEmptySlotContent(slots['right-aside']))

const layoutStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  const leftDockWidth = toPx(drawer.left.state.width.value)
  const leftCollapsedWidth = toPx(drawer.left.state.collapsedWidth.value)
  const rightDockWidth = toPx(drawer.right.state.width.value)
  const rightCollapsedWidth = toPx(drawer.right.state.collapsedWidth.value)

  if (leftDockWidth) {
    style['--left-dock-width'] = leftDockWidth
  }

  if (leftCollapsedWidth) {
    style['--left-collapsed-width'] = leftCollapsedWidth
  }

  if (rightDockWidth) {
    style['--right-dock-width'] = rightDockWidth
  }

  if (rightCollapsedWidth) {
    style['--right-collapsed-width'] = rightCollapsedWidth
  }

  return style
})

const layoutClass = computed(() => ({
  'tr-layout--left-dock': hasLeftAside.value && drawer.left.state.isDock.value,
  'tr-layout--left-drawer': hasLeftAside.value && drawer.left.state.isDrawer.value,
  'tr-layout--left-expanded': hasLeftAside.value && drawer.left.state.isOpen.value,
  'tr-layout--left-rail': hasLeftAside.value && drawer.left.state.isRail.value,
  'tr-layout--right-dock': hasRightAside.value && drawer.right.state.isDock.value,
  'tr-layout--right-drawer': hasRightAside.value && drawer.right.state.isDrawer.value,
  'tr-layout--right-expanded': hasRightAside.value && drawer.right.state.isOpen.value,
  'tr-layout--right-rail': hasRightAside.value && drawer.right.state.isRail.value,
  'tr-layout--resizing': isAsideResizing.value,
}))

const layoutMode = floating.state.mode
const floatingStateValue = floating.state.value
const floatingValue = floating.state.resolved

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
    v-bind="attrs"
    :mode="layoutMode"
    :floating-state="floatingStateValue"
    :resolved-floating="floatingValue"
    :surface-class="layoutClass"
    :surface-style="layoutStyle"
    @floating-state-initialize="floating.actions.initialize"
    @floating-state-change="floating.actions.commit"
    @floating-drag-start="emit('floating-drag-start', $event)"
    @floating-drag="emit('floating-drag', $event)"
    @floating-drag-end="emit('floating-drag-end', $event)"
    @floating-resize-start="emit('floating-resize-start', $event)"
    @floating-resize="emit('floating-resize', $event)"
    @floating-resize-end="emit('floating-resize-end', $event)"
  >
    <div class="tr-layout__body">
      <AsideContent
        v-if="hasLeftAside"
        side="left"
        :opposite-dock-width="rightDockWidth"
        :collapse-effect="drawer.left.state.collapseEffect.value"
        :is-dock="drawer.left.state.isDock.value"
        :is-drawer="drawer.left.state.isDrawer.value"
        :is-open="drawer.left.state.isOpen.value"
        :is-rail="drawer.left.state.isRail.value"
        :is-hidden="drawer.left.state.isHidden.value"
        :can-resize="drawer.left.state.canResize.value"
        :min-width="drawer.left.state.minWidth.value"
        :max-width="drawer.left.state.maxWidth.value"
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
        v-if="hasRightAside"
        side="right"
        :opposite-dock-width="leftDockWidth"
        :collapse-effect="drawer.right.state.collapseEffect.value"
        :is-dock="drawer.right.state.isDock.value"
        :is-drawer="drawer.right.state.isDrawer.value"
        :is-open="drawer.right.state.isOpen.value"
        :is-rail="drawer.right.state.isRail.value"
        :is-hidden="drawer.right.state.isHidden.value"
        :can-resize="drawer.right.state.canResize.value"
        :min-width="drawer.right.state.minWidth.value"
        :max-width="drawer.right.state.maxWidth.value"
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
