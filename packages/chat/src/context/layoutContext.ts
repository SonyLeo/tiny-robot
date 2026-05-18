import { inject, provide } from 'vue'
import type { ChatLayoutStore } from '@/types/layout'
import { chatLayoutStoreKey } from '@/context/keys'

function missingProvider(providerName: string): never {
  throw new Error(
    `[tiny-robot/chat] ${providerName} is missing. Make sure the component is used inside Chat.Root / Chat.Layout.`,
  )
}

export function provideChatLayoutStore(store: ChatLayoutStore): void {
  provide(chatLayoutStoreKey, store)
}

export function useChatLayoutStoreContext(): ChatLayoutStore {
  return inject(chatLayoutStoreKey) ?? missingProvider('Chat layout store')
}
