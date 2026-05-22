import { useEventListener } from '@vueuse/core'
import { toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { useChatAsideResize } from '@/composables/useChatAsideResize'
import type { ChatAsideResizeEventDetail } from '@/types/layout'
import type { ChatLayoutPanelApi } from '@/types/layout.internal'

interface UseChatLayoutInteractionsOptions {
  rootRef: Ref<HTMLElement | null>
  leftAsideRef: Ref<HTMLElement | null>
  rightAsideRef: Ref<HTMLElement | null>
  left: ChatLayoutPanelApi
  right: ChatLayoutPanelApi
  isDrawerVisible: MaybeRefOrGetter<boolean>
  closeDrawers: () => void
  onResizeStart?: (detail: ChatAsideResizeEventDetail) => void
  onResize?: (detail: ChatAsideResizeEventDetail) => void
  onResizeEnd?: (detail: ChatAsideResizeEventDetail) => void
}

export function useChatLayoutInteractions(options: UseChatLayoutInteractionsOptions) {
  const resizeState = useChatAsideResize({
    rootRef: options.rootRef,
    leftAsideRef: options.leftAsideRef,
    rightAsideRef: options.rightAsideRef,
    left: options.left,
    right: options.right,
    onResizeStart: options.onResizeStart,
    onResize: options.onResize,
    onResizeEnd: options.onResizeEnd,
  })

  const keyboardTarget = typeof window === 'undefined' ? undefined : window

  useEventListener(keyboardTarget, 'keydown', (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.key !== 'Escape' || !toValue(options.isDrawerVisible)) {
      return
    }

    options.closeDrawers()
  })

  return resizeState
}
