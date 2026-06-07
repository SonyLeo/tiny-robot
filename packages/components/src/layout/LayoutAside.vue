<script setup lang="ts">
import { computed, onBeforeUnmount, useAttrs } from 'vue'
import { useControllableState } from './composables/useControllableState'
import { useLayout } from './composables/useLayout'
import { usePropPresence } from './composables/usePropPresence'
import type { LayoutAsideEmits, LayoutAsideRuntimeProps } from './index.type'
import { clamp } from './utils/math'

defineOptions({
  name: 'LayoutAside',
  inheritAttrs: false,
})

const props = defineProps<LayoutAsideRuntimeProps>()
const emit = defineEmits<LayoutAsideEmits>()
const attrs = useAttrs()
const layoutStore = useLayout()
const hasProp = usePropPresence()

const defaultOpenByPlacement = {
  left: true,
  right: false,
} as const

const openProvided = hasProp('open')
const defaultOpenProvided = hasProp('defaultOpen')
const widthProvided = hasProp('width')
const defaultWidthProvided = hasProp('defaultWidth')

const openState = useControllableState<boolean>({
  value: () => (openProvided ? props.open : undefined),
  defaultValue: () => (defaultOpenProvided ? props.defaultOpen : defaultOpenByPlacement[props.placement]),
  isControlled: openProvided,
  onChange: (nextOpen) => emit('update:open', nextOpen),
})

const widthState = useControllableState<number>({
  value: () => (widthProvided ? props.width : undefined),
  defaultValue: () => (defaultWidthProvided ? props.defaultWidth : undefined),
  isControlled: widthProvided,
  onChange: (nextWidth) => emit('update:width', nextWidth),
})

const resolvedOpen = computed(() => openState.resolvedState.value ?? defaultOpenByPlacement[props.placement])
const layoutMode = computed(() => props.mode ?? 'dock')
const collapsedWidth = computed(() => props.collapsedWidth)
const minWidth = computed(() => props.minWidth ?? (props.placement === 'left' ? 200 : 240))
const maxWidth = computed(() => props.maxWidth ?? (props.placement === 'left' ? 560 : 640))
const resizable = computed(() => props.resizable ?? false)
const isDock = computed(() => layoutMode.value === 'dock')
const isDrawer = computed(() => layoutMode.value === 'drawer')
const isRail = computed(() => isDock.value && !resolvedOpen.value && (collapsedWidth.value ?? 0) > 0)
const isHidden = computed(() => !resolvedOpen.value && (isDrawer.value || !isRail.value))
const resolvedWidth = computed(() => {
  const nextWidth = widthState.resolvedState.value

  if (nextWidth === undefined || !Number.isFinite(nextWidth)) {
    return undefined
  }

  return clamp(nextWidth, minWidth.value, maxWidth.value)
})

function commitOpen(nextOpen: boolean): void {
  if (resolvedOpen.value === nextOpen) {
    return
  }

  openState.commit(nextOpen)
}

function commitWidth(nextWidth: number): void {
  const clampedWidth = clamp(nextWidth, minWidth.value, maxWidth.value)
  if (resolvedWidth.value === clampedWidth) {
    return
  }

  widthState.commit(clampedWidth)
}

layoutStore.registerPanel({
  placement: props.placement,
  layoutMode,
  isOpen: resolvedOpen,
  width: resolvedWidth,
  collapsedWidth,
  minWidth,
  maxWidth,
  resizable,
  commitOpen,
  commitWidth,
})

onBeforeUnmount(() => {
  layoutStore.unregisterPanel(props.placement)
})

const slotProps = computed(() => ({
  isOpen: resolvedOpen.value,
}))

const collapseEffect = computed(() => props.collapseEffect ?? 'overlay')
</script>

<template>
  <aside
    v-bind="attrs"
    class="tr-layout-aside"
    data-part="aside-content"
    :data-placement="props.placement"
    :data-collapse-effect="collapseEffect"
    :class="{
      'tr-layout-aside--left': props.placement === 'left',
      'tr-layout-aside--right': props.placement === 'right',
      'tr-layout-aside--dock': isDock,
      'tr-layout-aside--drawer': isDrawer,
      'tr-layout-aside--expanded': resolvedOpen,
      'tr-layout-aside--rail': isRail,
      'tr-layout-aside--hidden': isHidden,
      'tr-layout-aside--effect-overlay': collapseEffect === 'overlay',
      'tr-layout-aside--effect-slide': collapseEffect === 'slide',
    }"
  >
    <slot v-bind="slotProps" />
  </aside>
</template>

<style lang="less" scoped>
.tr-layout-aside {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;

  &--drawer {
    width: var(--tr-layout-drawer-width, max-content);
    max-width: 100%;
  }

  &--dock {
    width: 100%;
    transition:
      transform var(--transition-duration) var(--transition-easing),
      opacity var(--transition-duration) var(--transition-easing);
    will-change: transform, opacity;

    &.tr-layout-aside--hidden {
      opacity: 0;
      pointer-events: none;
    }

    &.tr-layout-aside--left {
      width: var(--left-dock-width);

      &.tr-layout-aside--rail {
        width: var(--left-collapsed-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--left-dock-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--left-dock-width);
          transform: translateX(calc(var(--left-collapsed-width) - var(--left-dock-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(-100% - var(--hidden-offset)));
      }
    }

    &.tr-layout-aside--right {
      width: var(--right-dock-width);
      margin-inline-start: auto;

      &.tr-layout-aside--rail {
        width: var(--right-collapsed-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--right-dock-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--right-dock-width);
          transform: translateX(calc(var(--right-dock-width) - var(--right-collapsed-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(100% + var(--hidden-offset)));
      }
    }
  }
}
</style>
