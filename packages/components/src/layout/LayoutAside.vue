<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutAside } from './composables/useLayoutAside'
import type { LayoutAsideProps } from './index.type'

defineOptions({
  name: 'LayoutAside',
})

const props = defineProps<LayoutAsideProps>()

const { isExpanded, isDock, isDrawer, isRail, isHidden } = useLayoutAside(() => props.placement)

const slotProps = computed(() => ({
  isExpanded: isExpanded.value,
}))

const collapseEffect = computed(() => props.collapseEffect ?? 'overlay')
</script>

<template>
  <aside
    class="tr-layout-aside"
    data-part="aside-content"
    :data-placement="props.placement"
    :class="{
      'tr-layout-aside--left': props.placement === 'left',
      'tr-layout-aside--right': props.placement === 'right',
      'tr-layout-aside--dock': isDock,
      'tr-layout-aside--drawer': isDrawer,
      'tr-layout-aside--expanded': isExpanded,
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

  &--dock {
    width: 100%;
    transition:
      transform var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease),
      opacity var(--tr-layout-transition-duration, 220ms) var(--tr-layout-transition-easing, ease);
    will-change: transform, opacity;

    &.tr-layout-aside--hidden {
      opacity: 0;
      pointer-events: none;
    }

    &.tr-layout-aside--left {
      width: var(--tr-layout-left-expanded-width);

      &.tr-layout-aside--rail {
        width: var(--tr-layout-left-collapsed-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--tr-layout-left-expanded-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--tr-layout-left-expanded-width);
          transform: translateX(calc(var(--tr-layout-left-collapsed-width) - var(--tr-layout-left-expanded-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(-100% - 12px));
      }
    }

    &.tr-layout-aside--right {
      width: var(--tr-layout-right-expanded-width);
      margin-inline-start: auto;

      &.tr-layout-aside--rail {
        width: var(--tr-layout-right-collapsed-width);

        &.tr-layout-aside--effect-overlay {
          width: var(--tr-layout-right-expanded-width);
        }

        &.tr-layout-aside--effect-slide {
          width: var(--tr-layout-right-expanded-width);
          transform: translateX(calc(var(--tr-layout-right-expanded-width) - var(--tr-layout-right-collapsed-width)));
        }
      }

      &.tr-layout-aside--hidden {
        transform: translateX(calc(100% + 12px));
      }
    }
  }
}
</style>
