import type { InjectionKey } from 'vue'
import type { ChatLayoutStore } from '@/types/layout'

export const chatLayoutStoreKey: InjectionKey<ChatLayoutStore> = Symbol('ChatLayoutStore')
