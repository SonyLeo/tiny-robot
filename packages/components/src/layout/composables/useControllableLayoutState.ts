import { computed } from 'vue'
import type {
  LayoutDefaultFloatingConfig,
  LayoutEmits,
  LayoutFloatingRect,
  LayoutMode,
  LayoutRuntimeProps,
} from '../index.type'
import type { UseControllableLayoutStateResult } from '../internal.type'
import { useControllableState } from './useControllableState'
import { usePropPresence } from './usePropPresence'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

type LayoutFloatingState = LayoutFloatingRect | LayoutDefaultFloatingConfig

function isFloatingRect(value: LayoutFloatingState | undefined): value is LayoutFloatingRect {
  return value !== undefined && 'x' in value && 'y' in value
}

function isFloatingRectEqual(left: LayoutFloatingState | undefined, right: LayoutFloatingRect | undefined): boolean {
  if (!left || !right || !isFloatingRect(left)) {
    return false
  }

  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height &&
    left.draggable === right.draggable &&
    left.resizable === right.resizable &&
    left.minWidth === right.minWidth &&
    left.maxWidth === right.maxWidth &&
    left.minHeight === right.minHeight &&
    left.maxHeight === right.maxHeight
  )
}

export function useControllableLayoutState(props: LayoutRuntimeProps, emit: EmitFn): UseControllableLayoutStateResult {
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

  const floatingState = useControllableState<LayoutFloatingState>({
    value: () => ('floating' in props ? props.floating : undefined),
    defaultValue: () => (defaultFloatingProvided ? props.defaultFloating : undefined),
    isControlled: floatingProvided,
    onChange: (nextFloating) => {
      if (isFloatingRect(nextFloating)) {
        emit('update:floating', nextFloating)
      }
    },
  })

  const resolvedMode = computed<LayoutMode>(() => modeState.resolvedState.value ?? 'normal')
  const resolvedFloating = computed(() => floatingState.resolvedState.value)

  function initializeFloating(nextFloating: LayoutFloatingRect): void {
    if (isFloatingRectEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating, { notify: false })
  }

  function commitFloating(nextFloating: LayoutFloatingRect): void {
    if (isFloatingRectEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating)
  }

  return {
    resolvedMode,
    resolvedFloating,
    initializeFloating,
    commitFloating,
  }
}
