import { computed } from 'vue'
import type { LayoutEmits, LayoutFloatingConfig, LayoutMode, LayoutProps } from '../index.type'
import type { UseControllableLayoutStateResult } from '../internal.type'
import { useControllableState } from './useControllableState'

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

export function useControllableLayoutState(props: LayoutProps, emit: EmitFn): UseControllableLayoutStateResult {
  const modeState = useControllableState<LayoutMode>({
    value: () => props.mode,
    defaultValue: () => props.defaultMode ?? 'normal',
    onChange: (nextMode) => emit('update:mode', nextMode),
  })

  const floatingState = useControllableState<LayoutFloatingConfig>({
    value: () => props.floating,
    defaultValue: () => props.defaultFloating,
    onChange: (nextFloating) => emit('update:floating', nextFloating),
  })

  const resolvedMode = computed<LayoutMode>(() => modeState.resolvedState.value ?? 'normal')
  const resolvedFloating = computed(() => floatingState.resolvedState.value)

  function commitMode(nextMode: LayoutMode): void {
    if (resolvedMode.value === nextMode) {
      return
    }

    modeState.commit(nextMode)
  }

  function commitFloating(nextFloating: LayoutFloatingConfig): void {
    if (isFloatingConfigEqual(resolvedFloating.value, nextFloating)) {
      return
    }

    floatingState.commit(nextFloating)
  }

  return {
    resolvedMode,
    resolvedFloating,
    commitMode,
    commitFloating,
  }
}
