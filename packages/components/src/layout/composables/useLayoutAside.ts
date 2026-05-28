import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLayout } from './useLayout'
import type { LayoutPlacement } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'

export function useLayoutAside(placement: MaybeRefOrGetter<LayoutPlacement>) {
  const store = useLayout()
  const resolvedPlacement = computed(() => toValue(placement))
  const panel = computed<LayoutPanelApi>(() => (resolvedPlacement.value === 'left' ? store.left : store.right))

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
