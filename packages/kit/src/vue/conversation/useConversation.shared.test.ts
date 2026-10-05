import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import * as messageCore from '../../message/core'
import type { ConversationStorageStrategy } from '../../storage'
import type { ChatMessage } from '../../types'
import type { ConversationInfo } from './types'
import type { ChatCompletion, ResponseProvider } from '../message/types'
import { useConversation } from './useConversation'

const info = (id: string): ConversationInfo => ({ id, createdAt: 1, updatedAt: 1 })
const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const completion = (): ChatCompletion => ({
  id: 'shared-vue',
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: 'reply' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})
const responseProvider: ResponseProvider = async () => completion()
const storage = (overrides: Partial<ConversationStorageStrategy> = {}): ConversationStorageStrategy => ({
  loadConversations: () => [],
  loadMessages: () => [],
  saveConversation: () => undefined,
  saveMessages: () => undefined,
  deleteConversation: () => undefined,
  ...overrides,
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Vue shared conversation manager integration', () => {
  it('stops the released engine provider watcher while retaining the active engine watcher', async () => {
    const scope = effectScope()
    const factory = vi.spyOn(messageCore, 'createMessageEngine')
    try {
      const api = scope.run(() => useConversation({ storage: storage(), useMessageOptions: { responseProvider } }))!
      const first = api.createConversation({ id: 'first' })
      const firstEngine = factory.mock.results[0].value
      const updateFirstProvider = vi.spyOn(firstEngine, 'setResponseProvider')
      first.engine.responseProvider.value = async () => completion()
      expect(updateFirstProvider).toHaveBeenCalledOnce()

      const second = api.createConversation({ id: 'second' })
      const secondEngine = factory.mock.results[1].value
      const updateSecondProvider = vi.spyOn(secondEngine, 'setResponseProvider')
      await api.switchConversation('second')
      updateFirstProvider.mockClear()
      first.engine.responseProvider.value = async () => completion()
      second.engine.responseProvider.value = async () => completion()
      expect(updateFirstProvider).not.toHaveBeenCalled()
      expect(updateSecondProvider).toHaveBeenCalledOnce()
    } finally {
      scope.stop()
    }
  })

  it('reports a metadata snapshot failure from the void title facade', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const api = useConversation({ storage: storage(), useMessageOptions: { responseProvider } })
    api.createConversation({ id: 'one', metadata: {} })
    await api.saveMessages('one')
    api.conversations.value[0].metadata!.unsupported = new Map([['callback', () => undefined]])
    expect(api.updateConversationTitle('one', 'Updated')).toBeUndefined()
    await vi.waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('[useConversation] update title failed:', expect.any(Error)),
    )
  })

  it('reports an initial list failure from the void clear facade', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failure = new Error('list unavailable')
    const api = useConversation({
      storage: storage({
        loadConversations: async () => {
          throw failure
        },
      }),
      useMessageOptions: { responseProvider },
    })
    expect(api.clear()).toBeUndefined()
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith('[useConversation] clear failed:', failure))
  })

  it('keeps the latest switch when A finishes loading after B', async () => {
    const a = deferred<ChatMessage[]>()
    const b = deferred<ChatMessage[]>()
    const onLoad = vi.fn()
    const api = useConversation({
      storage: storage({
        loadConversations: () => [info('a'), info('b')],
        loadMessages: (id) => (id === 'a' ? a.promise : b.promise),
      }),
      useMessageOptions: { responseProvider },
      onLoad,
    })
    await vi.waitFor(() => expect(onLoad).toHaveBeenCalledOnce())
    const first = api.switchConversation('a')
    const second = api.switchConversation('b')
    b.resolve([{ role: 'user', content: 'B' }])
    await second
    a.resolve([{ role: 'user', content: 'A' }])
    await first
    expect(api.activeConversationId.value).toBe('b')
    expect(api.activeConversation.value?.engine.messages.value[0].content).toBe('B')
  })

  it('deduplicates simultaneous message loading and preserves the same facade', async () => {
    const loading = deferred<ChatMessage[]>()
    const loadMessages = vi.fn(() => loading.promise)
    const api = useConversation({
      storage: storage({ loadConversations: () => [info('one')], loadMessages }),
      useMessageOptions: { responseProvider },
    })
    await vi.waitFor(() => expect(api.conversations.value).toHaveLength(1))
    const first = api.switchConversation('one')
    const second = api.switchConversation('one')
    loading.resolve([{ role: 'user', content: 'history' }])
    const [a, b] = await Promise.all([first, second])
    expect(loadMessages).toHaveBeenCalledOnce()
    expect(a?.engine).toBe(b?.engine)
    expect(api.activeConversation.value?.engine).toBe(a?.engine)
  })

  it('ignores a conversation list that finishes after clear', async () => {
    const loading = deferred<ConversationInfo[]>()
    const onLoad = vi.fn()
    const api = useConversation({
      storage: storage({ loadConversations: () => loading.promise }),
      useMessageOptions: { responseProvider },
      onLoad,
    })
    api.createConversation({ id: 'local' })
    expect(api.clear()).toBeUndefined()
    loading.resolve([info('late')])
    await vi.waitFor(() => expect(onLoad).toHaveBeenCalledWith([]))
    expect(api.conversations.value).toEqual([])
    expect(api.activeConversation.value).toBeNull()
  })

  it('flushes nested writes before releasing an idle engine and stops its exact watcher', async () => {
    vi.useFakeTimers()
    const saved = new Map<string, ChatMessage[]>()
    const saves: ChatMessage[][] = []
    const api = useConversation({
      autoSaveMessages: true,
      storage: storage({
        saveMessages: (id, messages) => {
          const snapshot = JSON.parse(JSON.stringify(messages)) as ChatMessage[]
          saved.set(id, snapshot)
          if (id === 'a') saves.push(snapshot)
        },
        loadMessages: (id) => saved.get(id) ?? [],
      }),
      useMessageOptions: {
        responseProvider,
        initialMessages: [{ role: 'assistant', content: '', state: { nested: { status: 'initial' } } }],
      },
    })
    const a = api.createConversation({ id: 'a' })
    await api.saveMessages('a')
    a.engine.messages.value[0].state!.nested.status = 'leading'
    await api.saveMessages('a')
    a.engine.messages.value[0].state!.nested.status = 'tail'
    api.createConversation({ id: 'b' })
    await api.switchConversation('b')
    expect(saved.get('a')?.[0].state?.nested.status).toBe('tail')
    const saveCount = saves.length
    a.engine.messages.value[0].state!.nested.status = 'released'
    await vi.advanceTimersByTimeAsync(1000)
    expect(saves).toHaveLength(saveCount)
    const restored = await api.switchConversation('a')
    expect(restored?.engine).not.toBe(a.engine)
    expect(restored?.engine.messages.value[0].state?.nested.status).toBe('tail')
  })

  it('saves direct nested mutations from Vue plugin commands and consumers in the shared queue', async () => {
    const saved: ChatMessage[][] = []
    const api = useConversation({
      autoSaveMessages: true,
      autoSaveThrottle: 0,
      storage: storage({
        saveMessages: (_id, messages) => {
          saved.push(JSON.parse(JSON.stringify(messages)) as ChatMessage[])
        },
      }),
      useMessageOptions: {
        responseProvider,
        initialMessages: [{ role: 'assistant', content: '', metadata: { nested: { source: 'initial' } } }],
        plugins: [
          {
            commands: {
              annotate: (_payload, { messages }) => {
                messages[0].metadata!.nested.source = 'plugin'
              },
            },
          },
        ],
      },
    })
    const created = api.createConversation({ id: 'one' })
    await api.saveMessages('one')
    await created.engine.dispatchCommand('annotate')
    created.engine.messages.value[0].metadata!.nested.source = 'consumer'
    await api.saveMessages('one')
    expect(saved.some((messages) => messages[0].metadata?.nested.source === 'plugin')).toBe(true)
    expect(saved.at(-1)?.[0].metadata?.nested.source).toBe('consumer')
  })

  it('uses the default 1000ms interval for the final nested auto-save', async () => {
    vi.useFakeTimers()
    const saved: ChatMessage[][] = []
    const api = useConversation({
      autoSaveMessages: true,
      storage: storage({
        saveMessages: (_id, messages) => {
          saved.push(JSON.parse(JSON.stringify(messages)) as ChatMessage[])
        },
      }),
      useMessageOptions: {
        responseProvider,
        initialMessages: [{ role: 'assistant', content: 'initial', metadata: { nested: { value: 0 } } }],
      },
    })
    const created = api.createConversation({ id: 'one' })
    await api.saveMessages('one')
    created.engine.messages.value[0].metadata!.nested.value = 1
    await vi.advanceTimersByTimeAsync(0)
    const leadingSaves = saved.length
    created.engine.messages.value[0].metadata!.nested.value = 2
    await vi.advanceTimersByTimeAsync(999)
    expect(saved).toHaveLength(leadingSaves)
    await vi.advanceTimersByTimeAsync(1)
    expect(saved).toHaveLength(leadingSaves + 1)
    expect(saved.at(-1)?.[0].metadata?.nested.value).toBe(2)
  })

  it('keeps default auto-save disabled and synchronous public operation return types', async () => {
    const saveMessages = vi.fn()
    const saveConversation = vi.fn()
    const deleteConversation = vi.fn()
    const api = useConversation({
      storage: storage({ saveMessages, saveConversation, deleteConversation }),
      useMessageOptions: { responseProvider },
    })
    const created = api.createConversation({ id: 'one', title: 'Draft', metadata: { source: 'user' } })
    expect(created.engine.messages).toBeDefined()
    await api.saveMessages('one')
    const calls = saveMessages.mock.calls.length
    created.engine.messages.value.push({ role: 'user', content: 'manual' })
    await new Promise<void>((resolve) => queueMicrotask(resolve))
    expect(saveMessages).toHaveBeenCalledTimes(calls)
    expect(api.updateConversationTitle('one', 'Updated')).toBeUndefined()
    expect(api.activeConversation.value?.title).toBe('Updated')
    expect(saveConversation.mock.calls.at(-1)?.[0].title).toBe('Updated')
    await api.saveMessages('one')
    expect(api.clear()).toBeUndefined()
    expect(api.activeConversation.value).toBeNull()
    expect(deleteConversation).toHaveBeenCalledWith('one')
  })
})
