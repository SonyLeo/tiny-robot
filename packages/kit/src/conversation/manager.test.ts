import { describe, expect, it, vi } from 'vitest'
import { createConversationManager } from './manager'
import type { MessageEngine } from '../message/types'

const engine = (): MessageEngine => ({
  getState: () => ({ requestState: 'idle', messages: [], isProcessing: false, isPaused: false, canStartTurn: true }),
  subscribe: () => () => undefined,
  sendMessage: async () => undefined,
  send: async () => undefined,
  abort: async () => undefined,
  setResponseProvider: () => undefined,
  dispatchCommand: async <T>() => undefined as T,
  updateMessage: () => undefined,
})

describe('conversation manager persistence', () => {
  it('throttles automatic saves and materializes a stable message snapshot', async () => {
    vi.useFakeTimers()
    const saved: unknown[][] = []
    let state = { requestState: 'idle' as const, messages: [{ role: 'user' as const, content: 'first' }], isProcessing: false, isPaused: false, canStartTurn: true }
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: () => ({ ...engine(), getState: () => state, subscribe: (...args: unknown[]) => { void args; return () => undefined } }),
      storage: { saveMessages: async (_id, messages) => { saved.push(messages); return undefined } },
    })
    manager.createConversation({ id: 'auto' })
    state = { ...state, messages: [{ role: 'user', content: 'second' }] }
    await vi.advanceTimersByTimeAsync(20)
    await manager.flush('auto')
    expect(saved).toEqual([[{ role: 'user', content: 'first' }]])
    state.messages[0].content = 'mutated'
    expect(saved[0]).toEqual([{ role: 'user', content: 'first' }])
    await manager.dispose()
    vi.useRealTimers()
  })

  it('continues a per-id queue after a failed save', async () => {
    const events: string[] = []
    let failed = false
    const manager = createConversationManager({
      engineFactory: () => engine(),
      storage: {
        saveMessages: async (id) => { events.push(`save:${id}`); if (failed) { failed = false; throw new Error('temporary') } },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush('a')
    failed = true
    await expect(manager.saveMessages('a')).rejects.toThrow('temporary')
    await expect(manager.saveMessages('a')).resolves.toBeUndefined()
    expect(events).toEqual(['save:a', 'save:a', 'save:a'])
  })

  it('keeps delete before a same-id recreation save', async () => {
    const events: string[] = []
    const manager = createConversationManager({ engineFactory: () => engine(), storage: {
      deleteConversation: async (id) => { events.push(`delete:${id}`) },
      saveConversation: async ({ id }) => { events.push(`save:${id}`); return undefined },
    } })
    manager.createConversation({ id: 'same' })
    await manager.deleteConversation('same')
    manager.createConversation({ id: 'same' })
    await manager.flush('same')
    expect(events.indexOf('delete:same')).toBeLessThan(events.lastIndexOf('save:same'))
  })

  it('serializes message saves and deletion per id while keeping other ids independent', async () => {
    const events: string[] = []
    let release!: () => void
    const blocked = new Promise<void>((resolve) => (release = resolve))
    const manager = createConversationManager({
      engineFactory: () => engine(),
      storage: {
        loadConversations: () => [{ id: 'a', createdAt: 1, updatedAt: 1 }, { id: 'b', createdAt: 1, updatedAt: 1 }],
        saveMessages: async (id) => { events.push(`save:${id}`); if (id === 'a') await blocked },
        saveConversation: async ({ id }) => events.push(`meta:${id}`),
        deleteConversation: async (id) => events.push(`delete:${id}`),
      },
    })
    await manager.load()
    await manager.loadMessages('a')
    await manager.loadMessages('b')
    manager.createConversation({ id: 'b' })
    const saveA = manager.saveMessages('a')
    const deleteA = manager.deleteConversation('a')
    await manager.saveMessages('b')
    expect(events).toContain('save:b')
    release()
    await Promise.all([saveA, deleteA])
    expect(events.indexOf('save:a')).toBeLessThan(events.indexOf('delete:a'))
  })

  it('disposes idempotently without deleting history', async () => {
    const manager = createConversationManager({
      engineFactory: () => engine(),
      storage: { loadConversations: () => [{ id: 'a', createdAt: 1, updatedAt: 1 }] },
    })
    await manager.load()
    await Promise.all([manager.dispose(), manager.dispose()])
    expect(manager.getState().conversations).toHaveLength(1)
  })
})

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

describe('conversation manager lifecycle', () => {
  it('creates an engine when loading a persisted conversation for the first time', async () => {
    const made: string[] = []
    const manager = createConversationManager({
      engineFactory: (id) => { made.push(id); return engine() },
      storage: {
        loadConversations: () => [{ id: 'stored', createdAt: 1, updatedAt: 1 }],
        loadMessages: () => [],
      },
    })

    await manager.load()
    const switched = await manager.switchConversation('stored')
    const loaded = await manager.loadMessages('stored')

    expect(switched?.engine).toBeDefined()
    expect(loaded).toBe(switched?.engine)
    expect(manager.getEngine('stored')).toBe(loaded)
    expect(made).toEqual(['stored'])
  })

  it('merges late initial list without reviving in-memory changes', async () => {
    const list = deferred<{ id: string; title?: string; createdAt: number; updatedAt: number }[]>()
    const deleted: string[] = []
    const manager = createConversationManager({
      engineFactory: () => engine(),
      storage: { loadConversations: () => list.promise, deleteConversation: async (id) => void deleted.push(id) },
      generateId: () => 'local',
    })
    const loading = manager.load()
    manager.createConversation({ title: 'local' })
    await manager.updateConversationTitle('local', 'renamed')
    await manager.deleteConversation('local')
    list.resolve([{ id: 'local', title: 'stale', createdAt: 1, updatedAt: 1 }, { id: 'remote', title: 'remote', createdAt: 1, updatedAt: 1 }])
    await loading
    expect(manager.getState().conversations.map((x) => x.id)).toEqual(['remote'])
    expect(deleted).toEqual(['local'])
  })

  it('keeps the final switch intent when an older load resolves later', async () => {
    const a = deferred<[]>(), b = deferred<[]>()
    const made: string[] = []
    const manager = createConversationManager({
      engineFactory: (id) => { made.push(id); return engine() },
      storage: { loadConversations: () => [{ id: 'a', createdAt: 1, updatedAt: 1 }, { id: 'b', createdAt: 1, updatedAt: 1 }], loadMessages: (id) => id === 'a' ? a.promise : b.promise },
    })
    await manager.load()
    const first = manager.switchConversation('a')
    const second = manager.switchConversation('b')
    b.resolve([])
    await second
    a.resolve([])
    await first
    expect(manager.getState().activeConversationId).toBe('b')
    expect(manager.getState().conversations.map((item) => item.id).sort()).toEqual(['a', 'b'])
  })

  it('does not let a deleted old generation populate a recreated id', async () => {
    const old = deferred<[]>(), fresh = deferred<[]>()
    const made: string[] = []
    const manager = createConversationManager({
      engineFactory: (id, messages) => { made.push(`${id}:${messages.length}`); return engine() },
      storage: { loadConversations: () => [{ id: 'same', createdAt: 1, updatedAt: 1 }], loadMessages: (id) => id === 'same' && made.length === 0 ? old.promise : fresh.promise },
    })
    await manager.load()
    const pending = manager.loadMessages('same')
    await manager.deleteConversation('same')
    const pendingInfo = manager.createConversation({ id: 'same' })
    expect(pendingInfo.id).toBe('same')
    old.resolve([])
    fresh.resolve([])
    await pending
    expect(manager.getEngine('same')).toBeDefined()
    expect(made).toEqual(['same:0'])
  })

  it('deduplicates concurrent loads and keeps engines isolated', async () => {
    const wait = deferred<[]>(); let calls = 0
    const manager = createConversationManager({ engineFactory: () => engine(), storage: { loadConversations: () => [{ id: 'a', createdAt: 1, updatedAt: 1 }, { id: 'b', createdAt: 1, updatedAt: 1 }], loadMessages: async (id) => { calls++; if (id === 'b') return []; return wait.promise } } })
    await manager.load()
    const one = manager.loadMessages('a'), two = manager.loadMessages('a')
    wait.resolve([])
    expect(await one).toBe(await two)
    expect(calls).toBe(1)
    const b = await manager.loadMessages('b')
    expect(b).toBeDefined()
    expect(await manager.loadMessages('a')).toBe(await one)
  })
})


