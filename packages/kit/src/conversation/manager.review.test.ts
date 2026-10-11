import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConversationManager } from './manager'
import type { MessageEngine, PublicMessageState } from '../message/types'

const source = () => {
  const state: PublicMessageState = {
    requestState: 'idle',
    messages: [{ role: 'assistant', content: 'initial' }],
    isProcessing: false,
    isPaused: false,
    canStartTurn: true,
  }
  const listeners = new Set<() => void>()
  let failSnapshot = false
  const engine: MessageEngine = {
    getState: () => {
      if (failSnapshot) throw new Error('snapshot failed')
      return state
    },
    subscribe: (...args: unknown[]) => {
      const listener = args.at(-1) as () => void
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    abort: vi.fn(async () => undefined),
    sendMessage: async () => undefined,
    send: async () => undefined,
    setResponseProvider: () => undefined,
    dispatchCommand: async <T>() => undefined as T,
    updateMessage: () => undefined,
    setMessages: () => undefined,
  }
  return {
    engine,
    state,
    change(content: string) {
      state.messages[0].content = content
      listeners.forEach((listener) => listener())
    },
    failSnapshots(value: boolean) {
      failSnapshot = value
    },
  }
}

afterEach(() => vi.useRealTimers())

describe('manager independent review gates', () => {
  it('does not publish stale state after a subscriber synchronously creates a conversation', async () => {
    const manager = createConversationManager({ engineFactory: () => source().engine })
    let created = false
    manager.subscribe((state) => {
      if (!created && state.activeConversationId === 'a') {
        created = true
        manager.createConversation({ id: 'b' })
      }
    })
    const observed: Array<string | null> = []
    manager.subscribe((state) => observed.push(state.activeConversationId))
    manager.createConversation({ id: 'a' })
    expect(observed.at(-1)).toBe('b')
    expect(manager.getState().activeConversationId).toBe('b')
    await manager.dispose()
  })

  it('keeps an engine that becomes active while its idle release is flushing storage', async () => {
    let release!: () => void
    let started!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const pending = new Promise<void>((resolve) => {
      started = resolve
    })
    let block = false
    const manager = createConversationManager({
      engineFactory: () => source().engine,
      storage: {
        saveMessages: async (id) => {
          if (block && id === 'a') {
            started()
            await gate
          }
        },
      },
    })
    manager.createConversation({ id: 'a' })
    manager.createConversation({ id: 'b' })
    await manager.flush()
    block = true
    const saving = manager.saveMessages('a')
    await pending
    const recycling = manager.releaseInactiveEngines('b')
    await manager.switchConversation('a')
    release()
    await Promise.all([saving, recycling])
    expect(manager.getEngine('a')).toBeDefined()
    expect(manager.getState().activeConversationId).toBe('a')
    await manager.dispose()
  })

  it('clears persisted conversations whose initial list has not arrived yet', async () => {
    const records = new Map([['unseen', { id: 'unseen', createdAt: 1, updatedAt: 1 }]])
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let firstLoad = true
    const manager = createConversationManager({
      engineFactory: () => source().engine,
      storage: {
        loadConversations: async () => {
          const result = [...records.values()]
          if (firstLoad) {
            firstLoad = false
            await gate
          }
          return result
        },
        loadMessages: () => [],
        deleteConversation: (id) => {
          records.delete(id)
        },
      },
    })
    const loading = manager.load()
    const clearing = manager.clear()
    release()
    await Promise.all([loading, clearing])
    expect(records.size).toBe(0)
    expect(await manager.load()).toEqual([])
    await manager.dispose()
  })

  it('cancels a processing engine without waiting for an unrelated blocked save', async () => {
    const current = source()
    current.state.requestState = 'processing'
    current.state.isProcessing = true
    current.state.canStartTurn = false
    let release!: () => void
    let started!: () => void
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    const saving = new Promise<void>((resolve) => {
      started = resolve
    })
    const manager = createConversationManager({
      engineFactory: () => current.engine,
      storage: {
        saveMessages: () => {
          started()
          return pending
        },
        deleteConversation: () => undefined,
      },
    })
    manager.createConversation({ id: 'running' })
    await saving
    const deleting = manager.deleteConversation('running')
    try {
      await Promise.resolve()
      expect(current.engine.abort).toHaveBeenCalledOnce()
    } finally {
      release()
      await deleting
      await manager.dispose()
    }
  })

  it('does not enable automatic persistence when recycling an autosave-disabled engine', async () => {
    const current = source(),
      saves: string[] = []
    const manager = createConversationManager({
      engineFactory: () => current.engine,
      storage: {
        saveMessages: (_id, messages) => {
          saves.push(String(messages[0].content))
        },
      },
    })
    manager.createConversation({ id: 'manual' })
    await manager.flush()
    current.change('unsaved')
    await manager.releaseInactiveEngines()
    expect(saves).toEqual(['initial'])
    await manager.dispose()
  })

  it('reports and rejects a tail snapshot failure before the storage queue receives it', async () => {
    vi.useFakeTimers()
    const current = source(),
      onPersistenceError = vi.fn()
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: () => current.engine,
      onPersistenceError,
      storage: { saveMessages: () => undefined },
    })
    manager.createConversation({ id: 'tail' })
    await manager.flush()
    current.change('leading')
    await manager.flush()
    current.change('tail')
    current.failSnapshots(true)
    await expect(manager.flush()).rejects.toThrow('snapshot failed')
    expect(onPersistenceError).toHaveBeenCalledWith(expect.any(Error), 'tail')
    current.failSnapshots(false)
    await manager.saveMessages()
    await manager.dispose()
  })
})
