import { computed, toValue, type MaybeRefOrGetter, type Slots } from 'vue'
import type { LayoutPanelApi } from '../internal.type'

interface UseLayoutViewStateOptions {
  slots: Slots
  left: LayoutPanelApi
  right: LayoutPanelApi
  isResizing: MaybeRefOrGetter<boolean>
}

export function useLayoutViewState(options: UseLayoutViewStateOptions) {
  const hasLeftAside = computed(() => Boolean(options.slots['left-aside']))
  const hasHeader = computed(() => Boolean(options.slots.header))
  const hasMain = computed(() => Boolean(options.slots.main))
  const hasFooter = computed(() => Boolean(options.slots.footer))
  const hasRightAside = computed(() => Boolean(options.slots['right-aside']))

  const leftAsideHidden = computed(() => !hasLeftAside.value || options.left.isHidden)
  const rightAsideHidden = computed(() => !hasRightAside.value || options.right.isHidden)
  const leftResizeVisible = computed(() => hasLeftAside.value && options.left.canResize)
  const rightResizeVisible = computed(() => hasRightAside.value && options.right.canResize)

  const layoutStyle = computed(() => ({
    '--tr-layout-left-expanded-width': options.left.expandedWidth,
    '--tr-layout-left-collapsed-width': options.left.collapsedWidth,
    '--tr-layout-right-expanded-width': options.right.expandedWidth,
    '--tr-layout-right-collapsed-width': options.right.collapsedWidth,
  }))

  const layoutClass = computed(() => ({
    'tr-layout--left-dock': hasLeftAside.value && options.left.isDock,
    'tr-layout--left-drawer': hasLeftAside.value && options.left.isDrawer,
    'tr-layout--left-expanded': hasLeftAside.value && options.left.isExpanded,
    'tr-layout--left-rail': hasLeftAside.value && options.left.isRail,
    'tr-layout--right-dock': hasRightAside.value && options.right.isDock,
    'tr-layout--right-drawer': hasRightAside.value && options.right.isDrawer,
    'tr-layout--right-expanded': hasRightAside.value && options.right.isExpanded,
    'tr-layout--right-rail': hasRightAside.value && options.right.isRail,
    'tr-layout--resizing': toValue(options.isResizing),
  }))

  const leftAsideClass = computed(() => ({
    'tr-layout__aside--active': hasLeftAside.value,
    'tr-layout__aside--dock': options.left.isDock,
    'tr-layout__aside--drawer': options.left.isDrawer,
    'tr-layout__aside--expanded': options.left.isExpanded,
    'tr-layout__aside--rail': options.left.isRail,
    'tr-layout__aside--hidden': options.left.isHidden,
  }))

  const rightAsideClass = computed(() => ({
    'tr-layout__aside--active': hasRightAside.value,
    'tr-layout__aside--dock': options.right.isDock,
    'tr-layout__aside--drawer': options.right.isDrawer,
    'tr-layout__aside--expanded': options.right.isExpanded,
    'tr-layout__aside--rail': options.right.isRail,
    'tr-layout__aside--hidden': options.right.isHidden,
  }))

  return {
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
  }
}
