import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'
import type {
  ChatShellVariant,
  ChatWorkspaceRegionCollapseMode,
  ChatWorkspaceRegionWidth,
  ChatWorkspaceShellConfig,
} from './types/workspace'

export type ChatHistoryDisplayMode = 'drawer' | 'surface'

export interface ChatWorkspaceRegionState {
  visible: Ref<boolean>
  collapsed: Ref<boolean>
  width: Ref<ChatWorkspaceRegionWidth | undefined>
  collapseMode: Ref<ChatWorkspaceRegionCollapseMode>
  open: () => void
  close: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  setWidth: (width: number) => void
}

export interface ChatWorkspaceState {
  enabled: ComputedRef<boolean>
  variant: Ref<ChatShellVariant>
  isMobile: Ref<boolean>
  setResponsiveHost: (element: HTMLElement | null) => void
  left: ChatWorkspaceRegionState
  right: ChatWorkspaceRegionState
}

export interface ChatUiContextValue {
  workspace: ChatWorkspaceState
  history: {
    visible: ComputedRef<boolean>
    display: Ref<ChatHistoryDisplayMode>
    open: () => void
    close: () => void
    toggle: () => void
  }
}

export interface CreateChatUiContextOptions {
  historyDisplay?: ChatHistoryDisplayMode
  historyVisible?: boolean
  closableHistory?: boolean
  shell?: ChatWorkspaceShellConfig
  mobileBreakpoint?: string
}

function resolveMaxWidthBreakpoint(query: string) {
  const match = query.match(/max-width:\s*(\d+)px/i)
  if (!match) {
    return null
  }

  return Number(match[1])
}

function createWorkspaceRegionState(options: {
  visible: boolean
  collapsed: boolean
  width?: number | 'sm' | 'md' | 'lg'
  collapseMode?: ChatWorkspaceRegionCollapseMode
}) {
  const visible = ref(options.visible)
  const collapsed = ref(options.collapsed)
  const width = ref(options.width)
  const collapseMode = ref<ChatWorkspaceRegionCollapseMode>(options.collapseMode ?? 'hidden')

  return {
    visible,
    collapsed,
    width,
    collapseMode,
    open: () => {
      visible.value = true
      collapsed.value = false
    },
    close: () => {
      visible.value = false
    },
    toggle: () => {
      visible.value = !visible.value
      if (visible.value) {
        collapsed.value = false
      }
    },
    collapse: () => {
      collapsed.value = true
      if (collapseMode.value === 'hidden') {
        visible.value = false
      }
    },
    expand: () => {
      visible.value = true
      collapsed.value = false
    },
    setWidth: (nextWidth: number) => {
      width.value = nextWidth
    },
  }
}

export function createChatUiContext(options: CreateChatUiContextOptions = {}): ChatUiContextValue {
  const variant = ref<ChatShellVariant>(options.shell?.variant ?? 'stacked')
  const enabled = computed(() => variant.value === 'workspace')
  const isMobile = ref(false)
  const display = ref<ChatHistoryDisplayMode>(options.historyDisplay ?? 'drawer')
  const legacyHistoryVisible = ref(options.historyVisible ?? display.value === 'surface')
  const closableHistory = options.closableHistory ?? display.value !== 'surface'

  const leftCollapseMode = options.shell?.leftRegion?.collapseMode ?? 'rail'
  const rightCollapseMode = options.shell?.rightRegion?.collapseMode ?? 'hidden'
  const leftDefaultOpen = options.shell?.leftRegion?.defaultOpen !== false
  const rightDefaultOpen = options.shell?.rightRegion?.defaultOpen === true
  const mobileBreakpoint = options.mobileBreakpoint ?? '(max-width: 900px)'
  const mobileBreakpointWidth = resolveMaxWidthBreakpoint(mobileBreakpoint)

  const left = createWorkspaceRegionState({
    visible: leftDefaultOpen,
    collapsed: !leftDefaultOpen && leftCollapseMode === 'rail',
    width: options.shell?.leftRegion?.width,
    collapseMode: leftCollapseMode,
  })
  const right = createWorkspaceRegionState({
    visible: rightDefaultOpen,
    collapsed: !rightDefaultOpen,
    width: options.shell?.rightRegion?.width,
    collapseMode: rightCollapseMode,
  })

  let responsiveHost: HTMLElement | null = null
  let responsiveHostObserver: ResizeObserver | null = null

  function syncResponsiveState(viewportMatches = false) {
    const hostMatches =
      responsiveHost != null &&
      mobileBreakpointWidth != null &&
      responsiveHost.getBoundingClientRect().width <= mobileBreakpointWidth

    isMobile.value = viewportMatches || hostMatches
  }

  function setResponsiveHost(element: HTMLElement | null) {
    if (responsiveHost === element) {
      return
    }

    responsiveHostObserver?.disconnect()
    responsiveHostObserver = null
    responsiveHost = element

    if (typeof ResizeObserver === 'undefined' || !responsiveHost) {
      syncResponsiveState()
      return
    }

    responsiveHostObserver = new ResizeObserver(() => {
      syncResponsiveState()
    })
    responsiveHostObserver.observe(responsiveHost)
    syncResponsiveState()
  }

  const historyVisible = computed(() => {
    if (!enabled.value) {
      return legacyHistoryVisible.value
    }

    return isMobile.value ? left.visible.value : !left.collapsed.value
  })

  function setLegacyHistoryVisible(nextVisible: boolean) {
    if (!closableHistory && !nextVisible) {
      return
    }

    legacyHistoryVisible.value = nextVisible
  }

  function openHistory() {
    if (!enabled.value) {
      setLegacyHistoryVisible(true)
      return
    }

    left.expand()
  }

  function closeHistory() {
    if (!enabled.value) {
      setLegacyHistoryVisible(false)
      return
    }

    if (isMobile.value) {
      left.close()
      return
    }

    if (left.collapseMode.value === 'rail') {
      left.collapse()
      left.visible.value = true
      return
    }

    left.close()
  }

  function toggleHistory() {
    if (historyVisible.value) {
      closeHistory()
    } else {
      openHistory()
    }
  }

  if (typeof window !== 'undefined') {
    const query = window.matchMedia(mobileBreakpoint)
    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      syncResponsiveState(event.matches)
    }

    handleChange(query)

    if ('addEventListener' in query) {
      query.addEventListener('change', handleChange)
      onScopeDispose(() => {
        query.removeEventListener('change', handleChange)
      })
    } else {
      ;(
        query as MediaQueryList & {
          addListener: (listener: (event: MediaQueryListEvent) => void) => void
          removeListener: (listener: (event: MediaQueryListEvent) => void) => void
        }
      ).addListener(handleChange)
      onScopeDispose(() => {
        ;(
          query as MediaQueryList & {
            removeListener: (listener: (event: MediaQueryListEvent) => void) => void
          }
        ).removeListener(handleChange)
      })
    }

    onScopeDispose(() => {
      responsiveHostObserver?.disconnect()
      responsiveHostObserver = null
      responsiveHost = null
    })

    watch(
      isMobile,
      (mobile) => {
        if (enabled.value) {
          display.value = mobile ? 'drawer' : 'drawer'

          if (!mobile) {
            left.visible.value = true
            if (left.collapseMode.value === 'rail' && historyVisible.value === false) {
              left.collapsed.value = true
            }
          } else {
            left.collapsed.value = false
            left.visible.value = false
          }
        }
      },
      { immediate: true },
    )
  }

  return {
    workspace: {
      enabled,
      variant,
      isMobile,
      setResponsiveHost,
      left,
      right,
    },
    history: {
      visible: historyVisible,
      display,
      open: openHistory,
      close: closeHistory,
      toggle: toggleHistory,
    },
  }
}
