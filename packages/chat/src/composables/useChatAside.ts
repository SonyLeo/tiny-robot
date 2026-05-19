import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useChatLayout } from '@/composables/useChatLayout'
import type { ChatAsideSide, ChatAsideState } from '@/types/layout'
import type { ChatLayoutPanelApi } from '@/types/layout.internal'

export function useChatAside(side: MaybeRefOrGetter<ChatAsideSide>) {
  const store = useChatLayout()
  const resolvedSide = computed(() => toValue(side))
  const panel = computed<ChatLayoutPanelApi>(() => (resolvedSide.value === 'left' ? store.left : store.right))
  const state = computed<ChatAsideState>(() => panel.value.state.value)
  const isOpen = computed(() => panel.value.isOpen.value)
  const isCollapsed = computed(() => state.value === 'collapsed')

  function open(): void {
    panel.value.open()
  }

  function close(): void {
    panel.value.close()
  }

  function toggle(): void {
    panel.value.toggle()
  }

  return {
    isMobile: store.isMobile,
    state,
    isOpen,
    isCollapsed,
    open,
    close,
    toggle,
  }
}
