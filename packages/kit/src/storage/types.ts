import { ChatMessage, MaybePromise } from '../types'

export interface ConversationInfo {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title?: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 存储策略接口
 */
export interface ConversationStorageStrategy {
  /**
   * Load all conversations (id and title only).
   */
  loadConversations: () => MaybePromise<ConversationInfo[]>
  /**
   * Load all messages for a given conversation.
   */
  loadMessages: (conversationId: string) => MaybePromise<ChatMessage[]>
  /**
   * Persist conversation metadata (create or update).
   */
  saveConversation: (conversation: ConversationInfo) => MaybePromise<void>
  /**
   * Persist messages for a given conversation.
   */
  saveMessages: (conversationId: string, messages: ChatMessage[]) => MaybePromise<void>
  /**
   * Optional method to delete a conversation and its messages.
   */
  deleteConversation?: (conversationId: string) => MaybePromise<void>
}
