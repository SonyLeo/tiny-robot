import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLayoutContext } from './useLayoutContext'
import type { LayoutPlacement } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'

export function useLayoutPanel(placement: MaybeRefOrGetter<LayoutPlacement>) {
  const context = useLayoutContext()
  const resolvedPlacement = computed(() => toValue(placement))
  const panel = computed<LayoutPanelApi>(() => (resolvedPlacement.value === 'left' ? context.left : context.right))

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
    isOpen: computed(() => panel.value.isOpen),
    isDock: computed(() => panel.value.isDock),
    isDrawer: computed(() => panel.value.isDrawer),
    isRail: computed(() => panel.value.isRail),
    isHidden: computed(() => panel.value.isHidden),
    width: computed(() => panel.value.width),
    open,
    close,
    toggle,
  }
}
