import { useMediaQuery } from '@vueuse/core'
import { computed, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { ChatAsideConfig, ChatAsideRestingState, ChatAsideState, ChatDesktopAsideState } from '@/types/layout'
import type { ChatLayoutPanelApi, ChatLayoutStore } from '@/types/layout.internal'

type MaybeRefChatAsideConfig = {
  defaultState?: MaybeRefOrGetter<ChatAsideConfig['defaultState'] | undefined>
  restingState?: MaybeRefOrGetter<ChatAsideConfig['restingState'] | undefined>
}

export interface CreateChatLayoutStoreOptions {
  mobileBreakpoint?: MaybeRefOrGetter<number>
  left?: MaybeRefChatAsideConfig
  right?: MaybeRefChatAsideConfig
}

export function createChatLayoutStore(options: CreateChatLayoutStoreOptions = {}): ChatLayoutStore {
  const initialLeftState = toValue(options.left?.defaultState ?? 'expanded') as ChatDesktopAsideState
  const initialRightState = toValue(options.right?.defaultState ?? 'hidden') as ChatDesktopAsideState
  const defaultLeftRestingState: ChatAsideRestingState =
    initialLeftState === 'expanded' ? 'collapsed' : initialLeftState
  const defaultRightRestingState: ChatAsideRestingState =
    initialRightState === 'expanded' ? 'hidden' : initialRightState

  const leftSidebarExpanded = shallowRef(initialLeftState === 'expanded')
  const leftDrawerOpen = shallowRef(false)
  const rightPanelExpanded = shallowRef(initialRightState === 'expanded')
  const rightDrawerOpen = shallowRef(false)

  const leftRestingState = computed<ChatAsideRestingState>(() => {
    const restingState = toValue(options.left?.restingState)
    return restingState ?? defaultLeftRestingState
  })

  const rightRestingState = computed<ChatAsideRestingState>(() => {
    const restingState = toValue(options.right?.restingState)
    return restingState ?? defaultRightRestingState
  })

  const breakpointSource = computed(() => Number(toValue(options.mobileBreakpoint ?? 959)))
  const isMobile = useMediaQuery(() => `(max-width: ${breakpointSource.value}px)`)

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
  }): ChatLayoutPanelApi {
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

      if (leftSidebarExpanded.value) {
        return 'expanded'
      }

      return leftRestingState.value
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

      return rightPanelExpanded.value ? 'expanded' : rightRestingState.value
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
    isMobile: readonly(isMobile),
    left,
    right,
    closeOverlays,
  }
}
