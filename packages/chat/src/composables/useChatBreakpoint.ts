import { useMediaQuery } from '@vueuse/core'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface UseChatBreakpointOptions {
  mobileBreakpoint: MaybeRefOrGetter<number>
}

export function useChatBreakpoint(options: UseChatBreakpointOptions) {
  const mobileBreakpoint = computed(() => Number(toValue(options.mobileBreakpoint)))
  const isMobile = useMediaQuery(() => `(max-width: ${mobileBreakpoint.value}px)`)

  return {
    mobileBreakpoint,
    isMobile,
  }
}
