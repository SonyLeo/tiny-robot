<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from 'vue'
import AsideResizeTrigger from './components/AsideResizeTrigger.vue'
import SurfaceResizeTrigger from './components/SurfaceResizeTrigger.vue'
import { createLayoutStore } from './composables/createLayoutStore'
import { useControllableLayoutState } from './composables/useControllableLayoutState'
import { useLayoutInteractions } from './composables/useLayoutInteractions'
import { provideLayoutStore } from './composables/useLayout'
import { useLayoutSurface } from './composables/useLayoutSurface'
import { useLayoutViewState } from './composables/useLayoutViewState'
import type { LayoutEmits, LayoutProps } from './index.type'

defineOptions({
  name: 'Layout',
  inheritAttrs: false,
})

const props = defineProps<LayoutProps>()

const emit = defineEmits<LayoutEmits>()
const attrs = useAttrs()

const { resolvedMode, resolvedFloating, commitFloating } = useControllableLayoutState(props, emit)
const surfaceFrameRef = ref<HTMLElement | null>(null)
const surfaceDragHandleRef = ref<HTMLElement | null>(null)
const layoutRootRef = ref<HTMLElement | null>(null)
const leftAsideRef = ref<HTMLElement | null>(null)
const rightAsideRef = ref<HTMLElement | null>(null)

const layoutStore = createLayoutStore()

provideLayoutStore(layoutStore)

const slots = useSlots()
const { closeDrawers, left, right } = layoutStore
const isDrawerVisible = computed(() => layoutStore.isDrawerVisible)
const {
  isResizing: isAsideResizing,
  draggingPlacement,
  leftHandleProps,
  rightHandleProps,
} = useLayoutInteractions({
  rootRef: layoutRootRef,
  leftAsideRef,
  rightAsideRef,
  left,
  right,
  isDrawerVisible,
  closeDrawers,
  onResizeStart: (detail) => emit('aside-resize-start', detail),
  onResize: (detail) => emit('aside-resize', detail),
  onResizeEnd: (detail) => emit('aside-resize-end', detail),
})

const {
  hasHeader,
  hasFooter,
  leftAsideHidden,
  rightAsideHidden,
  leftResizeVisible,
  rightResizeVisible,
  layoutStyle,
  layoutClass,
  leftAsideClass,
  rightAsideClass,
} = useLayoutViewState({
  slots,
  left,
  right,
  isResizing: isAsideResizing,
})

const {
  isFloating,
  showDragBar,
  showResizeHandles,
  surfaceClass,
  surfaceStyle,
  dragBarClass,
  activeResizeEdge,
  leftResizeHandleProps,
  rightResizeHandleProps,
} = useLayoutSurface({
  mode: resolvedMode,
  floating: resolvedFloating,
  commitFloating,
  frameRef: surfaceFrameRef,
  dragHandleRef: surfaceDragHandleRef,
  onFloatingResizeStart: (detail) => emit('floating-resize-start', detail),
  onFloatingResize: (detail) => emit('floating-resize', detail),
  onFloatingResizeEnd: (detail) => emit('floating-resize-end', detail),
})

const layoutRootStyle = computed(() => ({
  ...layoutStyle.value,
  '--tr-layout-height': '100%',
}))

const toAriaHidden = (hidden: boolean) => (hidden ? 'true' : undefined)
</script>

<template>
  <div v-show="!isFloating" class="tr-layout-host" data-part="surface-host">
    <Teleport to="body" :disabled="!isFloating">
      <div
        v-bind="attrs"
        ref="surfaceFrameRef"
        class="tr-layout-surface"
        :class="surfaceClass"
        :style="surfaceStyle"
        data-part="surface"
        :data-resizing-edge="activeResizeEdge ?? undefined"
      >
        <div
          v-if="showDragBar"
          ref="surfaceDragHandleRef"
          class="tr-layout-surface__drag-bar"
          :class="dragBarClass"
          data-part="surface-drag-bar"
        />

        <SurfaceResizeTrigger
          v-if="showResizeHandles"
          edge="left"
          :active="activeResizeEdge === 'left'"
          @pointerdown="leftResizeHandleProps.onPointerdown"
        />
        <SurfaceResizeTrigger
          v-if="showResizeHandles"
          edge="right"
          :active="activeResizeEdge === 'right'"
          @pointerdown="rightResizeHandleProps.onPointerdown"
        />

        <div
          ref="layoutRootRef"
          class="tr-layout"
          :style="layoutRootStyle"
          :class="layoutClass"
          data-part="root"
          :data-dragging="draggingPlacement ?? undefined"
        >
          <div
            ref="leftAsideRef"
            class="tr-layout__aside tr-layout__aside--left"
            :class="[leftAsideClass, left.containerClass]"
            :style="left.containerStyle"
            data-part="aside"
            data-placement="left"
            :data-resizable="leftResizeVisible() ? '' : undefined"
            :aria-hidden="toAriaHidden(leftAsideHidden())"
            :inert="leftAsideHidden()"
          >
            <AsideResizeTrigger
              v-if="leftResizeVisible()"
              placement="left"
              :dragging-placement="draggingPlacement"
              @pointerdown="leftHandleProps.onPointerdown"
            />
            <slot name="left-aside" />
          </div>

          <div class="tr-layout__header-shell" :class="{ 'tr-layout__header-shell--active': hasHeader() }">
            <div class="tr-layout__header-inner">
              <header class="tr-layout__header">
                <slot name="header" />
              </header>
            </div>
          </div>

          <div class="tr-layout__main-shell">
            <div class="tr-layout__main-inner">
              <slot name="main" />
            </div>
          </div>

          <div class="tr-layout__footer-shell" :class="{ 'tr-layout__footer-shell--active': hasFooter() }">
            <div class="tr-layout__footer-inner">
              <footer class="tr-layout__footer">
                <slot name="footer" />
              </footer>
            </div>
          </div>

          <div
            ref="rightAsideRef"
            class="tr-layout__aside tr-layout__aside--right"
            :class="[rightAsideClass, right.containerClass]"
            :style="right.containerStyle"
            data-part="aside"
            data-placement="right"
            :data-resizable="rightResizeVisible() ? '' : undefined"
            :aria-hidden="toAriaHidden(rightAsideHidden())"
            :inert="rightAsideHidden()"
          >
            <AsideResizeTrigger
              v-if="rightResizeVisible()"
              placement="right"
              :dragging-placement="draggingPlacement"
              @pointerdown="rightHandleProps.onPointerdown"
            />
            <slot name="right-aside" />
          </div>

          <button
            class="tr-layout__backdrop"
            :class="{ 'tr-layout__backdrop--active': isDrawerVisible }"
            data-part="backdrop"
            type="button"
            :tabindex="isDrawerVisible ? 0 : -1"
            :aria-hidden="toAriaHidden(!isDrawerVisible)"
            @click="closeDrawers"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.tr-layout-host {
  display: contents;
}

.tr-layout-surface {
  position: relative;
  width: 100%;
  min-height: 0;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  background: var(--tr-layout-bg);

  &--normal {
    overflow: hidden;
    border-radius: 0;
    box-shadow: none;
  }

  &--floating {
    position: fixed;
    overflow: visible;
    background: var(--tr-layout-bg);
    border-radius: var(--tr-layout-surface-radius);
    border: 1px solid var(--border-color);
    box-shadow: var(--tr-layout-surface-shadow);
    z-index: var(--tr-layout-surface-z-index);
    outline: 1px solid var(--outline-color);
    outline-offset: -1px;

    > .tr-layout {
      box-sizing: border-box;
      overflow: hidden;
      border-radius: inherit;
      padding-top: calc(var(--drag-hit-height) + var(--drag-bar-top));
    }
  }

  &__drag-bar {
    position: absolute;
    top: var(--drag-bar-top);
    left: 50%;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--drag-hit-width);
    height: var(--drag-hit-height);
    transform: translateX(-50%);
    touch-action: none;
    user-select: none;

    &::before {
      content: '';
      position: absolute;
      inset: 1px 3px;
      border-radius: 999px;
      background: transparent;
      border: 1px solid transparent;
      box-shadow: none;
      transition:
        background-color 180ms ease,
        border-color 180ms ease,
        box-shadow 180ms ease;
    }

    &::after {
      content: '';
      position: relative;
      display: block;
      width: var(--drag-pill-width);
      height: var(--drag-pill-height);
      border-radius: 999px;
      background: var(--drag-pill-bg);
      box-shadow: var(--drag-pill-shadow);
    }

    &--draggable {
      cursor: grab;

      &:hover::before {
        background: var(--drag-hover-bg);
        border-color: var(--drag-hover-border);
        box-shadow: var(--drag-hover-shadow);
      }
    }
  }

  &--dragging &__drag-bar--draggable {
    cursor: grabbing;
  }

  &--resizing {
    cursor: col-resize;

    &,
    * {
      user-select: none;
    }

    .tr-layout-surface__drag-bar--draggable {
      cursor: default;
      pointer-events: none;

      &::before {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
      }
    }
  }

  &--dragging {
    .tr-layout-surface__drag-bar--draggable::before {
      background: transparent;
      border-color: transparent;
      box-shadow: none;
    }

    :deep(.tr-layout-surface__resize-trigger) {
      pointer-events: none;
    }
  }
}

.tr-layout {
  /* 组件局部桥接变量 */
  --left-width: 0px;
  --right-width: 0px;
  --left-rail-width: 0px;
  --right-rail-width: 0px;
}

.tr-layout {
  display: grid;
  grid-template-columns:
    var(--left-width)
    minmax(var(--tr-layout-main-min-width, 320px), 1fr)
    var(--right-width);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'left header right'
    'left main right'
    'left footer right';
  position: relative;
  isolation: isolate;
  min-height: 0;
  width: 100%;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  overflow: hidden;
  background: var(--tr-layout-bg);
  color: var(--tr-text-primary);
  transition: grid-template-columns var(--transition-duration) var(--transition-easing);

  &--resizing {
    cursor: col-resize;
    transition: none;

    &,
    * {
      user-select: none;
    }
  }

  &--left-dock&--left-expanded {
    --left-width: var(--left-dock-width);
  }

  &--left-dock&--left-rail {
    --left-width: var(--left-rail-width);
  }

  &--right-dock&--right-expanded {
    --right-width: var(--right-dock-width);
  }

  &--right-dock&--right-rail {
    --right-width: var(--right-rail-width);
  }

  &__aside,
  &__header-shell,
  &__footer-shell,
  &__main-shell {
    min-width: 0;
    min-height: 0;
  }

  &__header-shell,
  &__footer-shell {
    display: none;
  }

  &__header-shell {
    grid-area: header;
    background: var(--tr-layout-header-bg);

    &--active {
      display: block;
    }
  }

  &__footer-shell {
    grid-area: footer;
    background: var(--tr-layout-footer-bg);

    &--active {
      display: block;
    }
  }

  &__main-shell {
    grid-area: main;
    overflow: hidden;
    background: var(--tr-layout-main-bg);
  }

  &__header-inner,
  &__main-inner,
  &__footer-inner {
    width: 100%;
    box-sizing: border-box;
  }

  &__header-inner {
    max-width: var(--tr-layout-content-max-width, 960px);
    margin-inline-start: auto;
    margin-inline-end: auto;
    padding-inline: var(--tr-layout-inner-padding-inline);
    padding-top: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-top));
    padding-bottom: var(--tr-layout-inner-padding-block);
  }

  &__main-inner {
    max-width: var(--tr-layout-content-max-width, 960px);
    margin-inline-start: auto;
    margin-inline-end: auto;
    padding-inline: var(--tr-layout-inner-padding-inline);
    min-height: 100%;
    height: 100%;
  }

  &__footer-inner {
    max-width: var(--tr-layout-content-max-width, 960px);
    margin-inline-start: auto;
    margin-inline-end: auto;
    padding-inline: var(--tr-layout-inner-padding-inline);
    padding-top: var(--tr-layout-inner-padding-block);
    padding-bottom: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-bottom));
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    z-index: calc(var(--overlay-z-index) - 1);
    border: 0;
    background: var(--tr-layout-overlay-bg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    cursor: pointer;
    transition:
      opacity var(--transition-duration) var(--transition-easing),
      visibility var(--transition-duration) var(--transition-easing);

    &--active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }

  &__header,
  &__footer {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__aside {
    position: relative;
    overflow: hidden;

    &--left {
      grid-area: left;
      background: var(--tr-layout-left-bg);
      border-inline-end: 1px solid var(--tr-layout-divider-color);
    }

    &--right {
      grid-area: right;
      background: var(--tr-layout-right-bg);
      border-inline-start: 1px solid var(--tr-layout-divider-color);
    }

    &:not(.tr-layout__aside--active),
    &--hidden {
      border-color: transparent;
    }

    &--dock {
      position: relative;
      z-index: 1;
      overflow: visible;

      &.tr-layout__aside--rail {
        overflow: hidden;
      }
    }

    &--drawer {
      position: absolute;
      grid-area: auto;
      top: 0;
      bottom: 0;
      z-index: var(--overlay-z-index);
      max-width: 100%;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
      box-shadow: var(--tr-layout-panel-shadow);
      will-change: transform;
      transition:
        transform var(--transition-duration) var(--transition-easing),
        visibility var(--transition-duration) var(--transition-easing);

      &.tr-layout__aside--left {
        --drawer-width: var(--tr-layout-drawer-width, var(--left-drawer-width));
        left: 0;
        width: min(var(--drawer-width), 100%);
        transform: translateX(-100%);
      }

      &.tr-layout__aside--right {
        --drawer-width: var(--tr-layout-drawer-width, var(--right-drawer-width));
        right: 0;
        width: min(var(--drawer-width), 100%);
        transform: translateX(100%);
      }

      &.tr-layout__aside--expanded {
        visibility: visible;
        pointer-events: auto;
        transform: translateX(0);
      }
    }
  }
}
</style>
