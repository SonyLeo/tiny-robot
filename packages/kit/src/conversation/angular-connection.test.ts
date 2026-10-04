import { describe, expect, it } from 'vitest'
import { connectAngularConversation } from '../angular'
import { createConversationManager } from './manager'
import { createMessageEngine } from '../message/core'
import { createNativeMessageAdapter } from '../message/adapters/native'

const createManager = () => {
  const manager = createConversationManager({
    engineFactory: (_id, initialMessages, options) => createMessageEngine(createNativeMessageAdapter(), {
      ...options,
      initialMessages,
      responseProvider: async () => ({
        id: 'angular-conversation', object: 'chat.completion', created: 0, model: 'test',
        choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
      } as never),
    }),
  })
  return manager
}

describe('Angular conversation connections', () => {
  it('keeps multiple connections synchronized and detaches one view only', async () => {
    const manager = createManager()
    const first = connectAngularConversation(manager)
    const second = connectAngularConversation(manager)

    const created = first.createConversation({ id: 'one', title: 'One' })
    expect(first.activeConversationId()).toBe('one')
    expect(second.activeConversationId()).toBe('one')
    expect(first.activeConversation()?.engine).toBe(created.engine)
    expect(second.activeEngine()?.engine).toBe(created.engine)

    await first.dispose()
    await second.sendMessage('background')
    expect(second.activeEngine()?.engine.getState().requestState).toBe('completed')

    await second.dispose()
    await manager.dispose()
  })

  it('reconnects to the current active engine after a switch', async () => {
    const manager = createManager()
    const first = connectAngularConversation(manager)
    first.createConversation({ id: 'one' })
    first.createConversation({ id: 'two' })
    await first.switchConversation('one')
    expect(first.activeConversationId()).toBe('one')
    expect(first.activeEngine()?.engine).toBe(manager.getEngine('one'))
    await first.dispose()
    await manager.dispose()
  })
})
