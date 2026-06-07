import { inject, provide, type InjectionKey } from 'vue'
import type { LayoutStore } from '../internal.type'
import { createLayoutStore } from './createLayoutStore'

const layoutStoreKey: InjectionKey<LayoutStore> = Symbol('LayoutStore')
const fallbackLayoutStore = createLayoutStore()

export function provideLayoutStore(store: LayoutStore): void {
  provide(layoutStoreKey, store)
}

export function useLayout(): LayoutStore {
  return inject(layoutStoreKey, fallbackLayoutStore)
}
