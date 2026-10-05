import type { CreateMessageEngineOptions, MessageEngine, ChatMessage } from '../message/types'

/** Storage-safe message bridge. It intentionally does not depend on the legacy root ChatMessage type. */
export type SharedConversationMessage = ChatMessage

export interface ConversationInfo {
  id: string
  title?: string
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

export interface ConversationStorage {
  loadConversations?: () => PromiseLike<ConversationInfo[]> | ConversationInfo[]
  loadMessages?: (id: string) => PromiseLike<SharedConversationMessage[]> | SharedConversationMessage[]
  saveConversation?: (conversation: ConversationInfo) => PromiseLike<void> | void
  saveMessages?: (id: string, messages: SharedConversationMessage[]) => PromiseLike<void> | void
  deleteConversation?: (id: string) => PromiseLike<void> | void
}

export interface ConversationEngineFactory {
  (id: string, initialMessages: SharedConversationMessage[], options?: CreateMessageEngineOptions): MessageEngine
}

export interface ManagedConversation extends ConversationInfo {
  engine?: MessageEngine
  generation: number
}

export interface ConversationManagerState {
  conversations: ConversationInfo[]
  activeConversationId: string | null
}

export interface ConversationManager {
  getState(): ConversationManagerState
  subscribe(listener: (state: ConversationManagerState) => void): () => void
  load(): Promise<ConversationInfo[]>
  createConversation(params?: {
    id?: string
    title?: string
    metadata?: Record<string, unknown>
    options?: CreateMessageEngineOptions
  }): ManagedConversation
  loadMessages(id: string): Promise<MessageEngine | null>
  switchConversation(id: string): Promise<ManagedConversation | null>
  updateConversationTitle(id: string, title?: string): Promise<void>
  deleteConversation(id: string): Promise<void>
  clear(): Promise<void>
  getEngine(id: string): MessageEngine | undefined
  saveMessages(id?: string): Promise<void>
  /** Reports direct framework mutations to the shared save scheduler. */
  notifyMessagesChanged(id: string): void
  /** Flushes and releases idle engines; processing and paused engines stay owned. */
  releaseInactiveEngines(excludeId?: string): Promise<void>
  flush(id?: string): Promise<void>
  dispose(): Promise<void>
}

export interface CreateConversationManagerOptions {
  storage?: ConversationStorage
  engineFactory: ConversationEngineFactory
  engineOptions?: CreateMessageEngineOptions
  generateId?: () => string
  onLoad?: (conversations: ConversationInfo[]) => void
  onPersistenceError?: (error: unknown, id: string) => void
  /** Framework facades/watchers follow the lifetime of the exact engine instance. */
  onEngineCreated?: (id: string, engine: MessageEngine) => void
  onEngineReleased?: (id: string, engine: MessageEngine) => void
  autoSaveThrottle?: number
}
