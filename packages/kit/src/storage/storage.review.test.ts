import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConversationManager } from '../conversation/manager'
import { createMessageEngine } from '../message/core'
import { createNativeMessageAdapter } from '../message/adapters/native'
import { IndexedDBStrategy } from './indexedDBStrategy'
import { localStorageStrategyFactory } from './core'

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error(`Review database ${name} still has an open connection`))
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('built-in storage independent review', () => {
  it('propagates quota failures to the manager and allows a later successful retry', async () => {
    const values = new Map<string, string>()
    let fail = true
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (fail) throw new Error('quota exceeded')
        values.set(key, value)
      },
    })
    const onPersistenceError = vi.fn()
    const manager = createConversationManager({
      storage: localStorageStrategyFactory({ key: 'review-quota' }),
      onPersistenceError,
      engineFactory: (_id, messages, options) =>
        createMessageEngine(createNativeMessageAdapter(), {
          ...options,
          initialMessages: messages,
        }),
    })
    manager.createConversation({ id: 'one', options: { initialMessages: [{ role: 'user', content: 'kept' }] } })
    try {
      await expect(manager.flush()).rejects.toThrow('quota exceeded')
      expect(onPersistenceError).toHaveBeenCalledWith(expect.any(Error), 'one')
      fail = false
      await manager.saveMessages('one')
      await manager.flush()
      expect(JSON.parse(values.get('review-quota')!)[0].messages[0].content).toBe('kept')
    } finally {
      fail = false
      await manager.dispose()
    }
  })

  it('preserves typed binary data through the actual IndexedDB strategy', async () => {
    const name = `review-binary-${crypto.randomUUID()}`
    const strategy = new IndexedDBStrategy(name, 1)
    const metadata = { binary: new Uint8Array([3, 7]), entries: new Map([['count', 2]]), labels: new Set(['kit']) }
    try {
      await strategy.saveConversation({ id: 'one', createdAt: 1, updatedAt: 1, metadata })
      await strategy.saveMessages('one', [{ role: 'assistant', content: '', metadata }])
      const restored = await strategy.loadMessages('one')
      expect(restored[0].metadata?.binary).toBeInstanceOf(Uint8Array)
      expect([...restored[0].metadata!.binary]).toEqual([3, 7])
      expect(restored[0].metadata?.entries).toEqual(new Map([['count', 2]]))
      expect(restored[0].metadata?.labels).toEqual(new Set(['kit']))
    } finally {
      await strategy.close()
      await deleteDatabase(name)
    }
  })

  it('opens one database connection for concurrent initial writes', async () => {
    const name = `review-concurrent-${crypto.randomUUID()}`
    const opened: IDBDatabase[] = []
    const originalOpen = indexedDB.open.bind(indexedDB)
    const open = vi.spyOn(indexedDB, 'open').mockImplementation((databaseName, version) => {
      const request = originalOpen(databaseName, version)
      request.addEventListener('success', () => opened.push(request.result))
      return request
    })
    const strategy = new IndexedDBStrategy(name, 1)
    try {
      await Promise.all(['a', 'b'].map((id) => strategy.saveConversation({ id, createdAt: 1, updatedAt: 1 })))
      expect(open.mock.calls.filter(([databaseName]) => databaseName === name)).toHaveLength(1)
    } finally {
      await strategy.close()
      opened.forEach((database) => database.close())
      await deleteDatabase(name)
    }
  })
})
