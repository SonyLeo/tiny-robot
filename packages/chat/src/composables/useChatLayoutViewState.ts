import { computed, toValue, type MaybeRefOrGetter, type Slots } from 'vue'
import type { ChatLayoutPanelApi } from '@/types/layout.internal'

interface UseChatLayoutViewStateOptions {
  slots: Slots
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  isDrawerVisible: MaybeRefOrGetter<boolean>
  isResizing: MaybeRefOrGetter<boolean>
}

export function useChatLayoutViewState(options: UseChatLayoutViewStateOptions) {
  const hasLeftSidebar = computed(() => Boolean(options.slots['left-aside']))
  const hasHeader = computed(() => Boolean(options.slots.header))
  const hasMain = computed(() => Boolean(options.slots.main))
  const hasFooter = computed(() => Boolean(options.slots.footer))
  const hasRightPanel = computed(() => Boolean(options.slots['right-aside']))

  const leftAsideHidden = computed(() => !hasLeftSidebar.value || options.left.isHidden)
  const rightAsideHidden = computed(() => !hasRightPanel.value || options.right.isHidden)
  const leftResizeVisible = computed(
    () => hasLeftSidebar.value && options.left.isDock && options.left.isExpanded && options.left.resizable,
  )
  const rightResizeVisible = computed(
    () => hasRightPanel.value && options.right.isDock && options.right.isExpanded && options.right.resizable,
  )

  const layoutStyle = computed(() => ({
    '--tr-chat-layout-left-expanded-width': options.left.expandedWidth,
    '--tr-chat-layout-left-collapsed-width': options.left.collapsedWidth,
    '--tr-chat-layout-right-expanded-width': options.right.expandedWidth,
    '--tr-chat-layout-right-collapsed-width': options.right.collapsedWidth,
  }))

  const layoutClass = computed(() => ({
    'tr-chat-layout--left-dock': hasLeftSidebar.value && options.left.isDock,
    'tr-chat-layout--left-drawer': hasLeftSidebar.value && options.left.isDrawer,
    'tr-chat-layout--left-expanded': hasLeftSidebar.value && options.left.isExpanded,
    'tr-chat-layout--left-rail': hasLeftSidebar.value && options.left.isRail,
    'tr-chat-layout--right-dock': hasRightPanel.value && options.right.isDock,
    'tr-chat-layout--right-drawer': hasRightPanel.value && options.right.isDrawer,
    'tr-chat-layout--right-expanded': hasRightPanel.value && options.right.isExpanded,
    'tr-chat-layout--right-rail': hasRightPanel.value && options.right.isRail,
    'tr-chat-layout--drawer-visible': toValue(options.isDrawerVisible),
    'tr-chat-layout--resizing': toValue(options.isResizing),
  }))

  const leftAsideClass = computed(() => ({
    'tr-chat-layout__aside--active': hasLeftSidebar.value,
    'tr-chat-layout__aside--dock': options.left.isDock,
    'tr-chat-layout__aside--drawer': options.left.isDrawer,
    'tr-chat-layout__aside--expanded': options.left.isExpanded,
    'tr-chat-layout__aside--rail': options.left.isRail,
    'tr-chat-layout__aside--hidden': options.left.isHidden,
  }))

  const rightAsideClass = computed(() => ({
    'tr-chat-layout__aside--active': hasRightPanel.value,
    'tr-chat-layout__aside--dock': options.right.isDock,
    'tr-chat-layout__aside--drawer': options.right.isDrawer,
    'tr-chat-layout__aside--expanded': options.right.isExpanded,
    'tr-chat-layout__aside--rail': options.right.isRail,
    'tr-chat-layout__aside--hidden': options.right.isHidden,
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
