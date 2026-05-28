import { computed, toValue, type ComputedRef } from 'vue'
import type { LayoutAsideConfig, LayoutAsideMode, LayoutPlacement } from '../index.type'
import type { CreateLayoutStoreOptions, LayoutAsideStoreInput, LayoutPanelApi, LayoutStore } from '../internal.type'
import { resolveCssLengthToPx, toCssLength } from '../utils/cssLength'

type ResolvedLayoutAsideConfig = {
  layoutMode: ComputedRef<LayoutAsideMode>
  expanded: ComputedRef<boolean>
  expandedWidthValue: ComputedRef<LayoutAsideConfig['expandedWidth']>
  collapsedWidthValue: ComputedRef<LayoutAsideConfig['collapsedWidth']>
  resizable: ComputedRef<boolean>
  minExpandedWidthValue: ComputedRef<LayoutAsideConfig['minExpandedWidth']>
  maxExpandedWidthValue: ComputedRef<LayoutAsideConfig['maxExpandedWidth']>
  expandedWidth: ComputedRef<string>
  collapsedWidth: ComputedRef<string>
  minExpandedWidth: ComputedRef<string>
  maxExpandedWidth: ComputedRef<string>
  onUpdate?: (nextConfig: LayoutAsideConfig) => void
}

function hasCollapsedRail(value: number | string | undefined): boolean {
  if (typeof value === 'number') {
    return value > 0
  }

  if (typeof value !== 'string') {
    return false
  }

  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return false
  }

  if (/^0(?:\.0+)?(?:[a-z%]+)?$/.test(normalized)) {
    return false
  }

  const measuredWidth = resolveCssLengthToPx(
    normalized,
    typeof document === 'undefined' ? null : document.body,
    Number.NaN,
  )

  if (Number.isFinite(measuredWidth)) {
    return measuredWidth > 0
  }

  return true
}

export function createLayoutStore(options: CreateLayoutStoreOptions = {}): LayoutStore {
  function resolveAsideConfig(
    side: LayoutPlacement,
    config: LayoutAsideStoreInput | undefined,
  ): ResolvedLayoutAsideConfig {
    const defaultExpanded = side === 'left'
    const defaultExpandedWidth = side === 'left' ? '300px' : '320px'
    const defaultMinExpandedWidth = side === 'left' ? '200px' : '240px'
    const defaultMaxExpandedWidth = side === 'left' ? '560px' : '640px'

    const layoutMode = computed<LayoutAsideMode>(() => toValue(config?.layoutMode) ?? 'dock')
    const expanded = computed<boolean>(() => toValue(config?.expanded) ?? defaultExpanded)
    const expandedWidthValue = computed<LayoutAsideConfig['expandedWidth']>(() => toValue(config?.expandedWidth))
    const collapsedWidthValue = computed<LayoutAsideConfig['collapsedWidth']>(() => toValue(config?.collapsedWidth))
    const resizable = computed<boolean>(() => toValue(config?.resizable) ?? false)
    const minExpandedWidthValue = computed<LayoutAsideConfig['minExpandedWidth']>(() =>
      toValue(config?.minExpandedWidth),
    )
    const maxExpandedWidthValue = computed<LayoutAsideConfig['maxExpandedWidth']>(() =>
      toValue(config?.maxExpandedWidth),
    )
    const expandedWidth = computed(() => toCssLength(expandedWidthValue.value, defaultExpandedWidth))
    const collapsedWidth = computed(() => toCssLength(collapsedWidthValue.value, '0px'))
    const minExpandedWidth = computed(() => toCssLength(minExpandedWidthValue.value, defaultMinExpandedWidth))
    const maxExpandedWidth = computed(() => toCssLength(maxExpandedWidthValue.value, defaultMaxExpandedWidth))

    return {
      layoutMode,
      expanded,
      expandedWidthValue,
      collapsedWidthValue,
      resizable,
      minExpandedWidthValue,
      maxExpandedWidthValue,
      expandedWidth,
      collapsedWidth,
      minExpandedWidth,
      maxExpandedWidth,
      onUpdate: config?.onUpdate,
    }
  }

  const leftConfig = resolveAsideConfig('left', options.left)
  const rightConfig = resolveAsideConfig('right', options.right)

  function emitAsideUpdate(config: ResolvedLayoutAsideConfig, patch: Partial<LayoutAsideConfig>): void {
    config.onUpdate?.({
      layoutMode: config.layoutMode.value,
      expanded: config.expanded.value,
      expandedWidth: config.expandedWidthValue.value,
      collapsedWidth: config.collapsedWidthValue.value,
      resizable: config.resizable.value,
      minExpandedWidth: config.minExpandedWidthValue.value,
      maxExpandedWidth: config.maxExpandedWidthValue.value,
      ...patch,
    })
  }

  function createAsideController(
    placement: LayoutPlacement,
    config: ResolvedLayoutAsideConfig,
    otherConfig: ResolvedLayoutAsideConfig,
  ): LayoutPanelApi {
    const isDock = computed(() => config.layoutMode.value === 'dock')
    const isDrawer = computed(() => config.layoutMode.value === 'drawer')
    const isRail = computed(
      () => isDock.value && !config.expanded.value && hasCollapsedRail(config.collapsedWidthValue.value),
    )
    const isHidden = computed(() => !config.expanded.value && (isDrawer.value || !isRail.value))
    const canResize = computed(() => isDock.value && config.expanded.value && config.resizable.value)

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

    function setExpandedWidth(nextWidth: number): void {
      emitAsideUpdate(config, { expandedWidth: nextWidth })
    }

    return {
      placement,
      get layoutMode() {
        return config.layoutMode.value
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
      get canResize() {
        return canResize.value
      },
      get expandedWidth() {
        return config.expandedWidth.value
      },
      get collapsedWidth() {
        return config.collapsedWidth.value
      },
      get resizable() {
        return config.resizable.value
      },
      get minExpandedWidth() {
        return config.minExpandedWidth.value
      },
      get maxExpandedWidth() {
        return config.maxExpandedWidth.value
      },
      setExpandedWidth,
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
