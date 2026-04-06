import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'

const CONTENT_NAV_SCROLL_CONTAINER_KEY: InjectionKey<ComputedRef<HTMLElement | null | undefined>> = Symbol(
  'CONTENT_NAV_SCROLL_CONTAINER_KEY',
)

export function provideContentNavScrollContainer(container: Ref<HTMLElement | null | undefined>) {
  provide(
    CONTENT_NAV_SCROLL_CONTAINER_KEY,
    computed(() => container.value),
  )
}

export function useContentNavScrollContainer() {
  return inject(
    CONTENT_NAV_SCROLL_CONTAINER_KEY,
    computed(() => undefined),
  )
}
