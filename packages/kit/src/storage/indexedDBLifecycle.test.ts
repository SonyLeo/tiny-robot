import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConversationManager } from '../conversation/manager'
import { createMessageEngine } from '../message/core'
import { createNativeMessageAdapter } from '../message/adapters/native'
import { indexedDBStorageStrategyFactory } from './core'
import { IndexedDBStrategy } from './indexedDBStrategy'

const requestResult = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error(`Database ${name} still has an open connection`))
  })
const info = (id: string) => ({ id, createdAt: 1, updatedAt: 1 })

afterEach(() => vi.restoreAllMocks())

describe('conversation IndexedDB owner lifecycle', () => {
  it('returns one close promise before opening, rejects writes and never opens after closing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const open = vi.spyOn(indexedDB, 'open')
    const storage = indexedDBStorageStrategyFactory({ dbName: `close-new-${crypto.randomUUID()}`, dbVersion: 1 })
    const first = storage.close(),
      second = storage.close()
    expect(first).toBe(second)
    await first
    await expect(storage.saveConversation!(info('a'))).rejects.toThrow('closed')
    await expect(storage.saveMessages!('a', [])).rejects.toThrow('closed')
    await expect(storage.deleteConversation!('a')).rejects.toThrow('closed')
    expect(await storage.loadConversations!()).toEqual([])
    expect(await storage.loadMessages!('a')).toEqual([])
    expect(open).not.toHaveBeenCalled()
  })

  it('closes the one connection opened after a pending upgrade and rejects its waiting writes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const name = `close-pending-${crypto.randomUUID()}`
    const blocker = await requestResult(indexedDB.open(name, 1))
    const opened: IDBDatabase[] = []
    const closed = vi.fn()
    const nativeOpen = indexedDB.open.bind(indexedDB)
    const open = vi.spyOn(indexedDB, 'open').mockImplementation((databaseName, version) => {
      const request = nativeOpen(databaseName, version)
      request.addEventListener('success', () => {
        opened.push(request.result)
        const nativeClose = request.result.close.bind(request.result)
        vi.spyOn(request.result, 'close').mockImplementation(() => {
          closed()
          nativeClose()
        })
      })
      return request
    })
    const storage = new IndexedDBStrategy(name, 2)
    try {
      const writes = Promise.allSettled([storage.saveConversation(info('a')), storage.saveMessages('a', [])])
      const first = storage.close()
      expect(storage.close()).toBe(first)
      blocker.close()
      await first
      const results = await writes
      expect(results.every((result) => result.status === 'rejected' && /closed/.test(String(result.reason)))).toBe(true)
      expect(open).toHaveBeenCalledOnce()
      expect(closed).toHaveBeenCalledOnce()
      await deleteDatabase(name)
    } finally {
      blocker.close()
      opened.forEach((db) => db.close())
      await storage.close()
      await deleteDatabase(name)
    }
  })

  it('retries an asynchronous open failure on the same instance', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const name = `close-retry-${crypto.randomUUID()}`
    const incompatible = await requestResult(indexedDB.open(name, 2))
    incompatible.close()
    const storage = new IndexedDBStrategy(name, 1)
    const open = vi.spyOn(indexedDB, 'open')
    try {
      await expect(storage.saveConversation(info('a'))).rejects.toMatchObject({ name: 'VersionError' })
      await deleteDatabase(name)
      await storage.saveConversation(info('a'))
      expect(await storage.loadConversations()).toEqual([info('a')])
      expect(open).toHaveBeenCalledTimes(2)
    } finally {
      await storage.close()
      await deleteDatabase(name)
    }
  })

  it('preserves history for a new instance, rejects old writes, and closes before cleanup deletion', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const name = `close-history-${crypto.randomUUID()}`,
      storage = new IndexedDBStrategy(name, 1)
    const reader = new IndexedDBStrategy(name, 1)
    const open = vi.spyOn(indexedDB, 'open')
    try {
      await storage.saveConversation(info('a'))
      await storage.saveMessages('a', [{ role: 'user', content: 'kept' }])
      const first = storage.close()
      expect(storage.close()).toBe(first)
      await first
      await expect(storage.saveConversation(info('lost'))).rejects.toThrow('closed')
      expect(open).toHaveBeenCalledOnce()
      expect(await reader.loadConversations()).toEqual([info('a')])
      expect(await reader.loadMessages('a')).toEqual([{ role: 'user', content: 'kept' }])
    } finally {
      await Promise.all([storage.close(), reader.close()])
      await deleteDatabase(name)
    }
  })

  it('leaves shared storage open when one manager is disposed', async () => {
    const name = `close-shared-${crypto.randomUUID()}`,
      storage = indexedDBStorageStrategyFactory({ dbName: name, dbVersion: 1 })
    const close = vi.spyOn(storage, 'close')
    const makeManager = () =>
      createConversationManager({
        storage,
        engineFactory: (_id, initialMessages, options) =>
          createMessageEngine(createNativeMessageAdapter(), { ...options, initialMessages }),
      })
    const first = makeManager(),
      second = makeManager()
    try {
      first.createConversation({ id: 'a' })
      second.createConversation({ id: 'b' })
      await Promise.all([first.flush(), second.flush()])
      await first.dispose()
      expect(close).not.toHaveBeenCalled()
      await second.updateConversationTitle('b', 'still open')
      await second.saveMessages('b')
      expect(await storage.loadConversations!()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'b', title: 'still open' })]),
      )
      await second.dispose()
      expect(close).not.toHaveBeenCalled()
    } finally {
      await Promise.all([first.dispose(), second.dispose()])
      await storage.close()
      await deleteDatabase(name)
    }
  })
})
