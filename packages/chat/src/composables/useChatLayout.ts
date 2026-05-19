import { inject, provide, type InjectionKey } from 'vue'
import type { ChatLayoutStore } from '@/types/layout.internal'

const chatLayoutStoreKey: InjectionKey<ChatLayoutStore> = Symbol('ChatLayoutStore')

function missingProvider(providerName: string): never {
  throw new Error(`[tiny-robot/chat] ${providerName} is missing. Make sure the component is used inside Chat.Layout.`)
}

export function provideChatLayoutStore(store: ChatLayoutStore): void {
  provide(chatLayoutStoreKey, store)
}

export function useChatLayout(): ChatLayoutStore {
  return inject(chatLayoutStoreKey) ?? missingProvider('Chat layout store')
}
