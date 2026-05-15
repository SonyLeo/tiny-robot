import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatPanelSide, ChatPanelToggleSlotProps } from '@/types/layout'

export interface UsePanelToggleOptions {
  side: ChatPanelSide
}

export function usePanelToggle(options: UsePanelToggleOptions) {
  const store = useChatLayoutStoreContext()

  const expanded = computed(() => {
    if (options.side === 'left') {
      return store.isMobile.value ? store.leftDrawerOpen.value : store.leftSidebarOpen.value
    }

    return store.rightPanelOpen.value
  })

  const slotProps = computed<ChatPanelToggleSlotProps>(() => ({
    expanded: expanded.value,
    isMobile: store.isMobile.value,
    side: options.side,
  }))

  function handleClick(): void {
    if (options.side === 'left') {
      if (store.isMobile.value) {
        store.toggleLeftDrawer()
        return
      }

      store.toggleLeftSidebar()
      return
    }

    store.toggleRightPanel()
  }

  return {
    expanded,
    slotProps,
    handleClick,
  }
}
