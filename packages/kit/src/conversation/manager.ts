import type { MessageEngine } from '../message/types'
import type {
  ConversationInfo,
  ConversationManager,
  CreateConversationManagerOptions,
  ManagedConversation,
  ConversationManagerState,
  SharedConversationMessage,
} from './types'

export const createConversationManager = (options: CreateConversationManagerOptions): ConversationManager => {
  const storage = options.storage
  const conversations = new Map<string, ManagedConversation>()
  const engines = new Map<string, MessageEngine>()
  const generations = new Map<string, number>()
  const tombstones = new Set<string>()
  const loading = new Map<string, { generation: number; task: Promise<MessageEngine | null> }>()
  const persistence = new Map<string, Promise<void>>()
  const autoSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const engineSubscriptions = new Map<string, () => void>()
  const disposed = { value: false }
  let disposePromise: Promise<void> | undefined
  const subscribers = new Set<(state: ConversationManagerState) => void>()
  let activeConversationId: string | null = null
  let switchIntent = 0
  let loaded = false

  const snapshot = (): ConversationManagerState => ({
    conversations: Array.from(conversations.values()).map(({ engine: _engine, generation: _generation, ...info }) => ({ ...info })),
    activeConversationId,
  })
  const notify = () => {
    const state = snapshot()
    subscribers.forEach((listener) => listener(state))
  }
  const nextGeneration = (id: string) => {
    const generation = (generations.get(id) ?? 0) + 1
    generations.set(id, generation)
    return generation
  }
  const current = (id: string, generation: number) => generations.get(id) === generation && conversations.has(id)
  const defaultId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  const enqueue = (id: string, operation: () => Promise<void>) => {
    const previous = persistence.get(id) ?? Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    persistence.set(id, current)
    void current.then(() => {
      if (persistence.get(id) === current) persistence.delete(id)
    }, () => {
      if (persistence.get(id) === current) persistence.delete(id)
    })
    return current
  }
  const snapshotMessages = (engine: MessageEngine): SharedConversationMessage[] =>
    engine.getState().messages.map((message) => structuredClone(message))
  const snapshotInfo = (info: ConversationInfo): ConversationInfo => ({
    id: info.id,
    title: info.title,
    createdAt: info.createdAt,
    updatedAt: info.updatedAt,
    metadata: info.metadata === undefined ? undefined : structuredClone(info.metadata),
  })
  const cancelAutoSave = (id: string) => {
    const timer = autoSaveTimers.get(id)
    if (timer !== undefined) clearTimeout(timer)
    autoSaveTimers.delete(id)
  }
  const persistSnapshot = (id: string, info: ConversationInfo, messages: SharedConversationMessage[]) => {
    if (!storage?.saveMessages && !storage?.saveConversation) return Promise.resolve()
    return enqueue(id, async () => {
      await storage?.saveConversation?.(info)
      await storage?.saveMessages?.(id, messages)
    })
  }
  const scheduleAutoSave = (id: string) => {
    if (disposed.value || options.autoSaveThrottle === undefined) return
    cancelAutoSave(id)
    const delay = Math.max(0, options.autoSaveThrottle)
    autoSaveTimers.set(id, setTimeout(() => {
      autoSaveTimers.delete(id)
      void saveMessages(id).catch(() => undefined)
    }, delay))
  }
  // Declared before the timer callback is invoked at runtime.
  const saveMessages = async (id?: string) => {
    const target = id ?? activeConversationId
    if (!target) return
    const engine = engines.get(target)
    if (!engine) return
    const info = conversations.get(target)
    if (!info) return
    await persistSnapshot(target, snapshotInfo(info), snapshotMessages(engine))
  }
  const watchEngine = (id: string, engine: MessageEngine) => {
    engineSubscriptions.get(id)?.()
    engineSubscriptions.set(id, engine.subscribe('messages', () => scheduleAutoSave(id)))
  }

  const load = async () => {
    if (!storage?.loadConversations) {
      loaded = true
      options.onLoad?.(snapshot().conversations)
      return snapshot().conversations
    }
    const list = await storage.loadConversations()
    if (!loaded) {
      for (const info of list ?? []) {
        if (!conversations.has(info.id) && !tombstones.has(info.id)) {
          const generation = generations.get(info.id) ?? 0
          generations.set(info.id, generation)
          conversations.set(info.id, { ...info, generation })
        }
      }
      loaded = true
    } else {
      for (const info of list ?? []) {
        if (!conversations.has(info.id) && !tombstones.has(info.id)) {
          const generation = generations.get(info.id) ?? 0
          generations.set(info.id, generation)
          conversations.set(info.id, { ...info, generation })
        }
      }
    }
    const result = snapshot().conversations
    notify()
    options.onLoad?.(result)
    return result
  }

  const createConversation = (params: Parameters<ConversationManager['createConversation']>[0] = {}) => {
    const id = params.id ?? (options.generateId?.() ?? defaultId())
    const now = Date.now()
    const generation = nextGeneration(id)
    tombstones.delete(id)
    const info: ManagedConversation = { id, title: params.title, createdAt: now, updatedAt: now, metadata: params.metadata, generation }
    const engine = options.engineFactory(id, [], { ...options.engineOptions, ...params.options })
    info.engine = engine
    conversations.set(id, info)
    engines.set(id, engine)
    watchEngine(id, engine)
    activeConversationId = id
    notify()
    void persistSnapshot(id, snapshotInfo(info), snapshotMessages(engine)).catch(() => undefined)
    return { ...info }
  }

  const loadMessages = async (id: string): Promise<MessageEngine | null> => {
    const existing = engines.get(id)
    if (existing) return existing
    const info = conversations.get(id)
    if (!info) return null
    const pending = loading.get(id)
    if (pending && pending.generation === info.generation) return pending.task
    const generation = info.generation
    const task = (async () => {
      let messages: SharedConversationMessage[] = []
      try {
        messages = (await storage?.loadMessages?.(id)) ?? []
      } catch {
        messages = []
      }
      if (!current(id, generation)) return null
      const engine = options.engineFactory(id, messages, options.engineOptions)
      engines.set(id, engine)
      const currentInfo = conversations.get(id)
      if (currentInfo) currentInfo.engine = engine
      watchEngine(id, engine)
      notify()
      return engine
    })()
    loading.set(id, { generation, task })
    try {
      return await task
    } finally {
      if (loading.get(id)?.task === task) loading.delete(id)
    }
  }

  const switchConversation = async (id: string) => {
    if (!conversations.has(id)) return null
    const intent = ++switchIntent
    const engine = await loadMessages(id)
    if (!conversations.has(id)) return null
    if (intent === switchIntent) {
      activeConversationId = id
      notify()
    }
    const info = conversations.get(id)!
    return { ...info, engine: engine ?? undefined }
  }

  const updateConversationTitle = async (id: string, title?: string) => {
    const info = conversations.get(id)
    if (!info) return
    info.title = title
    info.updatedAt = Date.now()
    notify()
    await enqueue(id, async () => {
      await storage?.saveConversation?.(snapshotInfo(info))
    })
  }

  const deleteConversation = async (id: string) => {
    const info = conversations.get(id)
    if (!info) return
    nextGeneration(id)
    cancelAutoSave(id)
    engineSubscriptions.get(id)?.()
    engineSubscriptions.delete(id)
    tombstones.add(id)
    conversations.delete(id)
    engines.delete(id)
    loading.delete(id)
    if (activeConversationId === id) activeConversationId = null
    notify()
    await enqueue(id, async () => {
      await storage?.deleteConversation?.(id)
    })
  }

  const clear = async () => {
    const ids = Array.from(conversations.keys())
    ids.forEach((id) => { nextGeneration(id); cancelAutoSave(id); engineSubscriptions.get(id)?.(); engineSubscriptions.delete(id) })
    conversations.clear()
    engines.clear()
    loading.clear()
    activeConversationId = null
    notify()
    await Promise.all(ids.map((id) => enqueue(id, async () => { await storage?.deleteConversation?.(id) })))
  }

  const flush = async (id?: string) => {
    if (id) {
      await persistence.get(id)
      return
    }
    await Promise.all(Array.from(persistence.values()))
  }

  const dispose = async () => {
    if (disposePromise) return disposePromise
    disposed.value = true
    for (const id of autoSaveTimers.keys()) cancelAutoSave(id)
    for (const unsubscribe of engineSubscriptions.values()) unsubscribe()
    engineSubscriptions.clear()
    disposePromise = (async () => {
      await Promise.all(Array.from(engines.values()).map((engine) => engine.abort().catch(() => undefined)))
      await flush()
      subscribers.clear()
    })()
    return disposePromise
  }

  return {
    getState: snapshot,
    subscribe(listener) {
      subscribers.add(listener)
      return () => subscribers.delete(listener)
    },
    load,
    createConversation,
    loadMessages,
    switchConversation,
    updateConversationTitle,
    deleteConversation,
    clear,
    getEngine: (id) => engines.get(id),
    saveMessages,
    flush,
    dispose,
  }
}

export * from './types'
