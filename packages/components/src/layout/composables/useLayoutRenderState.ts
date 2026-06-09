import { computed, toValue, type MaybeRefOrGetter, type Slots } from 'vue'
import type { LayoutAsideSlotProps } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'
import { hasRenderableSlot, toPx } from '../utils/layoutRender'

interface UseLayoutRenderStateOptions {
  slots: Slots
  left: LayoutPanelApi
  right: LayoutPanelApi
  isResizing: MaybeRefOrGetter<boolean>
}

function createAsideSlotProps(panel: LayoutPanelApi, placement: 'left' | 'right'): LayoutAsideSlotProps {
  return {
    placement,
    mode: panel.layoutMode,
    open: panel.isOpen,
    expandedWidth: panel.width,
    collapsedWidth: panel.collapsedWidth,
    resizable: panel.resizable,
    toggle: panel.toggle,
    setOpen: panel.setOpen,
    setExpandedWidth: panel.setWidth,
  }
}

export function useLayoutRenderState({ slots, left, right, isResizing }: UseLayoutRenderStateOptions) {
  const hasLeftAside = () => hasRenderableSlot(slots['left-aside'])
  const hasHeader = () => hasRenderableSlot(slots.header)
  const hasFooter = () => hasRenderableSlot(slots.footer)
  const hasRightAside = () => hasRenderableSlot(slots['right-aside'])

  const leftAsideHidden = () => !hasLeftAside() || left.isHidden
  const rightAsideHidden = () => !hasRightAside() || right.isHidden
  const leftResizeVisible = () => hasLeftAside() && left.canResize
  const rightResizeVisible = () => hasRightAside() && right.canResize

  const leftAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(left, 'left'))

  const rightAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(right, 'right'))

  const layoutStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const leftDockWidth = toPx(left.width)
    const leftCollapsedWidth = toPx(left.collapsedWidth)
    const rightDockWidth = toPx(right.width)
    const rightCollapsedWidth = toPx(right.collapsedWidth)

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
    'tr-layout--left-dock': hasLeftAside() && left.isDock,
    'tr-layout--left-drawer': hasLeftAside() && left.isDrawer,
    'tr-layout--left-expanded': hasLeftAside() && left.isOpen,
    'tr-layout--left-rail': hasLeftAside() && left.isRail,
    'tr-layout--right-dock': hasRightAside() && right.isDock,
    'tr-layout--right-drawer': hasRightAside() && right.isDrawer,
    'tr-layout--right-expanded': hasRightAside() && right.isOpen,
    'tr-layout--right-rail': hasRightAside() && right.isRail,
    'tr-layout--resizing': toValue(isResizing),
  }))

  const leftAsideClass = computed(() => ({
    'tr-layout__aside--active': hasLeftAside(),
    'tr-layout__aside--dock': left.isDock,
    'tr-layout__aside--drawer': left.isDrawer,
    'tr-layout__aside--expanded': left.isOpen,
    'tr-layout__aside--rail': left.isRail,
    'tr-layout__aside--hidden': left.isHidden,
  }))

  const rightAsideClass = computed(() => ({
    'tr-layout__aside--active': hasRightAside(),
    'tr-layout__aside--dock': right.isDock,
    'tr-layout__aside--drawer': right.isDrawer,
    'tr-layout__aside--expanded': right.isOpen,
    'tr-layout__aside--rail': right.isRail,
    'tr-layout__aside--hidden': right.isHidden,
  }))

  return {
    hasHeader,
    hasFooter,
    leftAsideHidden,
    rightAsideHidden,
    leftResizeVisible,
    rightResizeVisible,
    leftAsideSlotProps,
    rightAsideSlotProps,
    layoutStyle,
    layoutClass,
    leftAsideClass,
    rightAsideClass,
  }
}
