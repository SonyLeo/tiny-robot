import { computed, getCurrentInstance, shallowRef } from 'vue'
import type {
  LayoutAsideProps,
  LayoutAsideState,
  LayoutEmits,
  LayoutFloatingState,
  LayoutPlacement,
  LayoutProps,
} from '../index.type'
import type {
  LayoutFloatingContext,
  LayoutPanelContext,
  LayoutResolvedFloating,
  UseLayoutRootStateResult,
} from '../internal.type'
import { clamp } from '../utils/math'
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth, getDefaultAsideOpen } from '../utils/asideDefaults'
import { useControllableState } from '../../shared/composables/useControllableState'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

const hasAsideField = (aside: LayoutAsideProps | undefined, field: keyof LayoutAsideProps): boolean =>
  aside !== undefined && Object.prototype.hasOwnProperty.call(aside, field)

function hasFloatingStateProp(): boolean {
  const rawProps = getCurrentInstance()?.vnode.props as Record<string, unknown> | null | undefined

  if (!rawProps) {
    return false
  }

  return (
    Object.prototype.hasOwnProperty.call(rawProps, 'floatingState') ||
    Object.prototype.hasOwnProperty.call(rawProps, 'floating-state')
  )
}

function emitAsideStateChange(emit: EmitFn, placement: LayoutPlacement, value: LayoutAsideState): void {
  if (placement === 'left') {
    emit('left-aside-state-change', value)
    return
  }

  emit('right-aside-state-change', value)
}

function isFloatingStateEqual(left: LayoutFloatingState | undefined, right: LayoutFloatingState | undefined): boolean {
  return (
    left?.placement === right?.placement &&
    left?.offsetX === right?.offsetX &&
    left?.offsetY === right?.offsetY &&
    left?.width === right?.width &&
    left?.height === right?.height
  )
}

function resolveFiniteNumber(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : value
}

function createPanelContext(
  placement: LayoutPlacement,
  aside: () => LayoutAsideProps | undefined,
  emit: EmitFn,
): LayoutPanelContext {
  const asideValue = computed(() => aside())
  const layoutMode = computed(() => asideValue.value?.mode ?? 'dock')
  const collapsedWidth = computed(() => resolveFiniteNumber(asideValue.value?.collapsedWidth, 0))
  const collapseEffect = computed(() => asideValue.value?.collapseEffect ?? 'overlay')
  const resizable = computed(() => asideValue.value?.resizable ?? false)
  const minWidth = computed(() =>
    resolveFiniteNumber(asideValue.value?.minExpandedWidth, getDefaultAsideMinWidth(placement)),
  )
  const maxWidth = computed(() => {
    const nextMaxWidth = resolveFiniteNumber(asideValue.value?.maxExpandedWidth, getDefaultAsideMaxWidth(placement))
    return Math.max(minWidth.value, nextMaxWidth)
  })

  const openState = useControllableState<boolean>({
    value: () => asideValue.value?.open,
    defaultValue: () =>
      hasAsideField(asideValue.value, 'defaultOpen') ? asideValue.value?.defaultOpen : getDefaultAsideOpen(placement),
    isControlled: () => hasAsideField(asideValue.value, 'open'),
    onChange: (nextOpen) =>
      emitAsideStateChange(emit, placement, { open: nextOpen, expandedWidth: resolvedWidth.value }),
  })

  const widthState = useControllableState<number | undefined>({
    value: () => asideValue.value?.expandedWidth,
    defaultValue: () =>
      hasAsideField(asideValue.value, 'defaultExpandedWidth') ? asideValue.value?.defaultExpandedWidth : undefined,
    isControlled: () => hasAsideField(asideValue.value, 'expandedWidth'),
    onChange: (nextWidth) =>
      emitAsideStateChange(emit, placement, { open: resolvedOpen.value, expandedWidth: nextWidth }),
  })

  const resolvedOpen = computed(() => openState.resolvedState.value ?? getDefaultAsideOpen(placement))
  const resolvedWidth = computed(() => {
    const nextWidth = widthState.resolvedState.value

    if (nextWidth === undefined || !Number.isFinite(nextWidth)) {
      return undefined
    }

    return clamp(nextWidth, minWidth.value, maxWidth.value)
  })

  const isDock = computed(() => layoutMode.value === 'dock')
  const isDrawer = computed(() => layoutMode.value === 'drawer')
  const isRail = computed(() => isDock.value && !resolvedOpen.value && collapsedWidth.value > 0)
  const isHidden = computed(() => !resolvedOpen.value && (isDrawer.value || !isRail.value))
  const canResize = computed(() => isDock.value && resolvedOpen.value && resizable.value)

  function setOpen(nextOpen: boolean): void {
    if (resolvedOpen.value === nextOpen) {
      return
    }

    openState.commit(nextOpen)
  }

  function setWidth(nextWidth: number): void {
    const clampedWidth = clamp(nextWidth, minWidth.value, maxWidth.value)
    if (resolvedWidth.value === clampedWidth) {
      return
    }

    widthState.commit(clampedWidth)
  }

  return {
    el: shallowRef<HTMLElement | null>(null),
    state: {
      placement,
      layoutMode,
      isOpen: resolvedOpen,
      width: resolvedWidth,
      collapsedWidth,
      collapseEffect,
      minWidth,
      maxWidth,
      resizable,
      isDock,
      isDrawer,
      isRail,
      isHidden,
      canResize,
    },
    actions: {
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(!resolvedOpen.value),
      setOpen,
      setWidth,
    },
  }
}

export function useLayoutRootState(props: LayoutProps, emit: EmitFn): UseLayoutRootStateResult {
  const floatingStateProvided = hasFloatingStateProp()

  const floatingState = useControllableState<LayoutFloatingState | undefined>({
    value: () => (props.mode === 'floating' ? props.floatingState : undefined),
    defaultValue: () => (props.mode === 'floating' ? props.defaultFloatingState : undefined),
    isControlled: floatingStateProvided,
    onChange: (nextFloatingState) => nextFloatingState && emit('update:floatingState', nextFloatingState),
  })

  const resolvedMode = computed(() => (props.mode === 'floating' ? 'floating' : 'normal'))
  const resolvedFloatingState = computed(() => floatingState.resolvedState.value)
  const resolvedFloating = computed<LayoutResolvedFloating | undefined>(() => {
    const nextFloatingState = resolvedFloatingState.value
    const nextFloatingOptions = props.mode === 'floating' ? props.floatingOptions : undefined

    if (!nextFloatingState && !nextFloatingOptions) {
      return undefined
    }

    return {
      ...nextFloatingOptions,
      ...nextFloatingState,
    }
  })

  const floating: LayoutFloatingContext = {
    state: {
      mode: resolvedMode,
      value: resolvedFloatingState,
      resolved: resolvedFloating,
    },
    actions: {
      initialize: (nextFloatingState) => {
        if (isFloatingStateEqual(resolvedFloatingState.value, nextFloatingState)) {
          return
        }

        floatingState.commit(nextFloatingState, { notify: false })
      },
      commit: (nextFloatingState) => {
        if (isFloatingStateEqual(resolvedFloatingState.value, nextFloatingState)) {
          return
        }

        floatingState.commit(nextFloatingState)
      },
    },
  }

  return {
    leftPanel: createPanelContext('left', () => props.leftAside, emit),
    rightPanel: createPanelContext('right', () => props.rightAside, emit),
    floating,
  }
}
