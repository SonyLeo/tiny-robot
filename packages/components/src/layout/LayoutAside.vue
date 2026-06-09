<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useLayoutPanel } from './composables/useLayoutPanel'
import type { LayoutAsideInternalProps } from './internal.type'

defineOptions({
  name: 'LayoutAside',
  inheritAttrs: false,
})

const props = defineProps<LayoutAsideInternalProps>()
const attrs = useAttrs()
const { isOpen, isDock, isDrawer, isRail, isHidden } = useLayoutPanel(() => props.placement)

const slotProps = computed(() => ({
  isOpen: isOpen.value,
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
      'tr-layout-aside--expanded': isOpen,
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
