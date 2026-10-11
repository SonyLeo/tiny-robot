import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { connectAngularConversation } from '@opentiny/tiny-robot-kit/angular'
import { TOOL_RESUME_COMMAND, TOOL_REJECT_COMMAND, type ConversationManager } from '@opentiny/tiny-robot-kit/core'
import { ConversationService } from './service'
import { ConversationViewComponent } from './conversation-view'
import { completion, chunk } from './providers'
import { ControlledStorage, deferred, makeManager } from './testing'
import { TURN_KEY } from './storage'

@Component({
  standalone: true,
  imports: [ConversationViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p7-conversation-view label="Primary" />
    @if (secondary()) {
      <p7-conversation-view label="Secondary" />
    }`,
})
class Host {
  readonly secondary = signal(true)
}

const held: ConversationManager[] = []
const mount = async (manager: ConversationManager) => {
  held.push(manager)
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      {
        provide: ConversationService,
        useValue: { manager, perform: (operation: () => unknown) => operation() },
      },
    ],
  })
  const fixture = TestBed.createComponent(Host)
  // Exactly one initial render. All subsequent checks wait for Angular's scheduler.
  fixture.detectChanges()
  await fixture.whenStable()
  return fixture
}

afterEach(async () => {
  TestBed.resetTestingModule()
  for (const manager of held.splice(0)) await manager.dispose().catch(() => undefined)
  localStorage.clear()
})

describe('P7 packed manager in a native Angular TestBed host', () => {
  it('streams A in the background while B is active, then refreshes real OnPush children on return', async () => {
    const first = deferred()
    const second = deferred()
    const gate1 = deferred()
    const gate2 = deferred()
    const { manager } = makeManager({
      responseProvider: async function* () {
        yield chunk('one ')
        first.resolve()
        await gate1.promise
        yield chunk('two ')
        second.resolve()
        await gate2.promise
        yield chunk('three', true)
      },
    })
    manager.createConversation({ id: 'A' })
    manager.createConversation({ id: 'B' })
    await manager.switchConversation('A')
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    const sending = connection.sendMessage('stream')
    await first.promise
    await fixture.whenStable()
    const message = manager.getEngine('A')!.getState().messages.at(-1)!
    expect(fixture.nativeElement.querySelector('[data-view="Primary"]').textContent).toContain('one ')
    await connection.switchConversation('B')
    await fixture.whenStable()
    gate1.resolve()
    await second.promise
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('[data-view="Primary"]').textContent).not.toContain('one two')
    await connection.switchConversation('A')
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('[data-view="Primary"]').textContent).toContain('one two')
    gate2.resolve()
    await sending
    await fixture.whenStable()
    for (const view of fixture.nativeElement.querySelectorAll('[data-view]'))
      expect(view.textContent).toContain('one two three')
    expect(manager.getEngine('A')!.getState().messages.at(-1)).toBe(message)
    await connection.dispose()
  })

  it('detaches a destroyed view while the other view keeps receiving stream revisions', async () => {
    const started = deferred()
    const gate = deferred()
    const { manager } = makeManager({
      responseProvider: async function* () {
        yield chunk('before ')
        started.resolve()
        await gate.promise
        yield chunk('after', true)
      },
    })
    manager.createConversation({ id: 'A' })
    const fixture = await mount(manager)
    const sending = manager.getEngine('A')!.sendMessage('stream')
    await started.promise
    fixture.componentInstance.secondary.set(false)
    await fixture.whenStable()
    expect(manager.getEngine('A')!.getState().isProcessing).toBe(true)
    gate.resolve()
    await sending
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelectorAll('[data-view]')).toHaveLength(1)
    expect(fixture.nativeElement.textContent).toContain('before after')
  })

  it('updates nested tool status in OnPush children without replacing the assistant message', async () => {
    const { manager } = makeManager({
      responseProvider: async (body) =>
        body.messages.some((message) => message.role === 'tool') ? completion('finished') : completion('', 'confirm'),
    })
    manager.createConversation({ id: 'A' })
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    await connection.sendMessage('tool')
    await fixture.whenStable()
    const assistant = manager
      .getEngine('A')!
      .getState()
      .messages.find((message) => message.tool_calls?.length)!
    expect(fixture.nativeElement.querySelector('[data-tool-status]').textContent).toBe('awaiting-approval')
    await connection.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'p7-call' })
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('[data-tool-status]').textContent).toBe('success')
    expect(
      manager
        .getEngine('A')!
        .getState()
        .messages.find((message) => message.tool_calls?.length),
    ).toBe(assistant)
    await connection.dispose()
  })

  it('updates the rendered message list through the public setMessages connection API', async () => {
    const { manager, storage } = makeManager({
      initialMessages: [
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'second' },
      ],
    })
    manager.createConversation({ id: 'A' })
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    const retained = manager.getEngine('A')!.getState().messages[0]
    for (const label of ['Primary', 'Secondary']) {
      const view = fixture.nativeElement.querySelector(`[data-view="${label}"]`)
      expect(view.querySelectorAll('p7-message-row')).toHaveLength(2)
    }

    const input = [retained]
    connection.setMessages(input)
    input.push({ role: 'assistant', content: 'outside input' })
    await fixture.whenStable()
    for (const label of ['Primary', 'Secondary']) {
      const view = fixture.nativeElement.querySelector(`[data-view="${label}"]`)
      expect(view.querySelectorAll('p7-message-row')).toHaveLength(1)
      expect(view.textContent).toContain('first')
      expect(view.textContent).not.toContain('second')
      expect(view.textContent).not.toContain('outside input')
    }
    expect(connection.activeEngine()!.messages()).toEqual([retained])
    expect(connection.activeEngine()!.messages()[0]).toBe(retained)
    await connection.flush()
    expect(storage.messages.get('A')).toEqual([retained])

    connection.setMessages([])
    await fixture.whenStable()
    for (const label of ['Primary', 'Secondary']) {
      expect(
        fixture.nativeElement.querySelector(`[data-view="${label}"]`).querySelectorAll('p7-message-row'),
      ).toHaveLength(0)
    }
    await connection.flush()
    expect(storage.messages.get('A')).toEqual([])
    expect(storage.infos.has('A')).toBe(true)
    await connection.dispose()
  })

  it('refuses list replacement during processing and lets the original stream finish', async () => {
    const started = deferred()
    const gate = deferred()
    let aborted = false
    const { manager, storage } = makeManager({
      responseProvider: async function* (_body, signal) {
        yield chunk('original ')
        started.resolve()
        await gate.promise
        aborted = signal.aborted
        yield chunk('continued', true)
      },
    })
    manager.createConversation({ id: 'A' })
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    const sending = connection.sendMessage('stream')
    await started.promise
    await fixture.whenStable()
    const assistant = connection.activeEngine()!.messages().at(-1)!
    try {
      expect(() => connection.setMessages([])).toThrow(/processing/)
      expect(connection.activeEngine()!.isProcessing()).toBe(true)
      for (const view of fixture.nativeElement.querySelectorAll('[data-view]'))
        expect(view.textContent).toContain('original ')
    } finally {
      gate.resolve()
    }
    await sending
    await fixture.whenStable()
    await connection.flush()
    expect(aborted).toBe(false)
    expect(connection.activeEngine()!.messages().at(-1)).toBe(assistant)
    for (const view of fixture.nativeElement.querySelectorAll('[data-view]'))
      expect(view.textContent).toContain('original continued')
    expect(storage.messages.get('A')!.at(-1)!.content).toBe('original continued')
    await connection.dispose()
  })

  it('refuses list replacement while paused and resumes the original approval turn', async () => {
    const { manager } = makeManager({
      responseProvider: async (body) =>
        body.messages.some((message) => message.role === 'tool')
          ? completion('original resumed')
          : completion('', 'confirm'),
    })
    manager.createConversation({ id: 'A' })
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    await connection.sendMessage('approval')
    await fixture.whenStable()
    const assistant = connection
      .activeEngine()!
      .messages()
      .find((message) => message.tool_calls?.length)!
    expect(() => connection.setMessages([])).toThrow(/paused/)
    expect(connection.activeEngine()!.isPaused()).toBe(true)
    await expect(connection.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'p7-call' })).resolves.toMatchObject({
      status: 'resumed',
    })
    await fixture.whenStable()
    expect(
      connection
        .activeEngine()!
        .messages()
        .find((message) => message.tool_calls?.length),
    ).toBe(assistant)
    for (const view of fixture.nativeElement.querySelectorAll('[data-view]'))
      expect(view.textContent).toContain('original resumed')
    await connection.dispose()
  })

  it('keeps no-active operations inert and synchronously rejects disposed connection actions', async () => {
    const { manager, storage } = makeManager()
    const fixture = await mount(manager)
    const connection = connectAngularConversation(manager)
    await connection.sendMessage('unused')
    await connection.send({ role: 'user', content: 'unused object' })
    connection.setMessages([{ role: 'user', content: 'unused history' }])
    await connection.abort()
    await expect(connection.dispatchCommand('unused')).rejects.toThrow('No active conversation')
    await fixture.whenStable()
    expect(connection.activeEngine()).toBeNull()
    expect(storage.infos.size).toBe(0)
    expect(fixture.nativeElement.querySelectorAll('p7-message-row')).toHaveLength(0)
    const disposal = connection.dispose()
    expect(connection.dispose()).toBe(disposal)
    await disposal
    for (const action of [
      () => connection.sendMessage('late'),
      () => connection.send({ role: 'user', content: 'late' }),
      () => connection.setMessages([]),
      () => connection.abort(),
      () => connection.dispatchCommand('unused'),
      () => connection.createConversation({ id: 'late' }),
      () => connection.flush(),
    ])
      expect(action).toThrow('disposed')
    manager.createConversation({ id: 'still owned by app' })
    await fixture.whenStable()
    expect(connection.activeEngine()).toBeNull()
    expect(manager.getEngine('still owned by app')).toBeDefined()
  })

  it('final manager disposal cancels processing, preserves history and leaves paused snapshots restorable', async () => {
    const started = deferred()
    const { manager, storage } = makeManager({
      responseProvider: async function* (body, signal) {
        if (String(body.messages.at(-1)?.content) === 'tool') {
          yield completion('', 'confirm')
          return
        }
        yield chunk('saved partial')
        started.resolve()
        await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
      },
    })
    manager.createConversation({ id: 'paused' })
    await manager.getEngine('paused')!.sendMessage('tool')
    manager.createConversation({ id: 'processing' })
    const engine = manager.getEngine('processing')!
    const sending = engine.sendMessage('stream')
    await started.promise
    const fixture = await mount(manager)
    const first = manager.dispose()
    expect(manager.dispose()).toBe(first)
    await first
    await sending
    expect(engine.getState().requestState).toBe('aborted')
    expect(storage.messages.get('processing')!.at(-1)?.content).toBe('saved partial')
    expect(storage.infos.size).toBe(2)
    expect(localStorage.getItem(TURN_KEY)).not.toBeNull()
    fixture.destroy()
    const restored = makeManager({ responseProvider: async () => completion('restored reply') }, storage).manager
    held.push(restored)
    await restored.load()
    await restored.switchConversation('paused')
    expect(restored.getEngine('paused')!.getState().isPaused).toBe(true)
    await expect(
      restored.getEngine('paused')!.dispatchCommand(TOOL_REJECT_COMMAND, { toolCallId: 'p7-call' }),
    ).resolves.toMatchObject({ status: 'denied' })
    expect(localStorage.getItem(TURN_KEY)).toBeNull()
  })

  it('flush persists the latest tail and reports storage failure while allowing recovery', async () => {
    const { manager, storage, errors } = makeManager({ initialMessages: [{ role: 'assistant', content: 'initial' }] })
    manager.createConversation({ id: 'A' })
    await manager.flush()
    const fixture = await mount(manager)
    const engine = manager.getEngine('A')!
    const message = engine.getState().messages[0]
    engine.updateMessage(message, (item) => {
      item.content = 'tail'
    })
    await manager.flush()
    expect(storage.messages.get('A')![0].content).toBe('tail')
    storage.fail = true
    engine.updateMessage(message, (item) => {
      item.content = 'failed tail'
    })
    await expect(manager.flush()).rejects.toThrow('controlled save failure')
    expect(errors.join(' ')).toContain('A')
    storage.fail = false
    await manager.saveMessages('A')
    await manager.flush()
    await fixture.whenStable()
    expect(storage.messages.get('A')![0].content).toBe('failed tail')
  })

  it('does not revive an engine after delayed loading races with disposal', async () => {
    const storage = new ControlledStorage()
    storage.infos.set('A', { id: 'A', createdAt: 1, updatedAt: 1 })
    storage.loadGate = deferred()
    const { manager } = makeManager({}, storage)
    await manager.load()
    await mount(manager)
    const switching = manager.switchConversation('A')
    await manager.dispose()
    storage.loadGate.resolve([])
    expect(await switching).toBeNull()
    expect(manager.getEngine('A')).toBeUndefined()
    expect(() => manager.createConversation({ id: 'B' })).toThrow('disposed')
  })

  it('cancels a deleted processing engine before a blocked storage queue can finish', async () => {
    const started = deferred()
    let signal!: AbortSignal
    const { manager, storage } = makeManager({
      responseProvider: async function* (_body, abortSignal) {
        signal = abortSignal
        yield chunk('partial')
        started.resolve()
        await new Promise<void>((resolve) => abortSignal.addEventListener('abort', () => resolve(), { once: true }))
      },
    })
    manager.createConversation({ id: 'A' })
    await manager.flush()
    await mount(manager)
    storage.saveGate = deferred()
    const sending = manager.getEngine('A')!.sendMessage('stream')
    await started.promise
    const saving = manager.saveMessages('A')
    const deleting = manager.deleteConversation('A')
    try {
      expect(signal.aborted).toBe(true)
    } finally {
      storage.saveGate.resolve()
      storage.saveGate = undefined
    }
    await Promise.all([saving, deleting, sending])
    expect(storage.infos.has('A')).toBe(false)
    expect(storage.messages.has('A')).toBe(false)
  })

  it('deletes an unloaded paused conversation and its snapshot while preserving other history', async () => {
    const { manager, storage } = makeManager({ responseProvider: async () => completion('', 'confirm') })
    manager.createConversation({ id: 'A' })
    await manager.getEngine('A')!.sendMessage('tool')
    manager.createConversation({ id: 'B' })
    await manager.dispose()
    const restored = makeManager({}, storage).manager
    held.push(restored)
    await restored.load()
    await mount(restored)
    expect(restored.getEngine('A')).toBeUndefined()
    await restored.deleteConversation('A')
    expect(localStorage.getItem(TURN_KEY)).toBeNull()
    expect(storage.infos.has('B')).toBe(true)
    expect(storage.infos.has('A')).toBe(false)
  })

  it('keeps saved messages when a paused snapshot is missing and returns a missing command result', async () => {
    const { manager, storage } = makeManager({ responseProvider: async () => completion('', 'confirm') })
    manager.createConversation({ id: 'A' })
    await manager.getEngine('A')!.sendMessage('tool')
    await manager.dispose()
    localStorage.removeItem(TURN_KEY)
    const restored = makeManager({}, storage).manager
    held.push(restored)
    await restored.load()
    await restored.switchConversation('A')
    const fixture = await mount(restored)
    const engine = restored.getEngine('A')!
    expect(engine.getState().isPaused).toBe(false)
    expect(engine.getState().messages.length).toBeGreaterThan(0)
    await expect(engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'p7-call' })).resolves.toMatchObject({
      status: 'missing',
    })
    await fixture.whenStable()
  })
})
