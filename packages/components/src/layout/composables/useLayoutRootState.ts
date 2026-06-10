import { computed, getCurrentInstance } from 'vue'
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
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth, getDefaultAsideOpen } from '../utils/asideDefaults'
import { useControllableState } from '../../shared/composables/useControllableState'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

const hasAsideField = (aside: LayoutAsideProps | undefined, field: keyof LayoutAsideProps): boolean =>
  aside !== undefined && Object.prototype.hasOwnProperty.call(aside, field)

function hasRawProp(name: string): boolean {
  const rawProps = getCurrentInstance()?.vnode.props as Record<string, unknown> | null | undefined

  if (!rawProps) {
    return false
  }

  const kebabName = name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

  return (
    Object.prototype.hasOwnProperty.call(rawProps, name) || Object.prototype.hasOwnProperty.call(rawProps, kebabName)
  )
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
  const asideValue = computed(() => aside())
  const layoutMode = computed(() => asideValue.value?.mode ?? 'dock')
  const collapsedWidth = computed(() => asideValue.value?.collapsedWidth)
  const resizable = computed(() => asideValue.value?.resizable ?? false)
  const minWidth = computed(() => asideValue.value?.minExpandedWidth ?? getDefaultAsideMinWidth(placement))
  const maxWidth = computed(() => asideValue.value?.maxExpandedWidth ?? getDefaultAsideMaxWidth(placement))

  const openState = useControllableState<boolean>({
    value: () => asideValue.value?.open,
    defaultValue: () =>
      hasAsideField(asideValue.value, 'defaultOpen') ? asideValue.value?.defaultOpen : getDefaultAsideOpen(placement),
    isControlled: () => hasAsideField(asideValue.value, 'open'),
    onChange: (nextOpen) => emitAsideValue(emit, placement, { open: nextOpen, expandedWidth: resolvedWidth.value }),
  })

  const widthState = useControllableState<number | undefined>({
    value: () => asideValue.value?.expandedWidth,
    defaultValue: () =>
      hasAsideField(asideValue.value, 'defaultExpandedWidth') ? asideValue.value?.defaultExpandedWidth : undefined,
    isControlled: () => hasAsideField(asideValue.value, 'expandedWidth'),
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
  const floatingProvided = hasRawProp('floating')

  const floatingState = useControllableState<LayoutFloating | undefined>({
    value: () => props.floating,
    defaultValue: () => props.defaultFloating,
    isControlled: floatingProvided,
    onChange: (nextFloating) => nextFloating && emit('update:floating', nextFloating),
  })

  const resolvedMode = computed<LayoutMode>(() => props.mode ?? 'normal')
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
