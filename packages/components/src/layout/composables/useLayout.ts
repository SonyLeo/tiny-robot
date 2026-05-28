import { inject, provide, type InjectionKey } from 'vue'
import type { LayoutStore } from '../internal.type'

const layoutStoreKey: InjectionKey<LayoutStore> = Symbol('LayoutStore')

function missingProvider(providerName: string): never {
  throw new Error(`[tiny-robot/layout] ${providerName} is missing. Make sure the component is used inside Layout.`)
}

export function provideLayoutStore(store: LayoutStore): void {
  provide(layoutStoreKey, store)
}

export function useLayout(): LayoutStore {
  return inject(layoutStoreKey) ?? missingProvider('Layout store')
}
