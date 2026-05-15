import { inject, provide } from 'vue'
import type { ChatLayoutConfig, ChatLayoutStore } from '@/types/layout'
import { chatLayoutConfigKey, chatLayoutStoreKey } from '@/context/keys'

function missingProvider(providerName: string): never {
  throw new Error(
    `[tiny-robot/chat] ${providerName} is missing. Make sure the component is used inside Chat.Root / Chat.Layout.`,
  )
}

export function provideChatLayoutStore(store: ChatLayoutStore): void {
  provide(chatLayoutStoreKey, store)
}

export function provideChatLayoutConfig(config: ChatLayoutConfig): void {
  provide(chatLayoutConfigKey, config)
}

export function useChatLayoutStoreContext(): ChatLayoutStore {
  return inject(chatLayoutStoreKey) ?? missingProvider('Chat layout store')
}

export function useChatLayoutConfigContext(): ChatLayoutConfig {
  return inject(chatLayoutConfigKey) ?? missingProvider('Chat layout config')
}
