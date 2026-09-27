import { computed, inject, signal, DestroyRef } from '@angular/core'
import { createMessageEngine } from './message/core'
import { createNativeMessageAdapter } from './message/adapters/native'
import type {
  ChatMessage,
  CreateMessageEngineOptions,
  MessageEngine,
  ResponseProvider,
} from './message/types'

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
