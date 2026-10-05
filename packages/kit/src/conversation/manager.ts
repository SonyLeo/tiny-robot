import type { CreateMessageEngineOptions, MessageEngine } from '../message/types'
import { clearTurnSnapshot } from '../message/core/turnPersistence'
import { unwrapProxy } from '../storage/utils'
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
  const engineOptions = new Map<string, CreateMessageEngineOptions>()
  const generations = new Map<string, number>()
  const tombstones = new Set<string>()
  const loading = new Map<string, { generation: number; task: Promise<MessageEngine | null> }>()
  const persistence = new Map<string, Promise<void>>()
  const persistenceErrors = new Map<string, unknown>()
  const dirty = new Set<string>()
  const lastAutoSave = new Map<string, number>()
  const autoSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const engineSubscriptions = new Map<string, () => void>()
  const subscribers = new Set<(state: ConversationManagerState) => void>()
  let disposed = false
  let disposePromise: Promise<void> | undefined
  let activeConversationId: string | null = null
  let switchIntent = 0
  let listEpoch = 0
  let listLoaded = false
  let listLoading: { epoch: number; source: Promise<ConversationInfo[]>; task: Promise<ConversationInfo[]> } | undefined
  let clearBarrier: Promise<void> | undefined
  const pendingNotifications: ConversationManagerState[] = []
  let notifying = false

  const ensureActive = () => {
    if (disposed) throw new Error('Conversation manager is disposed')
  }
  const snapshot = (): ConversationManagerState => ({
    conversations: Array.from(conversations.values()).map(({ engine: _engine, generation: _generation, ...info }) => ({
      ...info,
    })),
    activeConversationId,
  })
  const notify = () => {
    if (disposed) return
    pendingNotifications.push(snapshot())
    if (notifying) return
    notifying = true
    try {
      while (!disposed && pendingNotifications.length > 0) {
        const state = pendingNotifications.shift()!
        for (const listener of Array.from(subscribers)) {
          if (disposed) break
          if (!subscribers.has(listener)) continue
          try {
            listener(state)
          } catch (error) {
            console.error('[ConversationManager] subscriber failed:', error)
          }
        }
      }
    } finally {
      notifying = false
      pendingNotifications.length = 0
    }
  }
  const nextGeneration = (id: string) => {
    const generation = (generations.get(id) ?? 0) + 1
    generations.set(id, generation)
    return generation
  }
  const current = (id: string, generation: number, engine?: MessageEngine) =>
    !disposed && generations.get(id) === generation && conversations.has(id) && (!engine || engines.get(id) === engine)
  const defaultId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  const materialize = <T>(value: T): T => structuredClone(unwrapProxy(value))
  const snapshotMessages = (engine: MessageEngine): SharedConversationMessage[] =>
    materialize(engine.getState().messages)
  const snapshotInfo = (info: ConversationInfo): ConversationInfo => ({
    id: info.id,
    title: info.title,
    createdAt: info.createdAt,
    updatedAt: info.updatedAt,
    metadata: info.metadata === undefined ? undefined : materialize(info.metadata),
  })
  const reportPersistenceError = (error: unknown, id: string) => {
    persistenceErrors.set(id, error)
    try {
      if (options.onPersistenceError) options.onPersistenceError(error, id)
      else console.error(`[ConversationManager] persistence failed for ${id}:`, error)
    } catch (callbackError) {
      console.error('[ConversationManager] persistence error callback failed:', callbackError)
    }
  }
  const enqueue = (id: string, operation: () => Promise<void>, bypassClear = false) => {
    const previous = persistence.get(id)
    const barrier = bypassClear ? undefined : clearBarrier
    // Register a placeholder before invoking storage: a synchronous callback can
    // reenter the manager, and must enqueue behind this operation.
    let resolveTask!: () => void
    let rejectTask!: (error: unknown) => void
    const task = new Promise<void>((resolve, reject) => {
      resolveTask = resolve
      rejectTask = reject
    })
    persistence.set(id, task)
    void task.then(
      () => {
        persistenceErrors.delete(id)
        if (persistence.get(id) === task) persistence.delete(id)
      },
      (error) => {
        reportPersistenceError(error, id)
        if (persistence.get(id) === task) persistence.delete(id)
      },
    )
    const invoke = () => {
      try {
        void Promise.resolve(operation()).then(resolveTask, rejectTask)
      } catch (error) {
        rejectTask(error)
      }
    }
    if (previous || barrier) {
      void Promise.all([previous?.catch(() => undefined), barrier?.catch(() => undefined)]).then(invoke)
    } else invoke()
    return task
  }
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
  const saveEngine = (id: string, engine: MessageEngine, publish = true): Promise<void> => {
    const info = conversations.get(id)
    if (!info) return Promise.resolve()
    if (!storage?.saveMessages && !storage?.saveConversation) {
      dirty.delete(id)
      return Promise.resolve()
    }
    info.updatedAt = Date.now()
    // Clone only when a save enters the queue, never for every incoming token.
    let version: ConversationInfo
    let messages: SharedConversationMessage[]
    try {
      version = snapshotInfo(info)
      messages = snapshotMessages(engine)
    } catch (error) {
      reportPersistenceError(error, id)
      return Promise.reject(error)
    }
    dirty.delete(id)
    const saving = persistSnapshot(id, version, messages)
    if (publish) notify()
    return saving
  }
  const saveMessages = async (id?: string) => {
    ensureActive()
    const target = id ?? activeConversationId
    if (!target) return
    const engine = engines.get(target)
    if (!engine) return
    cancelAutoSave(target)
    await saveEngine(target, engine)
  }
  const scheduleAutoSave = (id: string) => {
    if (disposed || !engines.has(id) || options.autoSaveThrottle === undefined) return
    dirty.add(id)
    const delay = Math.max(0, options.autoSaveThrottle)
    const previous = lastAutoSave.get(id)
    const remaining = previous === undefined ? 0 : delay - (Date.now() - previous)
    const save = () => {
      autoSaveTimers.delete(id)
      const engine = engines.get(id)
      if (disposed || !engine || !dirty.has(id)) return
      lastAutoSave.set(id, Date.now())
      try {
        void saveEngine(id, engine).catch((error) => {
          // Queue failures are already reported. Snapshot failures also need a report.
          if (!persistenceErrors.has(id)) reportPersistenceError(error, id)
        })
      } catch (error) {
        reportPersistenceError(error, id)
      }
    }
    if (remaining <= 0) {
      cancelAutoSave(id)
      save()
    } else if (!autoSaveTimers.has(id)) {
      autoSaveTimers.set(id, setTimeout(save, remaining))
    }
  }
  const notifyMessagesChanged = (id: string) => {
    ensureActive()
    scheduleAutoSave(id)
  }
  const callEngineHook = (kind: 'created' | 'released', id: string, engine: MessageEngine) => {
    try {
      if (kind === 'created') options.onEngineCreated?.(id, engine)
      else options.onEngineReleased?.(id, engine)
    } catch (error) {
      console.error(`[ConversationManager] engine ${kind} callback failed:`, error)
    }
  }
  const watchEngine = (id: string, generation: number, engine: MessageEngine) => {
    let subscribing = true
    const unsubscribe = engine.subscribe('messages', () => {
      if (!subscribing && current(id, generation, engine)) scheduleAutoSave(id)
    })
    subscribing = false
    engineSubscriptions.set(id, unsubscribe)
    callEngineHook('created', id, engine)
  }
  const detachEngine = (id: string, engine: MessageEngine) => {
    if (engines.get(id) !== engine) return
    cancelAutoSave(id)
    lastAutoSave.delete(id)
    dirty.delete(id)
    engineSubscriptions.get(id)?.()
    engineSubscriptions.delete(id)
    engines.delete(id)
    const info = conversations.get(id)
    if (info) delete info.engine
    callEngineHook('released', id, engine)
  }
  const createEngine = (
    id: string,
    generation: number,
    messages: SharedConversationMessage[],
    config: CreateMessageEngineOptions,
  ) => {
    const pausePersistence = {
      name: 'conversation-persistence',
      onTurnPause: async () => {
        const engine = engines.get(id)
        if (engine && current(id, generation, engine)) {
          cancelAutoSave(id)
          await saveEngine(id, engine)
        }
      },
    }
    return options.engineFactory(id, messages, {
      ...config,
      initialMessages: messages,
      plugins: options.autoSaveThrottle === undefined ? config.plugins : [pausePersistence, ...(config.plugins ?? [])],
    })
  }

  const load = async () => {
    ensureActive()
    if (clearBarrier) {
      await clearBarrier
      if (disposed) return snapshot().conversations
    }
    const epoch = listEpoch
    if (listLoading?.epoch === epoch) return listLoading.task
    const source = Promise.resolve(storage?.loadConversations?.() ?? [])
    const task = (async () => {
      const list = await source
      if (disposed) return snapshot().conversations
      if (epoch === listEpoch) {
        listLoaded = true
        for (const info of list) {
          if (!conversations.has(info.id) && !tombstones.has(info.id)) {
            const generation = generations.get(info.id) ?? 0
            generations.set(info.id, generation)
            conversations.set(info.id, { ...info, generation })
          }
        }
      }
      const result = snapshot().conversations
      notify()
      if (!disposed) options.onLoad?.(result)
      return result
    })()
    listLoading = { epoch, source, task }
    try {
      return await task
    } finally {
      if (listLoading?.task === task) listLoading = undefined
    }
  }

  const createConversation = (params: Parameters<ConversationManager['createConversation']>[0] = {}) => {
    ensureActive()
    const id = params.id ?? options.generateId?.() ?? defaultId()
    if (conversations.has(id)) throw new Error(`Conversation ${id} already exists`)
    const now = Date.now()
    const config = { ...options.engineOptions, ...params.options }
    const messages = materialize(config.initialMessages ?? [])
    // Materialize inputs before publishing a partially created conversation.
    const metadata = params.metadata === undefined ? undefined : materialize(params.metadata)
    const generation = nextGeneration(id)
    const engine = createEngine(id, generation, messages, config)
    const info: ManagedConversation = {
      id,
      title: params.title,
      createdAt: now,
      updatedAt: now,
      metadata,
      generation,
      engine,
    }
    tombstones.delete(id)
    const existing = Array.from(conversations.entries())
    conversations.clear()
    conversations.set(id, info)
    existing.forEach(([key, value]) => conversations.set(key, value))
    engineOptions.set(id, { ...config, initialMessages: messages })
    engines.set(id, engine)
    activeConversationId = id
    ++switchIntent
    void saveEngine(id, engine, false).catch(() => undefined)
    watchEngine(id, generation, engine)
    notify()
    return { ...info }
  }

  const loadMessages = async (id: string): Promise<MessageEngine | null> => {
    ensureActive()
    const existing = engines.get(id)
    if (existing) return existing
    const info = conversations.get(id)
    if (!info) return null
    const pending = loading.get(id)
    if (pending && pending.generation === info.generation) return pending.task
    const generation = info.generation
    const config = engineOptions.get(id) ?? options.engineOptions ?? {}
    const task = (async () => {
      let messages = materialize(config.initialMessages ?? [])
      try {
        messages = (await storage?.loadMessages?.(id)) ?? messages
      } catch (error) {
        if (!disposed) console.error('[ConversationManager] loadMessages failed:', error)
      }
      if (!current(id, generation)) return null
      const engine = createEngine(id, generation, messages, config)
      engines.set(id, engine)
      conversations.get(id)!.engine = engine
      watchEngine(id, generation, engine)
      if (!current(id, generation, engine)) return null
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
    ensureActive()
    const info = conversations.get(id)
    if (!info) return null
    const generation = info.generation
    const intent = ++switchIntent
    const engine = await loadMessages(id)
    if (!engine || !current(id, generation, engine)) return null
    if (intent === switchIntent) {
      activeConversationId = id
      notify()
    }
    return { ...conversations.get(id)!, engine }
  }

  const updateConversationTitle = async (id: string, title?: string) => {
    ensureActive()
    const info = conversations.get(id)
    if (!info) return
    info.title = title
    info.updatedAt = Date.now()
    let version: ConversationInfo
    try {
      version = snapshotInfo(info)
    } catch (error) {
      reportPersistenceError(error, id)
      throw error
    }
    const saving = enqueue(id, async () => {
      await storage?.saveConversation?.(version)
    })
    notify()
    await saving
  }

  const clearMessageSnapshots = (messages: SharedConversationMessage[]) => {
    const turnIds = new Set(
      messages.map((message) => message.state?.turnId).filter((id): id is string => typeof id === 'string'),
    )
    turnIds.forEach(clearTurnSnapshot)
  }
  const retireConversation = (id: string): Promise<void> => {
    const engine = engines.get(id)
    nextGeneration(id)
    tombstones.add(id)
    if (engine) detachEngine(id, engine)
    cancelAutoSave(id)
    conversations.delete(id)
    engineOptions.delete(id)
    loading.delete(id)
    if (activeConversationId === id) {
      activeConversationId = null
      ++switchIntent
    }
    // Cancellation must not wait for a slow storage write. Storage deletion
    // still waits for both prior saves and this exact old engine's cancellation.
    const messages = engine?.getState().messages
    const mustWaitForAbort = !!engine && (engine.getState().isProcessing || engine.getState().isPaused)
    const cancellation = mustWaitForAbort ? engine!.abort() : Promise.resolve()
    void cancellation.catch(() => undefined)
    // Capture the old engine. A same-id recreation cannot be cancelled by this operation.
    return enqueue(
      id,
      async () => {
        const storedMessages = messages ?? (await storage?.loadMessages?.(id)) ?? []
        if (mustWaitForAbort) await cancellation
        clearMessageSnapshots(storedMessages)
        await storage?.deleteConversation?.(id)
      },
      true,
    )
  }
  const deleteConversation = async (id: string) => {
    ensureActive()
    if (!conversations.has(id)) return
    const deleting = retireConversation(id)
    notify()
    await deleting
  }
  const clear = async () => {
    ensureActive()
    const previousClear = clearBarrier
    const priorOperations = new Map(persistence)
    const existingIds = new Set(conversations.keys())
    // An initial list that has not arrived can contain histories never seen in
    // memory. Clear must delete those histories before newer saves are allowed.
    const source =
      listLoading?.source ?? (!listLoaded ? Promise.resolve(storage?.loadConversations?.() ?? []) : undefined)
    let resolveBarrier!: () => void
    let rejectBarrier!: (error: unknown) => void
    const barrier = new Promise<void>((resolve, reject) => {
      resolveBarrier = resolve
      rejectBarrier = reject
    })
    clearBarrier = barrier
    void barrier.catch(() => undefined)
    ++listEpoch
    ++switchIntent
    const deletions = Array.from(conversations.keys()).map(retireConversation)
    activeConversationId = null
    notify()
    try {
      const lateDeletion = (async () => {
        await previousClear?.catch(() => undefined)
        const list = (await source) ?? []
        await Promise.all(
          list
            .filter((info) => !existingIds.has(info.id))
            .map(async ({ id }) => {
              if (!conversations.has(id)) {
                tombstones.add(id)
                nextGeneration(id)
              }
              await priorOperations.get(id)?.catch(() => undefined)
              // Post-clear writes wait on barrier, so reading/deleting old storage
              // here cannot race a same-id recreation or queue behind its new save.
              try {
                clearMessageSnapshots((await storage?.loadMessages?.(id)) ?? [])
                await storage?.deleteConversation?.(id)
              } catch (error) {
                reportPersistenceError(error, id)
                throw error
              }
            }),
        )
      })()
      const results = await Promise.allSettled([...deletions, lateDeletion])
      const failed = results.find((result) => result.status === 'rejected')
      if (failed?.status === 'rejected') throw failed.reason
      resolveBarrier()
    } catch (error) {
      rejectBarrier(error)
      throw error
    } finally {
      if (clearBarrier === barrier) clearBarrier = undefined
    }
  }

  const drain = async (id?: string) => {
    if (clearBarrier) await clearBarrier
    // Work queued while awaiting an earlier save must also finish before this resolves.
    while (id ? persistence.has(id) : persistence.size > 0) {
      const tasks = id ? [persistence.get(id)!] : Array.from(persistence.values())
      await Promise.allSettled(tasks)
    }
    if (id) {
      if (persistenceErrors.has(id)) throw persistenceErrors.get(id)
    } else if (persistenceErrors.size > 0) throw persistenceErrors.values().next().value
  }
  const flush = async (id?: string) => {
    ensureActive()
    const ids = id ? [id] : Array.from(dirty)
    const tasks = ids.map(async (target) => {
      cancelAutoSave(target)
      const engine = engines.get(target)
      if (engine && dirty.has(target)) await saveEngine(target, engine)
    })
    const results = await Promise.allSettled(tasks)
    await drain(id)
    const failed = results.find((result) => result.status === 'rejected')
    if (failed?.status === 'rejected') throw failed.reason
  }
  const releaseInactiveEngines = async (excludeId?: string) => {
    ensureActive()
    const intent = switchIntent
    for (const [id, engine] of Array.from(engines)) {
      if (id === excludeId || !engine.getState().canStartTurn) continue
      await flush(id)
      if (!disposed && engines.get(id) === engine && engine.getState().canStartTurn) {
        // Direct framework mutations can happen while the previous save waits.
        // Keep draining the same engine's tail before removing its watcher.
        while (dirty.has(id)) await flush(id)
        if (disposed || engines.get(id) !== engine || !engine.getState().canStartTurn) continue
        if (switchIntent !== intent && activeConversationId === id) continue
        detachEngine(id, engine)
        notify()
      }
    }
  }

  const dispose = (): Promise<void> => {
    if (disposePromise) return disposePromise
    disposed = true
    ++listEpoch
    ++switchIntent
    for (const id of autoSaveTimers.keys()) cancelAutoSave(id)
    for (const unsubscribe of engineSubscriptions.values()) unsubscribe()
    engineSubscriptions.clear()
    subscribers.clear()
    pendingNotifications.length = 0
    loading.clear()
    listLoading = undefined
    const held = Array.from(engines)
    let resolveDisposal!: () => void
    let rejectDisposal!: (error: unknown) => void
    disposePromise = new Promise<void>((resolve, reject) => {
      resolveDisposal = resolve
      rejectDisposal = reject
    })
    // Stop framework watchers before abort can mutate messages. Captured engines
    // remain owned by the disposal task until their final saves finish.
    held.forEach(([id, engine]) => detachEngine(id, engine))
    void (async () => {
      const results = await Promise.allSettled(
        held.map(async ([id, engine]) => {
          // Paused approval snapshots belong to persisted history. Abort would erase them.
          if (engine.getState().isProcessing) await engine.abort()
          await saveEngine(id, engine)
        }),
      )
      try {
        const failed = results.find((result) => result.status === 'rejected')
        await drain()
        if (failed?.status === 'rejected') throw failed.reason
      } finally {
        dirty.clear()
        lastAutoSave.clear()
        engineOptions.clear()
      }
    })().then(resolveDisposal, rejectDisposal)
    return disposePromise
  }

  return {
    getState: snapshot,
    subscribe(listener) {
      ensureActive()
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
    notifyMessagesChanged,
    releaseInactiveEngines,
    flush,
    dispose,
  }
}

export * from './types'
