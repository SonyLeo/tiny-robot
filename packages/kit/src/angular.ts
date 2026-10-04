import { computed, inject, signal, DestroyRef } from '@angular/core'
import { createMessageEngine } from './message/core'
import { createNativeMessageAdapter } from './message/adapters/native'
import type {
  ChatMessage,
  CreateMessageEngineOptions,
  MessageEngine,
  ResponseProvider,
} from './message/types'
import type {
  ConversationInfo,
  ConversationManager,
  ConversationManagerState,
} from './conversation/types'

/** A mutable message view. Nested fields change in place; read revision in OnPush children. */
function createConnection(engine: MessageEngine, destroyRef: DestroyRef | undefined, ownsEngine: boolean) {
  const state = signal(engine.getState())
  const revision = signal(0)
  let disposed = false
  let disposal: Promise<void> | undefined
  let firstNotification = true
  const unsubscribe = engine.subscribe((next) => {
    if (firstNotification) {
      firstNotification = false
      return
    }
    if (disposed) return
    state.set(next)
    revision.update((value) => value + 1)
  })

  const ensureActive = () => {
    if (disposed) throw new Error('Angular message connection is disposed')
  }

  const dispose = () => {
    if (!disposal) {
      disposed = true
      unsubscribe()
      disposal = ownsEngine ? engine.abort() : Promise.resolve()
    }
    return disposal
  }
  destroyRef?.onDestroy(() => {
    void dispose().catch((error: unknown) => console.error('Error disposing Angular message connection:', error))
  })

  return {
    engine,
    state: state.asReadonly(),
    messages: computed(() => state().messages),
    requestState: computed(() => state().requestState),
    processingState: computed(() => state().processingState),
    isProcessing: computed(() => state().isProcessing),
    isPaused: computed(() => state().isPaused),
    canStartTurn: computed(() => state().canStartTurn),
    revision: revision.asReadonly(),
    sendMessage(content: string) {
      ensureActive()
      return engine.sendMessage(content)
    },
    send(...messages: ChatMessage[]) {
      ensureActive()
      return engine.send(...messages)
    },
    abort() {
      ensureActive()
      return engine.abort()
    },
    dispatchCommand<Result = unknown>(command: string, payload?: unknown) {
      ensureActive()
      return engine.dispatchCommand<Result>(command, payload)
    },
    setResponseProvider(provider: ResponseProvider) {
      ensureActive()
      engine.setResponseProvider(provider)
    },
    updateMessage(message: ChatMessage, recipe: (message: ChatMessage) => void) {
      ensureActive()
      engine.updateMessage(message, recipe)
    },
    dispose,
  }
}

export type AngularMessageConnection = ReturnType<typeof createConnection>

/** Connects to a caller-owned engine; disposal only detaches this connection. */
export function connectAngularMessage(engine: MessageEngine, destroyRef?: DestroyRef): AngularMessageConnection {
  return createConnection(engine, destroyRef, false)
}

/** Owns the engine. DestroyRef disposal detaches signals and aborts its active turn. */
export function createAngularMessage(options: CreateMessageEngineOptions = {}, destroyRef?: DestroyRef) {
  const engine = createMessageEngine(createNativeMessageAdapter(), options)
  return createConnection(engine, destroyRef, true)
}

/** Creates an owned connection in the current Angular injection context. */
export function injectAngularMessage(options: CreateMessageEngineOptions = {}) {
  return createAngularMessage(options, inject(DestroyRef))
}

/** Detaches on destroy while the caller retains ownership of the shared engine. */
export function injectSharedAngularMessage(engine: MessageEngine) {
  return connectAngularMessage(engine, inject(DestroyRef))
}

/** A Signals connection to an application-owned conversation manager. */
function createConversationConnection(manager: ConversationManager, destroyRef?: DestroyRef) {
  const state = signal<ConversationManagerState>(manager.getState())
  const revision = signal(0)
  const activeMessage = signal<AngularMessageConnection | null>(null)
  let disposed = false
  let disposal: Promise<void> | undefined

  const attachActiveEngine = (nextState: ConversationManagerState) => {
    const id = nextState.activeConversationId
    const engine = id ? manager.getEngine(id) : undefined
    const current = activeMessage()
    if (current?.engine === engine) return
    if (current) void current.dispose()
    activeMessage.set(engine ? connectAngularMessage(engine) : null)
  }

  const unsubscribe = manager.subscribe((nextState) => {
    if (disposed) return
    state.set(nextState)
    revision.update((value) => value + 1)
    attachActiveEngine(nextState)
  })
  attachActiveEngine(state())

  const ensureActive = () => {
    if (disposed) throw new Error('Angular conversation connection is disposed')
  }
  const dispose = () => {
    if (!disposal) {
      disposed = true
      unsubscribe()
      const message = activeMessage()
      activeMessage.set(null)
      disposal = message?.dispose() ?? Promise.resolve()
    }
    return disposal
  }
  destroyRef?.onDestroy(() => {
    void dispose().catch((error: unknown) => console.error('Error disposing Angular conversation connection:', error))
  })

  const activeConversation = computed<(ConversationInfo & { engine: MessageEngine }) | null>(() => {
    const id = state().activeConversationId
    if (!id) return null
    const info = state().conversations.find((conversation) => conversation.id === id)
    const engine = activeMessage()
    return info && engine && engine.engine === manager.getEngine(id) ? { ...info, engine: engine.engine } : null
  })
  const activeEngine = computed(() => activeMessage())

  return {
    manager,
    state: state.asReadonly(),
    conversations: computed<ConversationInfo[]>(() => state().conversations),
    activeConversationId: computed(() => state().activeConversationId),
    activeConversation,
    activeEngine,
    revision: revision.asReadonly(),
    load: () => { ensureActive(); return manager.load() },
    createConversation: (params?: Parameters<ConversationManager['createConversation']>[0]) => {
      ensureActive()
      return manager.createConversation(params)
    },
    loadMessages: (id: string) => { ensureActive(); return manager.loadMessages(id) },
    switchConversation: (id: string) => { ensureActive(); return manager.switchConversation(id) },
    updateConversationTitle: (id: string, title?: string) => { ensureActive(); return manager.updateConversationTitle(id, title) },
    deleteConversation: (id: string) => { ensureActive(); return manager.deleteConversation(id) },
    clear: () => { ensureActive(); return manager.clear() },
    saveMessages: (id?: string) => { ensureActive(); return manager.saveMessages(id) },
    flush: (id?: string) => { ensureActive(); return manager.flush(id) },
    sendMessage(content: string) {
      ensureActive()
      return activeMessage()?.sendMessage(content) ?? Promise.resolve()
    },
    send(...messages: ChatMessage[]) {
      ensureActive()
      return activeMessage()?.send(...messages) ?? Promise.resolve()
    },
    abort() {
      ensureActive()
      return activeMessage()?.abort() ?? Promise.resolve()
    },
    dispatchCommand<Result = unknown>(command: string, payload?: unknown) {
      ensureActive()
      return activeMessage()?.dispatchCommand<Result>(command, payload) ?? Promise.reject(new Error('No active conversation'))
    },
    dispose,
  }
}

export type AngularConversationConnection = ReturnType<typeof createConversationConnection>

/** Connects a view to an application-owned conversation manager. */
export function connectAngularConversation(manager: ConversationManager, destroyRef?: DestroyRef): AngularConversationConnection {
  return createConversationConnection(manager, destroyRef)
}

/** Creates a manager connection in the current Angular injection context. */
export function injectAngularConversation(manager: ConversationManager) {
  return connectAngularConversation(manager, inject(DestroyRef))
}
