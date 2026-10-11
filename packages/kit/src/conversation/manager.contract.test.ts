import { afterEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { createConversationManager } from './manager'
import { createMessageEngine } from '../message/core'
import { createNativeMessageAdapter } from '../message/adapters/native'
import { toolPlugin } from '../message/plugins/toolPlugin'
import { loadTurnSnapshots } from '../message/core/turnPersistence'
import type { ChatMessage, CreateMessageEngineOptions, MessageEngine, PublicMessageState } from '../message/types'

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const info = (id: string) => ({ id, createdAt: 1, updatedAt: 1 })
const controllableEngine = (requestState: PublicMessageState['requestState'] = 'idle') => {
  const state: PublicMessageState = {
    requestState,
    messages: [{ role: 'assistant', content: 'initial' }],
    isProcessing: requestState === 'processing',
    isPaused: requestState === 'paused',
    canStartTurn: requestState !== 'processing' && requestState !== 'paused',
  }
  const listeners = new Set<(state: PublicMessageState) => void>()
  const abort = vi.fn(async () => {
    state.requestState = 'aborted'
  })
  const engine = {
    getState: () => state,
    subscribe: (...args: unknown[]) => {
      const listener = args.at(-1) as (state: PublicMessageState) => void
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    abort,
    sendMessage: async () => undefined,
    send: async () => undefined,
    dispatchCommand: async <T>() => undefined as T,
    updateMessage: () => undefined,
    setMessages: () => undefined,
    setResponseProvider: () => undefined,
  } satisfies MessageEngine
  return {
    engine,
    state,
    abort,
    listeners,
    change(content: string) {
      state.messages[0].content = content
      listeners.forEach((listener) => listener(state))
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('shared conversation lifecycle contracts', () => {
  it('calls an unblocked title save and idle deletion synchronously', async () => {
    const saved = vi.fn(),
      deleted = vi.fn()
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: { saveConversation: saved, saveMessages: () => undefined, deleteConversation: deleted },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    const title = manager.updateConversationTitle('a', 'changed')
    expect(saved.mock.calls.at(-1)?.[0].title).toBe('changed')
    await title
    const clearing = manager.clear()
    expect(deleted).toHaveBeenCalledWith('a')
    await clearing
  })

  it('serializes storage callbacks that synchronously reenter the same queue', async () => {
    const blocked = deferred<void>(),
      events: string[] = []
    let nested: Promise<void> | undefined
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: {
        saveConversation: async ({ title }) => {
          if (title === 'outer') {
            events.push('outer start')
            nested = manager.updateConversationTitle('a', 'inner')
            await blocked.promise
            events.push('outer end')
          }
          if (title === 'inner') events.push('inner')
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    const outer = manager.updateConversationTitle('a', 'outer')
    expect(events).toEqual(['outer start'])
    blocked.resolve()
    await outer
    await nested
    expect(events).toEqual(['outer start', 'outer end', 'inner'])
  })

  it('publishes a reentrant mutation after the older snapshot to every observer', async () => {
    const manager = createConversationManager({ engineFactory: () => controllableEngine().engine })
    const received: string[][] = []
    manager.subscribe((state) => {
      if (state.conversations.some((item) => item.id === 'a')) void manager.deleteConversation('a')
    })
    manager.subscribe((state) => received.push(state.conversations.map((item) => item.id)))
    manager.createConversation({ id: 'a' })
    await manager.flush()
    expect(received).toEqual([['a'], []])
  })

  it('deletes late initial storage entries before persisting a post-clear same-id creation', async () => {
    const list = deferred<ReturnType<typeof info>[]>(),
      stored = new Map([
        ['old', info('old')],
        ['same', info('same')],
      ])
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: {
        loadConversations: () => list.promise,
        loadMessages: () => [],
        saveConversation: (item) => {
          stored.set(item.id, item)
        },
        deleteConversation: (id) => {
          stored.delete(id)
        },
      },
    })
    const loading = manager.load()
    const clearing = manager.clear()
    manager.createConversation({ id: 'same', title: 'new' })
    list.resolve([info('old'), info('same')])
    await clearing
    await loading
    await manager.flush()
    expect(Array.from(stored.keys())).toEqual(['same'])
    expect(stored.get('same')).toMatchObject({ title: 'new' })
    const fresh = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: { loadConversations: () => Array.from(stored.values()) },
    })
    await fresh.load()
    expect(fresh.getState().conversations.map((item) => item.id)).toEqual(['same'])
  })

  it('preserves structured-clone metadata values in stable snapshots', async () => {
    const bytes = new Uint8Array([1, 2]),
      map = reactive(new Map([['item', { value: 'old' }]]))
    const metadata = reactive({ bytes, map, set: new Set(['a']), buffer: bytes.buffer, blob: new Blob(['data']) })
    const saved: unknown[] = []
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: {
        saveConversation: (item) => {
          saved.push(item.metadata)
        },
      },
    })
    manager.createConversation({ id: 'a', metadata })
    bytes[0] = 9
    map.get('item')!.value = 'new'
    await manager.flush()
    const version = saved[0] as typeof metadata
    expect(version.bytes).toBeInstanceOf(Uint8Array)
    expect(Array.from(version.bytes)).toEqual([1, 2])
    expect(version.map).toBeInstanceOf(Map)
    expect(version.map.get('item')).toEqual({ value: 'old' })
    expect(version.set).toBeInstanceOf(Set)
    expect(Array.from(version.set)).toEqual(['a'])
    expect(version.buffer).toBeInstanceOf(ArrayBuffer)
    expect(version.blob).toBeInstanceOf(Blob)
    await manager.dispose()
  })

  it('waits for an outstanding clear during disposal and does not restore its late list', async () => {
    const list = deferred<ReturnType<typeof info>[]>(),
      deleted = vi.fn()
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: { loadConversations: () => list.promise, loadMessages: () => [], deleteConversation: deleted },
    })
    const loading = manager.load(),
      clearing = manager.clear()
    let finished = false
    const disposal = manager.dispose().then(() => {
      finished = true
    })
    await Promise.resolve()
    expect(finished).toBe(false)
    list.resolve([info('late')])
    await Promise.all([loading, clearing, disposal])
    expect(deleted).toHaveBeenCalledWith('late')
    expect(manager.getState().conversations).toEqual([])
  })

  it('saves continuously on fixed leading/trailing windows and flushes a pending tail', async () => {
    vi.useFakeTimers()
    const source = controllableEngine()
    const saved: string[] = []
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: () => source.engine,
      storage: {
        saveMessages: (_id, messages) => {
          saved.push(messages[0].content as string)
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    source.change('leading')
    await manager.flush()
    await vi.advanceTimersByTimeAsync(5)
    source.change('middle')
    await vi.advanceTimersByTimeAsync(5)
    source.change('tail')
    await vi.advanceTimersByTimeAsync(10)
    expect(saved).toEqual(['initial', 'leading', 'tail'])
    source.change('last')
    await manager.flush()
    expect(saved.at(-1)).toBe('last')
    await manager.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('flushes the latest messages before releasing an idle engine, preserving background engines', async () => {
    vi.useFakeTimers()
    const idle = controllableEngine(),
      processing = controllableEngine('processing'),
      paused = controllableEngine('paused')
    const sources = { idle, processing, paused }
    const released = vi.fn()
    const saved: string[] = []
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: (id) => sources[id as keyof typeof sources].engine,
      onEngineReleased: released,
      storage: {
        saveMessages: (id, messages) => {
          if (id === 'idle') saved.push(messages[0].content as string)
        },
      },
    })
    Object.keys(sources).forEach((id) => manager.createConversation({ id }))
    await manager.flush()
    idle.change('leading')
    await manager.flush()
    idle.change('tail')
    await manager.releaseInactiveEngines('paused')
    expect(saved.at(-1)).toBe('tail')
    expect(manager.getEngine('idle')).toBeUndefined()
    expect(manager.getEngine('processing')).toBe(processing.engine)
    expect(manager.getEngine('paused')).toBe(paused.engine)
    expect(released).toHaveBeenCalledWith('idle', idle.engine)
    await manager.dispose()
  })

  it('returns one disposal promise, saves final state, and rejects new operations', async () => {
    vi.useFakeTimers()
    const source = controllableEngine('processing'),
      saved: string[] = []
    source.abort.mockImplementation(async () => {
      source.state.requestState = 'aborted'
      source.state.messages[0].content = 'cancelled'
    })
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: () => source.engine,
      storage: {
        saveMessages: (_id, messages) => {
          saved.push(messages[0].content as string)
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    source.change('tail')
    const first = manager.dispose(),
      second = manager.dispose()
    expect(first).toBe(second)
    expect(() => manager.createConversation({ id: 'new' })).toThrow('disposed')
    await first
    expect(saved.at(-1)).toBe('cancelled')
    expect(source.abort).toHaveBeenCalledOnce()
    expect(manager.getEngine('a')).toBeUndefined()
    expect(source.listeners.size).toBe(0)
    expect(manager.getState().conversations.map((item) => item.id)).toEqual(['a'])
    await expect(manager.load()).rejects.toThrow('disposed')
  })

  it('invalidates pending loads and list callbacks when disposal starts', async () => {
    const messages = deferred<ChatMessage[]>(),
      list = deferred<ReturnType<typeof info>[]>()
    const factory = vi.fn(() => controllableEngine().engine),
      onLoad = vi.fn()
    let reads = 0
    const manager = createConversationManager({
      engineFactory: factory,
      onLoad,
      storage: {
        loadConversations: () => (++reads === 1 ? [info('a')] : list.promise),
        loadMessages: () => messages.promise,
      },
    })
    await manager.load()
    const pendingEngine = manager.loadMessages('a'),
      pendingList = manager.load()
    await manager.dispose()
    messages.resolve([])
    list.resolve([info('late')])
    expect(await pendingEngine).toBeNull()
    await pendingList
    expect(factory).not.toHaveBeenCalled()
    expect(onLoad).toHaveBeenCalledOnce()
    expect(manager.getState().conversations.map((item) => item.id)).toEqual(['a'])
  })

  it('prevents a cleared initial list from restoring deleted conversations', async () => {
    const list = deferred<ReturnType<typeof info>[]>()
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: { loadConversations: () => list.promise },
    })
    const loading = manager.load()
    manager.createConversation({ id: 'a' })
    const clearing = manager.clear()
    list.resolve([info('a'), info('not-yet-loaded')])
    await Promise.all([loading, clearing])
    expect(manager.getState().conversations).toEqual([])
  })

  it('cancels the captured old engine before deletion and orders recreated data after deletion', async () => {
    const old = controllableEngine('processing'),
      fresh = controllableEngine(),
      blocked = deferred<void>(),
      events: string[] = []
    old.abort.mockImplementation(async () => {
      events.push('abort')
      await blocked.promise
    })
    let created = 0
    const manager = createConversationManager({
      engineFactory: () => (created++ === 0 ? old.engine : fresh.engine),
      storage: {
        saveMessages: () => {
          events.push('save')
        },
        deleteConversation: () => {
          events.push('delete')
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    const deleting = manager.deleteConversation('a')
    manager.createConversation({ id: 'a' })
    blocked.resolve()
    await deleting
    await manager.flush()
    expect(old.abort).toHaveBeenCalledOnce()
    expect(fresh.abort).not.toHaveBeenCalled()
    expect(events).toEqual(['save', 'abort', 'delete', 'save'])
  })

  it('rejects duplicate IDs and takes metadata snapshots at invocation time', async () => {
    const blocked = deferred<void>(),
      received: unknown[] = [],
      metadata = reactive({ value: 'first', callback: () => undefined })
    let saves = 0
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: {
        saveConversation: async (conversation) => {
          received.push(conversation.metadata)
          if (++saves === 1) await blocked.promise
        },
      },
    })
    manager.createConversation({ id: 'a', metadata })
    expect(() => manager.createConversation({ id: 'a' })).toThrow('already exists')
    const renamed = manager.updateConversationTitle('a', 'rename')
    metadata.value = 'mutated'
    blocked.resolve()
    await renamed
    expect(received).toEqual([{ value: 'first' }, { value: 'first' }])
  })

  it('reports background persistence failures and retains them for flush', async () => {
    vi.useFakeTimers()
    const source = controllableEngine(),
      onPersistenceError = vi.fn()
    let fails = false
    const manager = createConversationManager({
      autoSaveThrottle: 20,
      engineFactory: () => source.engine,
      onPersistenceError,
      storage: {
        saveMessages: () => {
          if (fails) throw new Error('disk full')
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    fails = true
    source.change('lost')
    await vi.advanceTimersByTimeAsync(20)
    expect(onPersistenceError).toHaveBeenCalledWith(expect.any(Error), 'a')
    await expect(manager.flush()).rejects.toThrow('disk full')
    fails = false
    await manager.saveMessages('a')
    await manager.flush()
  })

  it('reports a failed initial save and rejects final disposal while still releasing observers', async () => {
    const source = controllableEngine(),
      error = new Error('read only'),
      onPersistenceError = vi.fn(),
      released = vi.fn()
    const manager = createConversationManager({
      engineFactory: () => source.engine,
      onPersistenceError,
      onEngineReleased: released,
      storage: {
        saveMessages: () => {
          throw error
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await expect(manager.flush()).rejects.toBe(error)
    const disposal = manager.dispose()
    await expect(disposal).rejects.toBe(error)
    expect(manager.dispose()).toBe(disposal)
    expect(source.listeners.size).toBe(0)
    expect(released).toHaveBeenCalledOnce()
    expect(onPersistenceError).toHaveBeenCalledWith(error, 'a')
  })

  it('isolates subscriber exceptions and forbids every mutation after disposal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const manager = createConversationManager({ engineFactory: () => controllableEngine().engine })
    const healthy = vi.fn()
    manager.subscribe(() => {
      throw new Error('broken view')
    })
    manager.subscribe(healthy)
    manager.createConversation({ id: 'a' })
    expect(healthy).toHaveBeenCalledOnce()
    await manager.dispose()
    expect(() => manager.subscribe(() => undefined)).toThrow('disposed')
    expect(() => manager.notifyMessagesChanged('a')).toThrow('disposed')
    for (const operation of [
      () => manager.loadMessages('a'),
      () => manager.switchConversation('a'),
      () => manager.updateConversationTitle('a', 'new'),
      () => manager.deleteConversation('a'),
      () => manager.clear(),
      () => manager.saveMessages('a'),
      () => manager.flush(),
      () => manager.releaseInactiveEngines(),
    ]) {
      await expect(operation()).rejects.toThrow('disposed')
    }
    expect(healthy).toHaveBeenCalledOnce()
  })

  it('keeps invocation versions ahead of a deletion requested synchronously by a subscriber', async () => {
    const events: string[] = []
    const manager = createConversationManager({
      engineFactory: () => controllableEngine().engine,
      storage: {
        saveConversation: () => {
          events.push('save')
        },
        deleteConversation: () => {
          events.push('delete')
        },
      },
    })
    manager.subscribe(() => {
      if (manager.getState().conversations.length > 0) void manager.deleteConversation('a')
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    expect(events).toEqual(['save', 'delete'])
  })

  it('uses configured initial messages for create and failed loads, with independent conversation objects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const manager = createConversationManager({
      engineFactory: (_id, initialMessages, options) =>
        createMessageEngine(createNativeMessageAdapter(), { ...options, initialMessages }),
      engineOptions: { initialMessages: [{ role: 'system', content: 'fallback' }] },
      storage: {
        loadConversations: () => [info('stored')],
        loadMessages: () => {
          throw new Error('unavailable')
        },
      },
    })
    manager.createConversation({ id: 'first' })
    manager.createConversation({ id: 'second' })
    manager.getEngine('first')!.getState().messages[0].content = 'changed'
    expect(manager.getEngine('second')!.getState().messages[0].content).toBe('fallback')
    expect(manager.getState().conversations.map((item) => item.id)).toEqual(['second', 'first'])
    await manager.load()
    const restored = await manager.loadMessages('stored')
    expect(restored!.getState().messages[0].content).toBe('fallback')
    await manager.dispose()
  })
})

describe('manager paused-turn ownership', () => {
  const pauseFactory = (_id: string, initialMessages: ChatMessage[], options: CreateMessageEngineOptions = {}) =>
    createMessageEngine(createNativeMessageAdapter(), { ...options, initialMessages })
  const pauseOptions = (callTool = async () => 'result'): CreateMessageEngineOptions => ({
    responseProvider: async (body) =>
      body.messages.some((message) => message.role === 'tool')
        ? {
            id: 'answer',
            object: 'chat.completion',
            created: 1,
            model: 'mock',
            choices: [
              {
                index: 0,
                logprobs: null,
                finish_reason: 'stop',
                message: { role: 'assistant', content: 'done', refusal: null },
              },
            ],
          }
        : {
            id: 'tool',
            object: 'chat.completion',
            created: 1,
            model: 'mock',
            choices: [
              {
                index: 0,
                logprobs: null,
                finish_reason: 'tool_calls',
                message: {
                  role: 'assistant',
                  content: '',
                  refusal: null,
                  tool_calls: [{ id: 'call', type: 'function', function: { name: 'lookup', arguments: '{}' } }],
                },
              },
            ],
          },
    plugins: [
      toolPlugin({
        getTools: async () => [{ type: 'function', function: { name: 'lookup' } }],
        callTool,
        shouldPauseToolCall: () => true,
      }),
    ],
  })
  const setupStorage = () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    return values
  }

  it('awaits message persistence before committing a paused snapshot, then preserves it on disposal', async () => {
    setupStorage()
    const blocked = deferred<void>()
    let saved: ChatMessage[] = [],
      blockPause = false
    const manager = createConversationManager({
      autoSaveThrottle: 1000,
      engineFactory: pauseFactory,
      engineOptions: pauseOptions(),
      storage: {
        saveMessages: async (_id, messages) => {
          if (blockPause) await blocked.promise
          saved = messages
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    blockPause = true
    const sending = manager.getEngine('a')!.sendMessage('pause')
    await vi.waitFor(() => expect(manager.getEngine('a')!.getState().processingState).toBe('pausing'))
    expect(loadTurnSnapshots()).toEqual([])
    blocked.resolve()
    await sending
    expect(saved).toHaveLength(3)
    expect(loadTurnSnapshots()).toHaveLength(1)
    await manager.dispose()
    expect(loadTurnSnapshots()).toHaveLength(1)
    const rebuilt = pauseFactory('a', saved, pauseOptions())
    expect(rebuilt.getState().requestState).toBe('paused')
  })

  it('does not commit a restorable turn when pause message persistence fails', async () => {
    setupStorage()
    let fails = false
    const manager = createConversationManager({
      autoSaveThrottle: 1000,
      engineFactory: pauseFactory,
      engineOptions: pauseOptions(),
      onPersistenceError: () => undefined,
      storage: {
        saveMessages: () => {
          if (fails) throw new Error('pause save failed')
        },
      },
    })
    manager.createConversation({ id: 'a' })
    await manager.flush()
    fails = true
    await expect(manager.getEngine('a')!.sendMessage('pause')).rejects.toThrow('pause save failed')
    expect(loadTurnSnapshots()).toEqual([])
    fails = false
    await manager.dispose()
  })

  it.each(['deleteConversation', 'clear'] as const)(
    'cleans only the affected paused snapshots on %s',
    async (action) => {
      setupStorage()
      const manager = createConversationManager({
        autoSaveThrottle: 1000,
        engineFactory: pauseFactory,
        engineOptions: pauseOptions(),
      })
      manager.createConversation({ id: 'a' })
      await manager.getEngine('a')!.sendMessage('pause a')
      manager.createConversation({ id: 'b' })
      await manager.getEngine('b')!.sendMessage('pause b')
      expect(loadTurnSnapshots()).toHaveLength(2)
      await manager[action]('a')
      expect(loadTurnSnapshots()).toHaveLength(action === 'clear' ? 0 : 1)
      if (action !== 'clear') expect(manager.getEngine('b')!.getState().requestState).toBe('paused')
      await manager.dispose()
    },
  )

  it.each(['tool.resume', 'tool.reject'])(
    'restores approvals after the old manager is disposed and handles %s once',
    async (command) => {
      setupStorage()
      let saved: ChatMessage[] = []
      const callTool = vi.fn(async () => 'approved')
      const storage = {
        loadConversations: () => [info('a')],
        loadMessages: () => saved,
        saveMessages: (_id: string, messages: ChatMessage[]) => {
          saved = messages
        },
      }
      const old = createConversationManager({
        autoSaveThrottle: 1000,
        engineFactory: pauseFactory,
        engineOptions: pauseOptions(callTool),
        storage,
      })
      old.createConversation({ id: 'a' })
      await old.getEngine('a')!.sendMessage('pause')
      await old.dispose()
      expect(old.getEngine('a')).toBeUndefined()
      const restored = createConversationManager({
        autoSaveThrottle: 1000,
        engineFactory: pauseFactory,
        engineOptions: pauseOptions(callTool),
        storage,
      })
      await restored.load()
      const engine = await restored.loadMessages('a')
      expect(engine!.getState().requestState).toBe('paused')
      await engine!.dispatchCommand(command, { toolCallId: 'call' })
      expect(engine!.getState().requestState).toBe('completed')
      expect(callTool).toHaveBeenCalledTimes(command === 'tool.resume' ? 1 : 0)
      expect(loadTurnSnapshots()).toEqual([])
      await restored.dispose()
    },
  )

  it('deletes an unloaded paused history by its own turn IDs without instantiating an engine', async () => {
    setupStorage()
    const messages = new Map<string, ChatMessage[]>()
    const storage = {
      loadConversations: () => [info('a'), info('b')],
      loadMessages: (id: string) => messages.get(id) ?? [],
      saveMessages: (id: string, saved: ChatMessage[]) => {
        messages.set(id, saved)
      },
      deleteConversation: (id: string) => {
        messages.delete(id)
      },
    }
    const old = createConversationManager({
      autoSaveThrottle: 1000,
      engineFactory: pauseFactory,
      engineOptions: pauseOptions(),
      storage,
    })
    old.createConversation({ id: 'a' })
    await old.getEngine('a')!.sendMessage('pause a')
    old.createConversation({ id: 'b' })
    await old.getEngine('b')!.sendMessage('pause b')
    await old.dispose()
    expect(loadTurnSnapshots()).toHaveLength(2)
    const factory = vi.fn(pauseFactory)
    const restored = createConversationManager({ engineFactory: factory, storage })
    await restored.load()
    await restored.deleteConversation('a')
    expect(factory).not.toHaveBeenCalled()
    expect(loadTurnSnapshots()).toHaveLength(1)
    expect(messages.has('a')).toBe(false)
    expect(messages.has('b')).toBe(true)
    await restored.clear()
    expect(loadTurnSnapshots()).toEqual([])
    await restored.dispose()
  })
})
