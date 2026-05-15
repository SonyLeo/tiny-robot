import { computed, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { DEFAULT_MOBILE_BREAKPOINT } from '@/shared/constants'
import type { ChatLayoutStore } from '@/types/layout'
import { useChatBreakpoint } from '@/composables/useChatBreakpoint'

export interface UseChatLayoutStoreOptions {
  mobileBreakpoint?: MaybeRefOrGetter<number>
  defaultLeftPanelOpen?: boolean
  defaultRightPanelOpen?: boolean
}

export function useChatLayoutStore(options: UseChatLayoutStoreOptions = {}): ChatLayoutStore {
  const leftPanelOpen = shallowRef(options.defaultLeftPanelOpen ?? true)
  const leftDrawerOpen = shallowRef(false)
  const rightPanelOpen = shallowRef(options.defaultRightPanelOpen ?? false)

  const breakpointSource = computed(() => Number(toValue(options.mobileBreakpoint ?? DEFAULT_MOBILE_BREAKPOINT)))
  const { isMobile, mobileBreakpoint } = useChatBreakpoint({ mobileBreakpoint: breakpointSource })

  if (isMobile.value) {
    rightPanelOpen.value = false
  }

  const leftPanelVisible = computed(() => (isMobile.value ? leftDrawerOpen.value : leftPanelOpen.value))

  function setLeftPanelOpen(value: boolean): void {
    leftPanelOpen.value = value
  }

  function toggleLeftPanel(): void {
    leftPanelOpen.value = !leftPanelOpen.value
  }

  function setLeftDrawerOpen(value: boolean): void {
    leftDrawerOpen.value = value

    if (value) {
      rightPanelOpen.value = false
    }
  }

  function toggleLeftDrawer(): void {
    setLeftDrawerOpen(!leftDrawerOpen.value)
  }

  function setRightPanelOpen(value: boolean): void {
    rightPanelOpen.value = value

    if (value && isMobile.value) {
      leftDrawerOpen.value = false
    }
  }

  function toggleRightPanel(): void {
    setRightPanelOpen(!rightPanelOpen.value)
  }

  function closeOverlayPanels(): void {
    leftDrawerOpen.value = false

    if (isMobile.value) {
      rightPanelOpen.value = false
    }
  }

  watch(isMobile, (nextIsMobile, prevIsMobile) => {
    if (!nextIsMobile) {
      leftDrawerOpen.value = false
      return
    }

    if (prevIsMobile !== undefined) {
      rightPanelOpen.value = false
    }
  })

  return {
    leftPanelOpen: readonly(leftPanelOpen),
    leftDrawerOpen: readonly(leftDrawerOpen),
    leftPanelVisible,
    rightPanelOpen: readonly(rightPanelOpen),
    isMobile,
    mobileBreakpoint,
    setLeftPanelOpen,
    toggleLeftPanel,
    setLeftDrawerOpen,
    toggleLeftDrawer,
    setRightPanelOpen,
    toggleRightPanel,
    closeOverlayPanels,
  }
}
