import { computed, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { DEFAULT_MOBILE_BREAKPOINT } from '@/shared/constants'
import type { ChatAsideController, ChatAsideState, ChatLayoutStore } from '@/types/layout'
import { useChatBreakpoint } from '@/composables/useChatBreakpoint'

export interface UseChatLayoutStoreOptions {
  mobileBreakpoint?: MaybeRefOrGetter<number>
  defaultLeftSidebarOpen?: boolean
  defaultRightPanelOpen?: boolean
}

export function useChatLayoutStore(options: UseChatLayoutStoreOptions = {}): ChatLayoutStore {
  const leftSidebarExpanded = shallowRef(options.defaultLeftSidebarOpen ?? true)
  const leftDrawerOpen = shallowRef(false)
  const rightPanelExpanded = shallowRef(options.defaultRightPanelOpen ?? false)
  const rightDrawerOpen = shallowRef(false)

  const breakpointSource = computed(() => Number(toValue(options.mobileBreakpoint ?? DEFAULT_MOBILE_BREAKPOINT)))
  const { isMobile, mobileBreakpoint } = useChatBreakpoint({ mobileBreakpoint: breakpointSource })

  function setLeftDrawerOpen(value: boolean): void {
    leftDrawerOpen.value = value

    if (value) {
      rightDrawerOpen.value = false
    }
  }

  function setRightDrawerOpen(value: boolean): void {
    rightDrawerOpen.value = value

    if (value) {
      leftDrawerOpen.value = false
    }
  }

  function closeOverlays(): void {
    leftDrawerOpen.value = false
    rightDrawerOpen.value = false
  }

  function createAsideController(options: {
    state: () => ChatAsideState
    open: () => void
    close: () => void
  }): ChatAsideController {
    const state = computed(options.state)
    const isOpen = computed(() => state.value === 'expanded' || state.value === 'overlay')

    function toggle(): void {
      if (isOpen.value) {
        options.close()
        return
      }

      options.open()
    }

    return {
      state,
      isOpen,
      open: options.open,
      close: options.close,
      toggle,
    }
  }

  const left = createAsideController({
    state: () => {
      if (isMobile.value) {
        return leftDrawerOpen.value ? 'overlay' : 'hidden'
      }

      return leftSidebarExpanded.value ? 'expanded' : 'collapsed'
    },
    open: () => {
      if (isMobile.value) {
        setLeftDrawerOpen(true)
        return
      }

      leftSidebarExpanded.value = true
    },
    close: () => {
      if (isMobile.value) {
        setLeftDrawerOpen(false)
        return
      }

      leftSidebarExpanded.value = false
    },
  })

  const right = createAsideController({
    state: () => {
      if (isMobile.value) {
        return rightDrawerOpen.value ? 'overlay' : 'hidden'
      }

      return rightPanelExpanded.value ? 'expanded' : 'hidden'
    },
    open: () => {
      if (isMobile.value) {
        setRightDrawerOpen(true)
        return
      }

      rightPanelExpanded.value = true
    },
    close: () => {
      if (isMobile.value) {
        setRightDrawerOpen(false)
        return
      }

      rightPanelExpanded.value = false
    },
  })

  watch(isMobile, (_nextIsMobile, prevIsMobile) => {
    if (prevIsMobile !== undefined) {
      closeOverlays()
    }
  })

  return {
    viewport: {
      isMobile: readonly(isMobile),
      mobileBreakpoint: readonly(mobileBreakpoint),
    },
    left,
    right,
    closeOverlays,
  }
}
