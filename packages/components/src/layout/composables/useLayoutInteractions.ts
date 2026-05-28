import { useEventListener } from '@vueuse/core'
import { toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { useLayoutAsideResize } from './useLayoutAsideResize'
import type { LayoutAsideResizeEventDetail } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'

interface UseLayoutInteractionsOptions {
  rootRef: Ref<HTMLElement | null>
  leftAsideRef: Ref<HTMLElement | null>
  rightAsideRef: Ref<HTMLElement | null>
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: MaybeRefOrGetter<boolean>
  closeDrawers: () => void
  onResizeStart?: (detail: LayoutAsideResizeEventDetail) => void
  onResize?: (detail: LayoutAsideResizeEventDetail) => void
  onResizeEnd?: (detail: LayoutAsideResizeEventDetail) => void
}

export function useLayoutInteractions(options: UseLayoutInteractionsOptions) {
  const resizeState = useLayoutAsideResize({
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
