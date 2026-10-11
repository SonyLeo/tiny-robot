// The IndexedDB branch uses fake-indexeddb in TestBed; real browser IDB close/blocked evidence is recorded by browser smoke.
import 'fake-indexeddb/auto'
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  inject,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectAngularConversation,
  createAngularMessage,
  type AngularConversationConnection,
  type AngularMessageConnection,
} from '@opentiny/tiny-robot-kit/angular'
import {
  createConversationManager,
  createMessageEngine,
  createNativeMessageAdapter,
  getSkillRequestContext,
  indexedDBStorageStrategyFactory,
  localStorageStrategyFactory,
  skillPlugin,
  toolPlugin,
  type ChatMessage,
  type ConversationManager,
  type ConversationStorage,
  type MessageRequestBody,
  type SkillDefinition,
  type SkillSelection,
} from '@opentiny/tiny-robot-kit/core'
import { completion } from './providers'
import { deferred } from './testing'

const MESSAGE = new InjectionToken<AngularMessageConnection>('packed capability message')
const CONVERSATION = new InjectionToken<AngularConversationConnection>('packed capability conversation')

@Component({
  selector: 'p7-capability-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre data-tool-content>{{ message.content }}</pre>
    <span data-tool-state>{{ toolStatus(message) }}</span>
    <span data-reasoning>{{ message.reasoning_content }}</span>`,
})
class CapabilityDetail {
  @Input({ required: true }) message!: ChatMessage
  @Input({ required: true }) revision = 0

  toolStatus(message: ChatMessage) {
    const toolCall = (message.state as Record<string, unknown> | undefined)?.['toolCall']
    return (toolCall as Record<string, { status?: string }> | undefined)?.['p7-call']?.status
  }
}

@Component({
  selector: 'p7-capability-row',
  standalone: true,
  imports: [CapabilityDetail],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p7-capability-detail [message]="message" [revision]="revision" />`,
})
class CapabilityRow {
  @Input({ required: true }) message!: ChatMessage
  @Input({ required: true }) revision = 0
}

@Component({
  standalone: true,
  imports: [CapabilityRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (message of connection.messages(); track $index) {
    <p7-capability-row [message]="message" [revision]="connection.revision()" />
  }`,
})
class MessageHost {
  readonly connection = inject(MESSAGE)
}

@Component({
  standalone: true,
  imports: [CapabilityRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (connection.activeEngine(); as engine) {
    @for (message of engine.messages(); track $index) {
      <p7-capability-row [message]="message" [revision]="engine.revision()" />
    }
  }`,
})
class ConversationHost {
  readonly connection = inject(CONVERSATION)
}

const cleanup: Array<() => unknown | Promise<unknown>> = []
afterEach(async () => {
  TestBed.resetTestingModule()
  for (const dispose of cleanup.splice(0).reverse()) await dispose()
})

const mountMessage = async (connection: AngularMessageConnection) => {
  cleanup.push(() => connection.dispose())
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), { provide: MESSAGE, useValue: connection }],
  })
  const fixture = TestBed.createComponent(MessageHost)
  fixture.detectChanges() // Only the initial mount uses manual detection.
  await fixture.whenStable()
  return fixture
}

describe('P7 final tarball public capabilities', () => {
  it.each(['string', 'object'] as const)('renders every %s tool chunk through three OnPush levels', async (kind) => {
    const first = deferred()
    const second = deferred()
    const gate1 = deferred()
    const gate2 = deferred()
    const values =
      kind === 'string'
        ? ['one ', 'two ', 'three']
        : [
            { nested: { text: 'one ' }, rows: [{ index: 0, text: 'A' }] },
            { nested: { text: 'two ' }, rows: [{ index: 0, text: 'B' }] },
            { nested: { text: 'three' }, rows: [{ index: 1, text: 'C' }] },
          ]
    const expected =
      kind === 'string'
        ? ['one ', 'one two ', 'one two three']
        : [
            JSON.stringify({ nested: { text: 'one ' }, rows: [{ index: 0, text: 'A' }] }),
            JSON.stringify({ nested: { text: 'one two ' }, rows: [{ index: 0, text: 'AB' }] }),
            JSON.stringify({
              nested: { text: 'one two three' },
              rows: [
                { index: 0, text: 'AB' },
                { index: 1, text: 'C' },
              ],
            }),
          ]
    let received: MessageRequestBody | undefined
    const connection = createAngularMessage({
      responseProvider: async (body) => {
        if (body.messages.some((message) => message.role === 'tool')) {
          received = structuredClone(body)
          return completion('finished')
        }
        return completion('', 'stream')
      },
      plugins: [
        toolPlugin({
          getTools: () => [],
          persistPausedTurn: false,
          callTool: async function* () {
            yield values[0]
            first.resolve()
            await gate1.promise
            yield values[1]
            second.resolve()
            await gate2.promise
            yield values[2]
          },
        }),
      ],
    })
    const fixture = await mountMessage(connection)
    const sending = connection.sendMessage('tool stream')
    await first.promise
    await fixture.whenStable()
    const assistant = connection.messages()[1]
    const tool = connection.messages()[2]
    const content = () => fixture.nativeElement.querySelectorAll('[data-tool-content]')[2].textContent
    const status = () => fixture.nativeElement.querySelectorAll('[data-tool-state]')[1].textContent
    try {
      expect(content()).toBe(expected[0])
      expect(status()).toBe('running')
      gate1.resolve()
      await second.promise
      await fixture.whenStable()
      expect(content()).toBe(expected[1])
      expect(status()).toBe('running')
      expect(connection.messages()[1]).toBe(assistant)
      expect(connection.messages()[2]).toBe(tool)
    } finally {
      gate1.resolve()
      gate2.resolve()
    }
    await sending
    await fixture.whenStable()
    expect(content()).toBe(expected[2])
    expect(status()).toBe('success')
    expect(connection.messages()[1]).toBe(assistant)
    expect(connection.messages()[2]).toBe(tool)
    expect(received?.messages.find((message) => message.role === 'tool')?.content).toBe(expected[2])
    expect(fixture.nativeElement.textContent).toContain('finished')
  })

  it('reads none/manual/auto Skill selection from a Signal and renders each completed turn', async () => {
    const weather: SkillDefinition = {
      name: 'weather',
      description: 'Weather answers',
      instructions: 'Use weather data.',
    }
    const docs: SkillDefinition = {
      name: 'docs',
      description: 'Documentation answers',
      instructions: 'Use documentation.',
      resources: [{ path: 'guide.md', kind: 'text', resourceId: 'guide.md', text: '# Current guide' }],
    }
    const selected = signal<SkillSelection>({ mode: 'manual', skillNames: ['weather'] })
    const bodies: MessageRequestBody[] = []
    const phases: string[] = []
    const connection = createAngularMessage({
      responseProvider: async (body) => {
        bodies.push(structuredClone(body))
        if (body.tools?.some((tool) => tool.type === 'function' && tool.function.name === 'select_skills')) {
          return completion('', 'select_skills', JSON.stringify({ skillNames: ['docs'] }))
        }
        return completion(`visible ${selected().mode}`)
      },
      plugins: [
        skillPlugin({
          selection: () => selected(),
          getSkillCandidates: () => [weather, docs],
          getSkillByName: (name) => ({ weather, docs })[name as 'weather' | 'docs'],
          onInstructionsResolved: (context) => {
            phases.push(`${context.selection.mode}:${context.selection.phase}`)
          },
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            if (instructions.length)
              context.requestBody.messages.unshift({ role: 'system', content: instructions.join('\n\n') })
          },
        }),
        toolPlugin({
          getTools: () => [],
          persistPausedTurn: false,
          callTool: () => {
            throw new Error('unexpected fallback')
          },
        }),
      ],
    })
    const fixture = await mountMessage(connection)
    await connection.sendMessage('manual')
    await fixture.whenStable()
    expect(bodies[0].messages[0].content).toContain('Use weather data.')
    expect(fixture.nativeElement.textContent).toContain('visible manual')
    selected.set({ mode: 'none' })
    await connection.sendMessage('none')
    await fixture.whenStable()
    expect(bodies[1].messages[0].role).toBe('user')
    expect(bodies[1].messages.some((message) => message.role === 'system')).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('visible none')
    selected.set({ mode: 'auto', preferredSkillNames: ['docs'], maxSelectedSkills: 1 })
    await connection.sendMessage('auto')
    await fixture.whenStable()
    expect(bodies[2].tools?.some((tool) => tool.type === 'function' && tool.function.name === 'select_skills')).toBe(
      true,
    )
    expect(bodies[2].messages[0].content).toContain('docs: Documentation answers')
    expect(bodies[3].messages[0].content).toContain('Use documentation.')
    expect(bodies[3].tools?.some((tool) => tool.type === 'function' && tool.function.name === 'read_skill_file')).toBe(
      true,
    )
    expect(phases).toEqual(['manual:ready', 'auto:selecting', 'auto:ready'])
    expect(fixture.nativeElement.textContent).toContain('visible auto')
  })

  it.each(['localStorage', 'indexedDB'] as const)(
    'migrates legacy renderContent through %s, saves and reopens',
    async (kind) => {
      const name = `p7-final-${kind}-${crypto.randomUUID()}`
      const open = () =>
        kind === 'localStorage'
          ? localStorageStrategyFactory({ key: name })
          : indexedDBStorageStrategyFactory({ dbName: name })
      const close = async (storage: ConversationStorage): Promise<void> => {
        const closable = storage as ConversationStorage & { close?: () => void | Promise<void> }
        await closable.close?.()
      }
      let storage = open()
      const id = 'legacy'
      await storage.saveConversation!({ id, createdAt: 1, updatedAt: 1 })
      await storage.saveMessages!(id, [
        {
          role: 'assistant',
          content: 'old ignored',
          metadata: { marker: 'retained' },
          renderContent: [
            { type: 'collapsible-text', content: 'reason ' },
            { type: 'collapsible-text', content: 'tail' },
            { type: 'markdown', content: 'legacy ' },
            { type: 'text', content: 'answer' },
          ],
        },
      ])
      const create = (current: ConversationStorage): ConversationManager =>
        createConversationManager({
          storage: current,
          autoSaveThrottle: 30,
          engineFactory: (_id, initialMessages, config) =>
            createMessageEngine(createNativeMessageAdapter(), { ...config, initialMessages }),
        })
      let manager = create(storage)
      let connection = connectAngularConversation(manager)
      let disposed = false
      cleanup.push(async () => {
        if (!disposed) {
          await connection.dispose()
          await manager.dispose()
          await close(storage)
        }
        if (kind === 'localStorage') localStorage.removeItem(name)
        else
          await new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(name)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
      })
      await connection.load()
      await connection.switchConversation(id)
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: CONVERSATION, useValue: connection }],
      })
      let fixture = TestBed.createComponent(ConversationHost)
      fixture.detectChanges()
      await fixture.whenStable()
      expect(connection.activeEngine()!.messages()[0]).toMatchObject({
        content: 'legacy answer',
        reasoning_content: 'reason tail',
        metadata: { marker: 'retained' },
      })
      expect(connection.activeEngine()!.messages()[0]).not.toHaveProperty('renderContent')
      expect(fixture.nativeElement.querySelector('[data-tool-content]').textContent).toBe('legacy answer')
      expect(fixture.nativeElement.querySelector('[data-reasoning]').textContent).toBe('reason tail')
      connection.activeEngine()!.updateMessage(connection.activeEngine()!.messages()[0], (message) => {
        message.content = 'persisted edit'
      })
      await fixture.whenStable()
      expect(fixture.nativeElement.textContent).toContain('persisted edit')
      await connection.flush()
      fixture.destroy()
      await connection.dispose()
      await manager.dispose()
      await close(storage)
      TestBed.resetTestingModule()
      storage = open()
      manager = create(storage)
      connection = connectAngularConversation(manager)
      await connection.load()
      await connection.switchConversation(id)
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: CONVERSATION, useValue: connection }],
      })
      fixture = TestBed.createComponent(ConversationHost)
      fixture.detectChanges()
      await fixture.whenStable()
      expect(connection.activeEngine()!.messages()[0]).toMatchObject({
        content: 'persisted edit',
        reasoning_content: 'reason tail',
        metadata: { marker: 'retained' },
      })
      expect(connection.activeEngine()!.messages()[0]).not.toHaveProperty('renderContent')
      expect(fixture.nativeElement.querySelector('[data-tool-content]').textContent).toBe('persisted edit')
      expect(fixture.nativeElement.querySelector('[data-reasoning]').textContent).toBe('reason tail')
      fixture.destroy()
      await connection.dispose()
      await manager.dispose()
      await close(storage)
      disposed = true
    },
  )
})
