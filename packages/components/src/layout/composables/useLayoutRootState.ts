import { computed } from 'vue'
import type {
  LayoutAsideProps,
  LayoutAsideValue,
  LayoutEmits,
  LayoutFloating,
  LayoutMode,
  LayoutPlacement,
} from '../index.type'
import type { LayoutPanelState, LayoutRuntimeProps, UseLayoutRootStateResult } from '../internal.type'
import { clamp } from '../utils/math'
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth, getDefaultAsideOpen } from '../utils/layoutAsideDefaults'
import { useControllableState } from '../../shared/composables/useControllableState'
import { usePropPresence } from '../../shared/composables/usePropPresence'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

function hasAsideField(aside: LayoutAsideProps | undefined, field: keyof LayoutAsideProps): boolean {
  return aside !== undefined && Object.prototype.hasOwnProperty.call(aside, field)
}

function emitAsideValue(emit: EmitFn, placement: LayoutPlacement, value: LayoutAsideValue): void {
  if (placement === 'left') {
    emit('update:leftAside', value)
    return
  }

  emit('update:rightAside', value)
}

function isFloatingEqual(left: LayoutFloating | undefined, right: LayoutFloating | undefined): boolean {
  return (
    left?.placement === right?.placement &&
    left?.offsetX === right?.offsetX &&
    left?.offsetY === right?.offsetY &&
    left?.width === right?.width &&
    left?.height === right?.height &&
    left?.draggable === right?.draggable &&
    left?.resizable === right?.resizable &&
    left?.minWidth === right?.minWidth &&
    left?.maxWidth === right?.maxWidth &&
    left?.minHeight === right?.minHeight &&
    left?.maxHeight === right?.maxHeight
  )
}

function createLayoutAsideState(
  placement: LayoutPlacement,
  aside: () => LayoutAsideProps | undefined,
  emit: EmitFn,
): LayoutPanelState {
  const layoutMode = computed(() => aside()?.mode ?? 'dock')
  const collapsedWidth = computed(() => aside()?.collapsedWidth)
  const resizable = computed(() => aside()?.resizable ?? false)
  const minWidth = computed(() => aside()?.minExpandedWidth ?? getDefaultAsideMinWidth(placement))
  const maxWidth = computed(() => aside()?.maxExpandedWidth ?? getDefaultAsideMaxWidth(placement))

  const openState = useControllableState<boolean>({
    value: () => aside()?.open,
    defaultValue: () => (hasAsideField(aside(), 'defaultOpen') ? aside()?.defaultOpen : getDefaultAsideOpen(placement)),
    isControlled: () => hasAsideField(aside(), 'open'),
    onChange: (nextOpen) => emitAsideValue(emit, placement, { open: nextOpen, expandedWidth: resolvedWidth.value }),
  })

  const widthState = useControllableState<number | undefined>({
    value: () => aside()?.expandedWidth,
    defaultValue: () => (hasAsideField(aside(), 'defaultExpandedWidth') ? aside()?.defaultExpandedWidth : undefined),
    isControlled: () => hasAsideField(aside(), 'expandedWidth'),
    onChange: (nextWidth) => emitAsideValue(emit, placement, { open: resolvedOpen.value, expandedWidth: nextWidth }),
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
  const isRail = computed(() => isDock.value && !resolvedOpen.value && (collapsedWidth.value ?? 0) > 0)
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
    placement,
    layoutMode,
    isOpen: resolvedOpen,
    isDock,
    isDrawer,
    isRail,
    isHidden,
    canResize,
    width: resolvedWidth,
    collapsedWidth,
    minWidth,
    maxWidth,
    resizable,
    setOpen,
    setWidth,
  }
}

export function useLayoutRootState(props: LayoutRuntimeProps, emit: EmitFn): UseLayoutRootStateResult {
  const hasProp = usePropPresence()
  const modeProvided = hasProp('mode')
  const floatingProvided = hasProp('floating')
  const defaultFloatingProvided = hasProp('defaultFloating')

  const modeState = useControllableState<LayoutMode>({
    value: () => ('mode' in props ? props.mode : undefined),
    defaultValue: () => 'normal',
    isControlled: modeProvided,
    onChange: (nextMode) => emit('update:mode', nextMode),
  })

  const floatingState = useControllableState<LayoutFloating | undefined>({
    value: () => ('floating' in props ? props.floating : undefined),
    defaultValue: () => (defaultFloatingProvided ? props.defaultFloating : undefined),
    isControlled: floatingProvided,
    onChange: (nextFloating) => nextFloating && emit('update:floating', nextFloating),
  })

  const resolvedMode = computed<LayoutMode>(() => modeState.resolvedState.value ?? 'normal')
  const resolvedFloating = computed(() => floatingState.resolvedState.value)

  function initializeFloating(nextFloating: LayoutFloating): void {
    if (isFloatingEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating, { notify: false })
  }

  function commitFloating(nextFloating: LayoutFloating): void {
    if (isFloatingEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating)
  }

  return {
    resolvedMode,
    resolvedFloating,
    commitFloating,
    initializeFloating,
    leftAside: createLayoutAsideState('left', () => props.leftAside, emit),
    rightAside: createLayoutAsideState('right', () => props.rightAside, emit),
  }
}
