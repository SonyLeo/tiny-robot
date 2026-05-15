import type { InjectionKey } from 'vue'
import type { ChatLayoutConfig, ChatLayoutStore } from '@/types/layout'

export const chatLayoutStoreKey: InjectionKey<ChatLayoutStore> = Symbol('ChatLayoutStore')
export const chatLayoutConfigKey: InjectionKey<ChatLayoutConfig> = Symbol('ChatLayoutConfig')
