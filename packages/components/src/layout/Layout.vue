<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { computed, ref, useSlots } from 'vue'
import AsideResizeTrigger from './components/AsideResizeTrigger.vue'
import SurfaceResizeTrigger from './components/SurfaceResizeTrigger.vue'
import { createLayoutStore } from './composables/createLayoutStore'
import { useLayoutInteractions } from './composables/useLayoutInteractions'
import { provideLayoutStore } from './composables/useLayout'
import { useLayoutSurface } from './composables/useLayoutSurface'
import { useLayoutViewState } from './composables/useLayoutViewState'
import type { LayoutEmits, LayoutProps } from './index.type'
import { createLayoutAsideStoreInput } from './utils'

defineOptions({
  name: 'Layout',
})

const props = defineProps<LayoutProps>()

const emit = defineEmits<LayoutEmits>()

const modeState = useVModel(props, 'mode', emit, { passive: true })
const floatingState = useVModel(props, 'floating', emit, { passive: true, deep: true })
const leftAsideState = useVModel(props, 'leftAside', emit, { passive: true, deep: true })
const rightAsideState = useVModel(props, 'rightAside', emit, { passive: true, deep: true })
const surfaceFrameRef = ref<HTMLElement | null>(null)
const surfaceDragHandleRef = ref<HTMLElement | null>(null)
const layoutRootRef = ref<HTMLElement | null>(null)
const leftAsideRef = ref<HTMLElement | null>(null)
const rightAsideRef = ref<HTMLElement | null>(null)

const layoutStore = createLayoutStore({
  left: createLayoutAsideStoreInput(leftAsideState),
  right: createLayoutAsideStoreInput(rightAsideState),
})

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
  hasMain,
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
  modeState,
  floatingState,
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
</script>

<template>
  <div v-show="!isFloating" class="tr-layout-host" data-part="surface-host">
    <Teleport to="body" :disabled="!isFloating">
      <div
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
            :class="leftAsideClass"
            data-part="aside"
            data-placement="left"
            :data-resizable="leftResizeVisible ? '' : undefined"
            :aria-hidden="leftAsideHidden ? 'true' : undefined"
            :inert="leftAsideHidden"
          >
            <slot name="left-aside" />
            <AsideResizeTrigger
              v-if="leftResizeVisible"
              placement="left"
              :dragging-placement="draggingPlacement"
              @pointerdown="leftHandleProps.onPointerdown"
            />
          </div>

          <div
            class="tr-layout__header-shell"
            :class="{ 'tr-layout__header-shell--active': hasHeader }"
            :aria-hidden="hasHeader ? undefined : 'true'"
          >
            <div class="tr-layout__header-inner">
              <header class="tr-layout__header">
                <slot name="header" />
              </header>
            </div>
          </div>

          <div class="tr-layout__main-shell" :aria-hidden="hasMain ? undefined : 'true'">
            <div class="tr-layout__main-inner">
              <slot name="main" />
            </div>
          </div>

          <div
            class="tr-layout__footer-shell"
            :class="{ 'tr-layout__footer-shell--active': hasFooter }"
            :aria-hidden="hasFooter ? undefined : 'true'"
          >
            <div class="tr-layout__footer-inner">
              <footer class="tr-layout__footer">
                <slot name="footer" />
              </footer>
            </div>
          </div>

          <div
            ref="rightAsideRef"
            class="tr-layout__aside tr-layout__aside--right"
            :class="rightAsideClass"
            data-part="aside"
            data-placement="right"
            :data-resizable="rightResizeVisible ? '' : undefined"
            :aria-hidden="rightAsideHidden ? 'true' : undefined"
            :inert="rightAsideHidden"
          >
            <AsideResizeTrigger
              v-if="rightResizeVisible"
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
            :aria-hidden="isDrawerVisible ? undefined : 'true'"
            @click="closeDrawers"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.tr-layout-host {
  width: 100%;
  min-height: 0;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  overflow: hidden;
}

.tr-layout-surface {
  position: relative;
  width: 100%;
  height: 100%;
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
    border: 1px solid color-mix(in srgb, var(--tr-text-primary, #111827) 6%, transparent);
    box-shadow: var(--tr-layout-surface-shadow);
    z-index: var(--tr-layout-surface-z-index);
    outline: 1px solid color-mix(in srgb, var(--tr-container-bg-default, #ffffff) 52%, transparent);
    outline-offset: -1px;

    > .tr-layout {
      box-sizing: border-box;
      overflow: hidden;
      border-radius: inherit;
      padding-top: calc(var(--tr-layout-surface-drag-hit-height) + 8px);
    }
  }

  &__drag-bar {
    position: absolute;
    top: 8px;
    left: 50%;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tr-layout-surface-drag-hit-width);
    height: var(--tr-layout-surface-drag-hit-height);
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
      width: var(--tr-layout-surface-drag-pill-width);
      height: var(--tr-layout-surface-drag-pill-height);
      border-radius: 999px;
      background: var(--tr-layout-surface-drag-pill-bg);
      box-shadow: var(--tr-layout-surface-drag-pill-shadow);
    }

    &--draggable {
      cursor: grab;

      &:hover::before {
        background: var(--tr-layout-surface-drag-hover-bg);
        border-color: var(--tr-layout-surface-drag-hover-border);
        box-shadow: var(--tr-layout-surface-drag-hover-shadow);
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
  --tr-layout-left-width: 0px;
  --tr-layout-right-width: 0px;
  display: grid;
  grid-template-columns: var(--tr-layout-left-width, 0px) minmax(0, 1fr) var(--tr-layout-right-width, 0px);
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
  color: var(--tr-layout-text-primary);
  transition: grid-template-columns var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease);

  &--resizing {
    cursor: col-resize;
    transition: none;

    &,
    * {
      user-select: none;
    }
  }

  &--left-dock&--left-expanded {
    --tr-layout-left-width: var(--tr-layout-left-expanded-width);
  }

  &--left-dock&--left-rail {
    --tr-layout-left-width: var(--tr-layout-left-collapsed-width);
  }

  &--right-dock&--right-expanded {
    --tr-layout-right-width: var(--tr-layout-right-expanded-width);
  }

  &--right-dock&--right-rail {
    --tr-layout-right-width: var(--tr-layout-right-collapsed-width);
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
    max-width: var(--tr-layout-header-max-width, var(--tr-layout-content-max-width, 960px));
    margin-inline-start: var(--tr-layout-header-margin-inline-start, auto);
    margin-inline-end: var(--tr-layout-header-margin-inline-end, auto);
    padding-inline: var(--tr-layout-header-padding-inline, var(--tr-layout-inner-padding-inline));
    padding-top: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-top));
    padding-bottom: var(--tr-layout-inner-padding-block);
  }

  &__main-inner {
    max-width: var(--tr-layout-main-max-width, var(--tr-layout-content-max-width, 960px));
    margin-inline-start: var(--tr-layout-main-margin-inline-start, auto);
    margin-inline-end: var(--tr-layout-main-margin-inline-end, auto);
    padding-inline: var(--tr-layout-main-padding-inline, var(--tr-layout-inner-padding-inline));
    min-height: 100%;
    height: 100%;
  }

  &__footer-inner {
    max-width: var(--tr-layout-footer-max-width, var(--tr-layout-content-max-width, 960px));
    margin-inline-start: var(--tr-layout-footer-margin-inline-start, auto);
    margin-inline-end: var(--tr-layout-footer-margin-inline-end, auto);
    padding-inline: var(--tr-layout-footer-padding-inline, var(--tr-layout-inner-padding-inline));
    padding-top: var(--tr-layout-inner-padding-block);
    padding-bottom: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-bottom));
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    z-index: calc(var(--tr-layout-z-index-overlay) - 1);
    border: 0;
    background: var(--tr-layout-overlay-bg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    cursor: pointer;
    transition:
      opacity var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease),
      visibility var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease);

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
      z-index: var(--tr-layout-z-index-overlay);
      max-width: 100%;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
      box-shadow: var(--tr-layout-panel-shadow);
      will-change: transform;
      transition:
        transform var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease),
        visibility var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease);

      &.tr-layout__aside--left {
        left: 0;
        width: min(var(--tr-layout-left-expanded-width), 100%);
        transform: translateX(-100%);
      }

      &.tr-layout__aside--right {
        right: 0;
        width: min(var(--tr-layout-right-expanded-width), 100%);
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
