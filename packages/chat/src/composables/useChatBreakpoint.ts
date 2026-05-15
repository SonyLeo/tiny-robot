import { useWindowSize } from '@vueuse/core'
import { computed, readonly, toValue, type MaybeRefOrGetter } from 'vue'

export interface UseChatBreakpointOptions {
  mobileBreakpoint: MaybeRefOrGetter<number>
}

export function useChatBreakpoint(options: UseChatBreakpointOptions) {
  const { width } = useWindowSize()

  const mobileBreakpoint = computed(() => Number(toValue(options.mobileBreakpoint)))
  const isMobile = computed(() => width.value <= mobileBreakpoint.value)

  return {
    width: readonly(width),
    mobileBreakpoint,
    isMobile,
  }
}
