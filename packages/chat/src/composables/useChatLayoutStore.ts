import { computed, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { DEFAULT_MOBILE_BREAKPOINT } from '@/shared/constants'
import type { ChatLayoutStore } from '@/types/layout'
import { useChatBreakpoint } from '@/composables/useChatBreakpoint'

export interface UseChatLayoutStoreOptions {
  mobileBreakpoint?: MaybeRefOrGetter<number>
  defaultLeftSidebarOpen?: boolean
  defaultRightPanelOpen?: boolean
}

export function useChatLayoutStore(options: UseChatLayoutStoreOptions = {}): ChatLayoutStore {
  const leftSidebarOpen = shallowRef(options.defaultLeftSidebarOpen ?? true)
  const leftDrawerOpen = shallowRef(false)
  const rightPanelDesktopOpen = shallowRef(options.defaultRightPanelOpen ?? false)
  const rightPanelMobileOpen = shallowRef(false)

  const breakpointSource = computed(() => Number(toValue(options.mobileBreakpoint ?? DEFAULT_MOBILE_BREAKPOINT)))
  const { isMobile, mobileBreakpoint } = useChatBreakpoint({ mobileBreakpoint: breakpointSource })

  const leftSidebarVisible = computed(() => (isMobile.value ? leftDrawerOpen.value : leftSidebarOpen.value))
  const rightPanelOpen = computed(() => (isMobile.value ? rightPanelMobileOpen.value : rightPanelDesktopOpen.value))

  function setLeftSidebarOpen(value: boolean): void {
    leftSidebarOpen.value = value
  }

  function toggleLeftSidebar(): void {
    leftSidebarOpen.value = !leftSidebarOpen.value
  }

  function setLeftDrawerOpen(value: boolean): void {
    leftDrawerOpen.value = value

    if (value) {
      rightPanelMobileOpen.value = false
    }
  }

  function toggleLeftDrawer(): void {
    setLeftDrawerOpen(!leftDrawerOpen.value)
  }

  function setRightPanelOpen(value: boolean): void {
    if (isMobile.value) {
      rightPanelMobileOpen.value = value

      if (value) {
        leftDrawerOpen.value = false
      }

      return
    }

    rightPanelDesktopOpen.value = value
  }

  function toggleRightPanel(): void {
    setRightPanelOpen(!rightPanelOpen.value)
  }

  function closeOverlayPanels(): void {
    leftDrawerOpen.value = false

    if (isMobile.value) {
      rightPanelMobileOpen.value = false
    }
  }

  watch(isMobile, (nextIsMobile, prevIsMobile) => {
    if (!nextIsMobile) {
      leftDrawerOpen.value = false
      rightPanelMobileOpen.value = false
      return
    }

    if (prevIsMobile !== undefined) {
      rightPanelMobileOpen.value = false
    }
  })

  return {
    leftSidebarOpen: readonly(leftSidebarOpen),
    leftDrawerOpen: readonly(leftDrawerOpen),
    leftSidebarVisible,
    rightPanelOpen: readonly(rightPanelOpen),
    isMobile,
    mobileBreakpoint,
    setLeftSidebarOpen,
    toggleLeftSidebar,
    setLeftDrawerOpen,
    toggleLeftDrawer,
    setRightPanelOpen,
    toggleRightPanel,
    closeOverlayPanels,
  }
}
