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
export type CoreIndexedDBStorageStrategy = CoreConversationStorageStrategy & Pick<LegacyIndexedDBStrategy, 'close'>

/** Runtime-compatible storage classes with the shared core declaration shape. */
export const LocalStorageStrategy = LegacyLocalStorageStrategy as unknown as {
  new (storageKey?: string): CoreConversationStorageStrategy
}
export const IndexedDBStrategy = LegacyIndexedDBStrategy as unknown as {
  new (dbName?: string, dbVersion?: number): CoreIndexedDBStorageStrategy
}

export const localStorageStrategyFactory = (
  config: LocalStorageConfig = {},
): CoreConversationStorageStrategy => legacyLocalStorageStrategyFactory(config) as unknown as CoreConversationStorageStrategy

export const indexedDBStorageStrategyFactory = (
  config: IndexedDBConfig = {},
): CoreIndexedDBStorageStrategy => legacyIndexedDBStorageStrategyFactory(config) as unknown as CoreIndexedDBStorageStrategy

export type { IndexedDBConfig, LocalStorageConfig }
