import { computed } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import type { ChatAsideSide, ChatAsideToggleSlotProps } from '@/types/layout'

export interface UseAsideToggleOptions {
  side: ChatAsideSide
}

export function useAsideToggle(options: UseAsideToggleOptions) {
  const store = useChatLayoutStoreContext()
  const controller = options.side === 'left' ? store.left : store.right

  const isOpen = computed(() => controller.isOpen.value)

  const slotProps = computed<ChatAsideToggleSlotProps>(() => ({
    isOpen: isOpen.value,
    isMobile: store.viewport.isMobile.value,
    side: options.side,
  }))

  function handleClick(): void {
    controller.toggle()
  }

  return {
    isOpen,
    slotProps,
    handleClick,
  }
}
