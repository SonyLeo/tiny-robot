import { describe, expect, it, vi } from 'vitest'
import { connectAngularMessage, createAngularMessage } from '../../angular'
import { createMessageEngine } from '../core'
import { createNativeMessageAdapter } from '../adapters/native'
import { createVueMessageAdapter } from '../adapters/vue'
import type { MessageEngine } from '../types'
import type { ChatCompletion } from 'openai/resources'

const createEngine = (
  provider = async () =>
    ({
      id: 'contract',
      object: 'chat.completion',
      created: 0,
      model: 'test',
      choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
    }) as unknown as ChatCompletion,
) => createMessageEngine(createNativeMessageAdapter(), { responseProvider: provider })

describe('D3a.1 engine bridge contracts', () => {
  it('uses one framework-neutral engine factory with native and Vue adapters', () => {
    const native = createEngine()
    const vueAdapter = createVueMessageAdapter()
    const vue = createMessageEngine(vueAdapter, { initialMessages: [{ role: 'assistant', content: 'vue' }] })

    expect(native.getState().messages).toEqual([])
    expect(vue.getState().messages[0]).toMatchObject({ role: 'assistant', content: 'vue' })
    expect(vueAdapter.messages.value[0]).not.toBe(vue.getState().messages[0])
  })

  it('keeps shared connection disposal separate from engine ownership', async () => {
    const engine = createEngine()
    const abort = vi.spyOn(engine, 'abort')
    const shared = connectAngularMessage(engine)

    await shared.dispose()

    expect(abort).not.toHaveBeenCalled()
    expect(() => shared.sendMessage('after dispose')).toThrow('disposed')
  })

  it('aborts an owned engine once and makes disposal idempotent', async () => {
    const connection = createAngularMessage()
    const abort = vi.spyOn(connection.engine, 'abort')

    const first = connection.dispose()
    const second = connection.dispose()
    await Promise.all([first, second])

    expect(abort).toHaveBeenCalledOnce()
    expect(() => connection.dispatchCommand('unused')).toThrow('disposed')
  })

  it('exposes controlled message updates through the same engine', () => {
    const message = { role: 'assistant' as const, content: '', state: { status: 'pending' } }
    const engine: MessageEngine = createMessageEngine(createNativeMessageAdapter(), { initialMessages: [message] })
    const connection = connectAngularMessage(engine)
    const revisions: number[] = []
    const stop = engine.subscribe('messages', () => revisions.push(connection.revision()))

    connection.updateMessage(message, (current) => {
      current.state!.status = 'done'
    })
    stop()

    expect(message.state?.status).toBe('done')
    expect(revisions.at(-1)).toBeGreaterThan(0)
  })

  it('exposes setMessages on Angular connections', () => {
    const first = { role: 'assistant' as const, content: 'first' }
    const connection = createAngularMessage({ initialMessages: [first] })
    const replacement = { role: 'user' as const, content: 'replacement' }

    connection.setMessages([first, replacement])

    expect(connection.messages()[0]).toBe(first)
    expect(connection.messages()[1]).toBe(replacement)
  })
})
