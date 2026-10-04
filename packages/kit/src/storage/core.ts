import type { ConversationStorage } from '../conversation/types'
import { IndexedDBStrategy as LegacyIndexedDBStrategy } from './indexedDBStrategy'
import { LocalStorageStrategy as LegacyLocalStorageStrategy } from './localStorageStrategy'
import {
  indexedDBStorageStrategyFactory as legacyIndexedDBStorageStrategyFactory,
  localStorageStrategyFactory as legacyLocalStorageStrategyFactory,
  type IndexedDBConfig,
  type LocalStorageConfig,
} from './factories'

/** Storage contract for the core message type used by Angular and other consumers. */
export type CoreConversationStorageStrategy = ConversationStorage

/** Runtime-compatible storage classes with the shared core declaration shape. */
export const LocalStorageStrategy = LegacyLocalStorageStrategy as unknown as {
  new (storageKey?: string): CoreConversationStorageStrategy
}
export const IndexedDBStrategy = LegacyIndexedDBStrategy as unknown as {
  new (dbName?: string, dbVersion?: number): CoreConversationStorageStrategy
}

export const localStorageStrategyFactory = (
  config: LocalStorageConfig = {},
): CoreConversationStorageStrategy => legacyLocalStorageStrategyFactory(config) as unknown as CoreConversationStorageStrategy

export const indexedDBStorageStrategyFactory = (
  config: IndexedDBConfig = {},
): CoreConversationStorageStrategy => legacyIndexedDBStorageStrategyFactory(config) as unknown as CoreConversationStorageStrategy

export type { IndexedDBConfig, LocalStorageConfig }
