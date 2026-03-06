import type { InjectionKey, Ref } from 'vue'
import type { UseChatKitReturn } from './types'

// 主状态注入 key：由 TrChatRoot provide，所有子组件 inject
export const CHAT_KIT_KEY: InjectionKey<UseChatKitReturn> = Symbol('chatKit')

// UI 状态注入 key：由 TrChat.vue / TrChatRoot.vue provide，供 Header/History 使用
export const CHAT_UI_KEY: InjectionKey<{
  showHistoryDrawer: Ref<boolean>
}> = Symbol('chatUI')

// BubbleList 允许的 slot 白名单
export const BUBBLE_LIST_SLOTS = ['prefix', 'suffix', 'after', 'content-footer'] as const
