import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { ChatAsideClosedMode, ChatAsideConfig, ChatAsideLayoutMode, ChatAsidePlacement } from '@/types/layout'
import type { ChatLayoutPanelApi, ChatLayoutStore } from '@/types/layout.internal'

type MaybeRefChatAsideConfig = {
  layoutMode?: MaybeRefOrGetter<ChatAsideConfig['layoutMode'] | undefined>
  expanded?: MaybeRefOrGetter<ChatAsideConfig['expanded'] | undefined>
  closedMode?: MaybeRefOrGetter<ChatAsideConfig['closedMode'] | undefined>
  expandedWidth?: MaybeRefOrGetter<ChatAsideConfig['expandedWidth'] | undefined>
  collapsedWidth?: MaybeRefOrGetter<ChatAsideConfig['collapsedWidth'] | undefined>
  onUpdate?: (nextConfig: ChatAsideConfig) => void
}

export interface CreateChatLayoutStoreOptions {
  left?: MaybeRefChatAsideConfig
  right?: MaybeRefChatAsideConfig
}

type ResolvedChatAsideConfig = {
  layoutMode: ComputedRef<ChatAsideLayoutMode>
  expanded: ComputedRef<boolean>
  closedMode: ComputedRef<ChatAsideClosedMode>
  expandedWidthValue: ComputedRef<ChatAsideConfig['expandedWidth']>
  collapsedWidthValue: ComputedRef<ChatAsideConfig['collapsedWidth']>
  expandedWidth: ComputedRef<string>
  collapsedWidth: ComputedRef<string>
  onUpdate?: (nextConfig: ChatAsideConfig) => void
}

function toCssLength(value: number | string | undefined, fallback: string): string {
  if (typeof value === 'number') {
    return `${value}px`
  }

  if (typeof value === 'string' && value.trim()) {
    return value
  }

  return fallback
}

export function createChatLayoutStore(options: CreateChatLayoutStoreOptions = {}): ChatLayoutStore {
  function resolveAsideConfig(
    side: ChatAsidePlacement,
    config: MaybeRefChatAsideConfig | undefined,
  ): ResolvedChatAsideConfig {
    const defaultExpanded = side === 'left'
    const defaultExpandedWidth = side === 'left' ? '300px' : '320px'

    const layoutMode = computed<ChatAsideLayoutMode>(() => toValue(config?.layoutMode) ?? 'dock')
    const expanded = computed<boolean>(() => toValue(config?.expanded) ?? defaultExpanded)
    const closedMode = computed<ChatAsideClosedMode>(() => toValue(config?.closedMode) ?? 'hidden')
    const expandedWidthValue = computed<ChatAsideConfig['expandedWidth']>(() => toValue(config?.expandedWidth))
    const collapsedWidthValue = computed<ChatAsideConfig['collapsedWidth']>(() => toValue(config?.collapsedWidth))
    const expandedWidth = computed(() => toCssLength(expandedWidthValue.value, defaultExpandedWidth))
    const collapsedWidth = computed(() => toCssLength(collapsedWidthValue.value, '48px'))

    return {
      layoutMode,
      expanded,
      closedMode,
      expandedWidthValue,
      collapsedWidthValue,
      expandedWidth,
      collapsedWidth,
      onUpdate: config?.onUpdate,
    }
  }

  const leftConfig = resolveAsideConfig('left', options.left)
  const rightConfig = resolveAsideConfig('right', options.right)

  function emitAsideUpdate(config: ResolvedChatAsideConfig, patch: Partial<ChatAsideConfig>): void {
    config.onUpdate?.({
      layoutMode: config.layoutMode.value,
      expanded: config.expanded.value,
      closedMode: config.closedMode.value,
      expandedWidth: config.expandedWidthValue.value,
      collapsedWidth: config.collapsedWidthValue.value,
      ...patch,
    })
  }

  function createAsideController(
    placement: ChatAsidePlacement,
    config: ResolvedChatAsideConfig,
    otherConfig: ResolvedChatAsideConfig,
  ): ChatLayoutPanelApi {
    const isDock = computed(() => config.layoutMode.value === 'dock')
    const isDrawer = computed(() => config.layoutMode.value === 'drawer')
    const isRail = computed(() => isDock.value && !config.expanded.value && config.closedMode.value === 'rail')
    const isHidden = computed(() => !config.expanded.value && (isDrawer.value || config.closedMode.value === 'hidden'))

    function open(): void {
      if (isDrawer.value && otherConfig.layoutMode.value === 'drawer' && otherConfig.expanded.value) {
        emitAsideUpdate(otherConfig, { expanded: false })
      }

      emitAsideUpdate(config, { expanded: true })
    }

    function close(): void {
      emitAsideUpdate(config, { expanded: false })
    }

    function toggle(): void {
      if (config.expanded.value) {
        close()
        return
      }

      open()
    }

    return {
      placement,
      get layoutMode() {
        return config.layoutMode.value
      },
      get closedMode() {
        return config.closedMode.value
      },
      get isExpanded() {
        return config.expanded.value
      },
      get isDock() {
        return isDock.value
      },
      get isDrawer() {
        return isDrawer.value
      },
      get isRail() {
        return isRail.value
      },
      get isHidden() {
        return isHidden.value
      },
      get expandedWidth() {
        return config.expandedWidth.value
      },
      get collapsedWidth() {
        return config.collapsedWidth.value
      },
      open,
      close,
      toggle,
    }
  }

  const left = createAsideController('left', leftConfig, rightConfig)
  const right = createAsideController('right', rightConfig, leftConfig)

  function closeDrawers(): void {
    if (left.layoutMode === 'drawer' && left.isExpanded) {
      emitAsideUpdate(leftConfig, { expanded: false })
    }

    if (right.layoutMode === 'drawer' && right.isExpanded) {
      emitAsideUpdate(rightConfig, { expanded: false })
    }
  }

  return {
    left,
    right,
    get isDrawerVisible() {
      return (left.isDrawer && left.isExpanded) || (right.isDrawer && right.isExpanded)
    },
    closeDrawers,
  }
}
