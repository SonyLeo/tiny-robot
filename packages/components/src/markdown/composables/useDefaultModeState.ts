import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export interface TrMarkdownDefaultModeState<T extends string> {
  mode: Ref<T>
  setMode: (nextMode: T) => void
}

export const useDefaultModeState = <T extends string>(
  defaultMode: MaybeRefOrGetter<T>,
): TrMarkdownDefaultModeState<T> => {
  const mode = ref(toValue(defaultMode)) as Ref<T>

  const setMode = (nextMode: T) => {
    mode.value = nextMode
  }

  watch(
    () => toValue(defaultMode),
    (nextMode) => {
      mode.value = nextMode
    },
  )

  return {
    mode,
    setMode,
  }
}
