import { computed, ref, shallowRef, toRaw, watch, WatchStopHandle } from 'vue'
import { createConversationManager } from '../../conversation/manager'
import type { ConversationManagerState, ConversationStorage } from '../../conversation/types'
import type { CreateMessageEngineOptions, MessageEngine } from '../../message/types'
import { localStorageStrategyFactory } from '../../storage/factories'
import { ChatMessage } from '../../types'
import { UseMessageOptions } from '../message/types'
import { createVueMessageRuntime } from '../message/runtime'
import { Conversation, ConversationInfo, UseConversationOptions, UseConversationReturn } from './types'

// Carry Vue callbacks through the manager's options without exposing them as core plugins.
const vueOptions = Symbol('vue-message-options')
type VueEngineOptions = CreateMessageEngineOptions & { [vueOptions]: UseMessageOptions }

const toEngineOptions = (options: UseMessageOptions): VueEngineOptions => ({
  [vueOptions]: options,
  initialMessages: options.initialMessages as CreateMessageEngineOptions['initialMessages'],
})

export const useConversation = (options: UseConversationOptions): UseConversationReturn => {
  const storage = (options.storage || localStorageStrategyFactory()) as unknown as ConversationStorage
  const conversations = ref<ConversationInfo[]>([])
  const activeConversationId = ref<string | null>(null)
  const engineRevision = shallowRef(0)
  const runtimes = new WeakMap<MessageEngine, ReturnType<typeof createVueMessageRuntime>>()
  const watchers = new WeakMap<MessageEngine, WatchStopHandle>()

  const syncState = (state: ConversationManagerState) => {
    const existing = new Map(conversations.value.map((info) => [info.id, info]))
    const next = state.conversations.map((info) => {
      const previous = existing.get(info.id)
      if (!previous) return info
      Object.assign(previous, info)
      return previous
    })
    if (
      next.length !== conversations.value.length ||
      next.some((info, index) => toRaw(info) !== toRaw(conversations.value[index]))
    ) {
      conversations.value = next
    }
    activeConversationId.value = state.activeConversationId
  }

  const manager = createConversationManager({
    storage,
    engineOptions: toEngineOptions(options.useMessageOptions),
    autoSaveThrottle: options.autoSaveMessages ? (options.autoSaveThrottle ?? 1000) : undefined,
    engineFactory: (_id, initialMessages, config) => {
      const messageOptions = (config as VueEngineOptions)[vueOptions]
      const runtime = createVueMessageRuntime(
        { ...messageOptions, initialMessages: initialMessages as ChatMessage[] },
        config?.plugins,
      )
      runtimes.set(runtime.engine, runtime)
      return runtime.engine
    },
    onEngineCreated: (id, engine) => {
      const runtime = runtimes.get(engine)!
      if (options.autoSaveMessages) {
        // Vue plugins and consumers may mutate reactive messages without a core update event.
        // Report those writes immediately so releasing an engine always sees its dirty tail.
        watchers.set(
          engine,
          watch(runtime.api.messages, () => manager.notifyMessagesChanged(id), { deep: true, flush: 'sync' }),
        )
      }
      engineRevision.value++
    },
    onEngineReleased: (_id, engine) => {
      watchers.get(engine)?.()
      watchers.delete(engine)
      runtimes.get(engine)?.stop()
      runtimes.delete(engine)
      engineRevision.value++
    },
    onLoad: (items) => options.onLoad?.(items),
    onPersistenceError: (error, id) => console.error(`[useConversation] persistence failed for ${id}:`, error),
  })

  manager.subscribe(syncState)
  if (storage.loadConversations) {
    void manager.load().catch((error) => console.error('[useConversation] loadConversations failed:', error))
  }

  const activeConversation = computed<Conversation | null>(() => {
    void engineRevision.value
    const id = activeConversationId.value
    if (!id) return null
    const info = conversations.value.find((item) => item.id === id)
    const engine = manager.getEngine(id)
    const runtime = engine && runtimes.get(engine)
    return info && runtime ? { ...info, engine: runtime.api } : null
  })

  const createConversation: UseConversationReturn['createConversation'] = (params = {}) => {
    manager.createConversation({
      id: params.id,
      title: params.title,
      metadata: params.metadata,
      options: params.useMessageOptions
        ? toEngineOptions({ ...options.useMessageOptions, ...params.useMessageOptions })
        : undefined,
    })
    return activeConversation.value!
  }

  const switchConversation: UseConversationReturn['switchConversation'] = async (id) => {
    const conversation = await manager.switchConversation(id)
    if (!conversation) return null
    const runtime = conversation.engine && runtimes.get(conversation.engine)
    const info = conversations.value.find((item) => item.id === id)
    const result =
      activeConversation.value?.id === id
        ? activeConversation.value
        : runtime && info
          ? { ...info, engine: runtime.api }
          : null
    await manager.releaseInactiveEngines(manager.getState().activeConversationId ?? undefined)
    return result
  }

  const deleteConversation = async (id: string) => {
    await manager.deleteConversation(id)
    await manager.releaseInactiveEngines(manager.getState().activeConversationId ?? undefined)
  }

  const clear = () => {
    void manager.clear().catch((error) => console.error('[useConversation] clear failed:', error))
  }

  const updateConversationTitle = (id: string, title?: string) => {
    void manager
      .updateConversationTitle(id, title)
      .catch((error) => console.error('[useConversation] update title failed:', error))
  }

  const sendMessage = (content: string): Promise<void> =>
    activeConversation.value?.engine.sendMessage(content) ?? Promise.resolve()

  const setMessages: UseConversationReturn['setMessages'] = (messages) => {
    activeConversation.value?.engine.setMessages(messages)
  }

  const abortActiveRequest = async () => {
    await activeConversation.value?.engine.abortRequest()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    switchConversation,
    deleteConversation,
    clear,
    updateConversationTitle,
    saveMessages: manager.saveMessages,
    sendMessage,
    setMessages,
    abortActiveRequest,
  }
}
