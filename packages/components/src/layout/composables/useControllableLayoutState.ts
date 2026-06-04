import { computed, getCurrentInstance } from 'vue'
import type { LayoutEmits, LayoutFloatingConfig, LayoutMode, LayoutRuntimeProps } from '../index.type'
import type { UseControllableLayoutStateResult } from '../internal.type'
import { useControllableState } from './useControllableState'
import { hasVNodeProp } from '../utils/vnodeProp'

type EmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

function isFloatingConfigEqual(
  left: LayoutFloatingConfig | undefined,
  right: LayoutFloatingConfig | undefined,
): boolean {
  return (
    left?.x === right?.x &&
    left?.y === right?.y &&
    left?.width === right?.width &&
    left?.height === right?.height &&
    left?.draggable === right?.draggable &&
    left?.resizable === right?.resizable &&
    left?.minWidth === right?.minWidth &&
    left?.maxWidth === right?.maxWidth
  )
}

export function useControllableLayoutState(props: LayoutRuntimeProps, emit: EmitFn): UseControllableLayoutStateResult {
  const instance = getCurrentInstance()
  const modeProvided = hasVNodeProp(instance, 'mode')
  const defaultModeProvided = hasVNodeProp(instance, 'defaultMode')
  const floatingProvided = hasVNodeProp(instance, 'floating')
  const defaultFloatingProvided = hasVNodeProp(instance, 'defaultFloating')

  const modeState = useControllableState<LayoutMode>({
    value: () => ('mode' in props ? props.mode : undefined),
    defaultValue: () => (defaultModeProvided ? props.defaultMode : 'normal'),
    isControlled: modeProvided,
    onChange: (nextMode) => emit('update:mode', nextMode),
  })

  const floatingState = useControllableState<LayoutFloatingConfig>({
    value: () => ('floating' in props ? props.floating : undefined),
    defaultValue: () => (defaultFloatingProvided ? props.defaultFloating : undefined),
    isControlled: floatingProvided,
    onChange: (nextFloating) => emit('update:floating', nextFloating),
  })

  const resolvedMode = computed<LayoutMode>(() => modeState.resolvedState.value ?? 'normal')
  const resolvedFloating = computed(() => floatingState.resolvedState.value)

  function commitFloating(nextFloating: LayoutFloatingConfig): void {
    if (isFloatingConfigEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating)
  }

  return {
    resolvedMode,
    resolvedFloating,
    commitFloating,
  }
}
