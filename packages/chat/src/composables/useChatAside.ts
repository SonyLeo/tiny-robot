import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useChatLayout } from '@/composables/useChatLayout'
import type { ChatAsidePlacement } from '@/types/layout'
import type { ChatLayoutPanelApi } from '@/types/layout.internal'

export function useChatAside(placement: MaybeRefOrGetter<ChatAsidePlacement>) {
  const store = useChatLayout()
  const resolvedPlacement = computed(() => toValue(placement))
  const panel = computed<ChatLayoutPanelApi>(() => (resolvedPlacement.value === 'left' ? store.left : store.right))

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
    layoutMode: computed(() => panel.value.layoutMode),
    isExpanded: computed(() => panel.value.isExpanded),
    isDock: computed(() => panel.value.isDock),
    isDrawer: computed(() => panel.value.isDrawer),
    isRail: computed(() => panel.value.isRail),
    isHidden: computed(() => panel.value.isHidden),
    open,
    close,
    toggle,
  }
}
