import { Comment, Fragment, Text, computed, isVNode, toValue, type MaybeRefOrGetter, type Slot, type Slots } from 'vue'
import type { LayoutPanelApi } from '../internal.type'

interface UseLayoutViewStateOptions {
  slots: Slots
  left: LayoutPanelApi
  right: LayoutPanelApi
  isResizing: MaybeRefOrGetter<boolean>
}

function hasRenderableValue(value: unknown): boolean {
  if (value == null) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function hasRenderableChildren(children: unknown): boolean {
  if (!Array.isArray(children)) {
    return hasRenderableValue(children)
  }

  return children.some((child) => {
    if (!isVNode(child)) {
      return hasRenderableValue(child)
    }

    if (child.type === Comment) {
      return false
    }

    if (child.type === Text) {
      return hasRenderableValue(child.children)
    }

    if (child.type === Fragment) {
      return hasRenderableChildren(child.children)
    }

    return true
  })
}

function hasRenderableSlot(slot?: Slot): boolean {
  return hasRenderableChildren(slot?.())
}

export function useLayoutViewState(options: UseLayoutViewStateOptions) {
  const hasLeftAside = () => hasRenderableSlot(options.slots['left-aside'])
  const hasHeader = () => hasRenderableSlot(options.slots.header)
  const hasFooter = () => hasRenderableSlot(options.slots.footer)
  const hasRightAside = () => hasRenderableSlot(options.slots['right-aside'])

  const leftAsideHidden = () => !hasLeftAside() || options.left.isHidden
  const rightAsideHidden = () => !hasRightAside() || options.right.isHidden
  const leftResizeVisible = () => hasLeftAside() && options.left.canResize
  const rightResizeVisible = () => hasRightAside() && options.right.canResize

  const layoutStyle = computed(() => ({
    '--tr-layout-left-expanded-width': options.left.expandedWidth,
    '--tr-layout-left-collapsed-width': options.left.collapsedWidth,
    '--tr-layout-right-expanded-width': options.right.expandedWidth,
    '--tr-layout-right-collapsed-width': options.right.collapsedWidth,
  }))

  const layoutClass = computed(() => ({
    'tr-layout--left-dock': hasLeftAside() && options.left.isDock,
    'tr-layout--left-drawer': hasLeftAside() && options.left.isDrawer,
    'tr-layout--left-expanded': hasLeftAside() && options.left.isExpanded,
    'tr-layout--left-rail': hasLeftAside() && options.left.isRail,
    'tr-layout--right-dock': hasRightAside() && options.right.isDock,
    'tr-layout--right-drawer': hasRightAside() && options.right.isDrawer,
    'tr-layout--right-expanded': hasRightAside() && options.right.isExpanded,
    'tr-layout--right-rail': hasRightAside() && options.right.isRail,
    'tr-layout--resizing': toValue(options.isResizing),
  }))

  const leftAsideClass = computed(() => ({
    'tr-layout__aside--active': hasLeftAside(),
    'tr-layout__aside--dock': options.left.isDock,
    'tr-layout__aside--drawer': options.left.isDrawer,
    'tr-layout__aside--expanded': options.left.isExpanded,
    'tr-layout__aside--rail': options.left.isRail,
    'tr-layout__aside--hidden': options.left.isHidden,
  }))

  const rightAsideClass = computed(() => ({
    'tr-layout__aside--active': hasRightAside(),
    'tr-layout__aside--dock': options.right.isDock,
    'tr-layout__aside--drawer': options.right.isDrawer,
    'tr-layout__aside--expanded': options.right.isExpanded,
    'tr-layout__aside--rail': options.right.isRail,
    'tr-layout__aside--hidden': options.right.isHidden,
  }))

  return {
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
  }
}
