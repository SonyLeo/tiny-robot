import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAngularMessage, type AngularMessageConnection } from '@opentiny/tiny-robot-kit/angular'
import type { ChatMessage, MessageRequestBody } from '@opentiny/tiny-robot-kit/core'
import { chunk, completion } from './providers'
import { deferred } from './testing'

const CONNECTION = new InjectionToken<AngularMessageConnection>('packed public message connection')
interface DisplayState extends Record<string, unknown> {
  display?: { text: string }
}
type DisplayMessage = ChatMessage<Record<string, unknown>, DisplayState>

@Component({
  selector: 'p7-public-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span data-display>{{ message.state?.['display']?.text }}</span>
    <span data-marker>{{ message.metadata?.['marker'] }}</span>`,
})
class PublicDetail {
  @Input({ required: true }) message!: DisplayMessage
  @Input({ required: true }) revision = 0
}

@Component({
  selector: 'p7-public-row',
  standalone: true,
  imports: [PublicDetail],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article>
    <pre data-content>{{ message.content }}</pre>
    <p7-public-detail [message]="message" [revision]="revision" />
  </article>`,
})
class PublicRow {
  @Input({ required: true }) message!: DisplayMessage
  @Input({ required: true }) revision = 0
}

@Component({
  standalone: true,
  imports: [PublicRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p data-request-state>{{ connection.requestState() }}</p>
    @for (message of connection.messages(); track $index) {
      <p7-public-row [message]="message" [revision]="connection.revision()" />
    }`,
})
class PublicHost {
  readonly connection = inject(CONNECTION)
}

const held: AngularMessageConnection[] = []
const mount = async (connection: AngularMessageConnection) => {
  held.push(connection)
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), { provide: CONNECTION, useValue: connection }],
  })
  const fixture = TestBed.createComponent(PublicHost)
  // Mount once; later assertions rely on Signals and Angular's scheduler.
  fixture.detectChanges()
  await fixture.whenStable()
  return fixture
}

afterEach(async () => {
  TestBed.resetTestingModule()
  for (const connection of held.splice(0)) await connection.dispose()
  vi.restoreAllMocks()
})

describe('P7 packed public message and plugin consumption', () => {
  it('retains the active turn provider, including a length continuation, and replaces it for the next turn', async () => {
    const started = deferred()
    const gate = deferred()
    const calls: string[] = []
    const connection = createAngularMessage({
      responseProvider: async function* () {
        calls.push('old')
        if (calls.length > 1) {
          yield completion('old continuation')
          return
        }
        yield chunk('old partial')
        started.resolve()
        await gate.promise
        const last = chunk(' old tail', true)
        last.choices[0].finish_reason = 'length'
        yield last
      },
    })
    const fixture = await mount(connection)
    const sending = connection.sendMessage('first')
    await started.promise
    await fixture.whenStable()
    const assistant = connection.messages().at(-1)!
    try {
      expect(fixture.nativeElement.querySelectorAll('[data-content]')[1].textContent).toBe('old partial')
      connection.setResponseProvider(async () => {
        calls.push('new')
        return completion('new answer')
      })
      expect(connection.isProcessing()).toBe(true)
    } finally {
      gate.resolve()
    }
    await sending
    await fixture.whenStable()
    expect(calls).toEqual(['old', 'old'])
    expect(connection.messages()[1]).toBe(assistant)
    expect(assistant.content).toBe('old partial old tail')
    expect(fixture.nativeElement.textContent).toContain('old continuation')
    await connection.sendMessage('next')
    await fixture.whenStable()
    expect(calls).toEqual(['old', 'old', 'new'])
    expect(
      fixture.nativeElement.querySelectorAll('[data-content]').item(connection.messages().length - 1).textContent,
    ).toBe('new answer')
  })

  it('ignores empty text and sends multiple message objects in order with their display fields', async () => {
    const provider = vi.fn(async () => completion('answer'))
    const connection = createAngularMessage({ responseProvider: provider })
    const fixture = await mount(connection)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    await connection.sendMessage('')
    await connection.sendMessage(' \n\t ')
    await fixture.whenStable()
    expect(provider).not.toHaveBeenCalled()
    expect(connection.messages()).toEqual([])
    expect(connection.requestState()).toBe('idle')
    expect(fixture.nativeElement.querySelectorAll('p7-public-row')).toHaveLength(0)
    expect(warn).toHaveBeenCalledTimes(2)
    const context: ChatMessage = { role: 'system', content: 'context', extra: 'display-only' }
    const question: ChatMessage = {
      role: 'user',
      content: 'object question',
      state: { display: { text: 'selected' } },
      metadata: { marker: 'object marker' },
    }
    await connection.send(context, question)
    await fixture.whenStable()
    expect(provider).toHaveBeenCalledTimes(1)
    expect(connection.messages().slice(0, 2)).toEqual([context, question])
    expect(connection.messages()[0]).toBe(context)
    expect(connection.messages()[1]).toBe(question)
    expect(
      [...fixture.nativeElement.querySelectorAll('[data-content]')].map((node: HTMLElement) => node.textContent),
    ).toEqual(['context', 'object question', 'answer'])
    expect(fixture.nativeElement.querySelectorAll('[data-display]')[1].textContent).toBe('selected')
    expect(fixture.nativeElement.querySelectorAll('[data-marker]')[1].textContent).toBe('object marker')
    expect(context.extra).toBe('display-only')
  })

  it.each([false, true])('refreshes custom nested chunk data with runDefault=%s', async (useDefault) => {
    const first = deferred()
    const second = deferred()
    const gate1 = deferred()
    const gate2 = deferred()
    let count = 0
    const connection = createAngularMessage({
      responseProvider: async function* () {
        yield chunk('one ')
        first.resolve()
        await gate1.promise
        yield chunk('two')
        second.resolve()
        await gate2.promise
        yield chunk('three', true)
      },
      onCompletionChunk: ({ updateCurrentMessage }, runDefault) => {
        if (useDefault) runDefault()
        updateCurrentMessage((message) => {
          const state = (message.state ??= {}) as DisplayState
          const display = (state.display ??= { text: '' })
          display.text = `custom ${++count}`
          ;(message.metadata ??= {}).marker = `marker ${count}`
        })
      },
    })
    const fixture = await mount(connection)
    const sending = connection.sendMessage('stream')
    await first.promise
    await fixture.whenStable()
    const assistant = connection.messages()[1]
    const display = assistant.state!.display
    try {
      expect(fixture.nativeElement.querySelectorAll('[data-content]')[1].textContent).toBe(useDefault ? 'one ' : '')
      expect(fixture.nativeElement.querySelectorAll('[data-display]')[1].textContent).toBe('custom 1')
      expect(fixture.nativeElement.querySelectorAll('[data-marker]')[1].textContent).toBe('marker 1')
      gate1.resolve()
      await second.promise
      await fixture.whenStable()
      expect(connection.messages()[1]).toBe(assistant)
      expect(assistant.state!.display).toBe(display)
      expect(fixture.nativeElement.querySelectorAll('[data-content]')[1].textContent).toBe(useDefault ? 'one two' : '')
      expect(fixture.nativeElement.querySelectorAll('[data-display]')[1].textContent).toBe('custom 2')
      expect(fixture.nativeElement.querySelectorAll('[data-marker]')[1].textContent).toBe('marker 2')
    } finally {
      gate1.resolve()
      gate2.resolve()
    }
    await sending
    await fixture.whenStable()
    expect(connection.messages()[1]).toBe(assistant)
    expect(assistant.state!.display).toBe(display)
    expect(fixture.nativeElement.querySelectorAll('[data-content]')[1].textContent).toBe(
      useDefault ? 'one twothree' : '',
    )
    expect(fixture.nativeElement.querySelectorAll('[data-display]')[1].textContent).toBe('custom 3')
    expect(fixture.nativeElement.querySelectorAll('[data-marker]')[1].textContent).toBe('marker 3')
  })

  it('cleans request fields after ordered plugin transformations without changing displayed history', async () => {
    let received: MessageRequestBody | undefined
    const order: string[] = []
    const connection = createAngularMessage({
      requestMessageFields: ['role', 'content', 'metadata', 'state'],
      requestMessageFieldsExclude: ['state'],
      responseProvider: async (body) => {
        received = structuredClone(body)
        return completion('answer')
      },
      plugins: [
        {
          onBeforeRequest: async ({ requestBody }) => {
            await Promise.resolve()
            order.push('first')
            requestBody.trace = ['first']
            requestBody.messages = requestBody.messages.map((message) => ({
              ...message,
              content: 'provider-only question',
            }))
          },
        },
        {
          onBeforeRequest: ({ requestBody }) => {
            order.push('second')
            requestBody.trace.push('second')
            expect(requestBody.messages[0].content).toBe('provider-only question')
            requestBody.messages.push({ role: 'system', content: 'request-only context', extra: 'removed' })
          },
        },
      ],
    })
    const fixture = await mount(connection)
    const message: ChatMessage = {
      role: 'user',
      content: 'display question',
      metadata: { marker: 'kept' },
      state: { display: { text: 'selected' } },
      extra: 'display-only',
      loading: false,
    }
    await connection.send(message)
    await fixture.whenStable()
    expect(order).toEqual(['first', 'second'])
    expect(received).toEqual({
      trace: ['first', 'second'],
      messages: [
        { role: 'user', content: 'provider-only question', metadata: { marker: 'kept' } },
        { role: 'system', content: 'request-only context' },
      ],
    })
    expect(connection.messages()[0]).toBe(message)
    expect(message).toMatchObject({
      content: 'display question',
      state: { display: { text: 'selected' } },
      extra: 'display-only',
      loading: false,
    })
    expect(fixture.nativeElement.querySelectorAll('[data-content]')[0].textContent).toBe('display question')
    expect(fixture.nativeElement.querySelectorAll('[data-display]')[0].textContent).toBe('selected')
    expect(fixture.nativeElement.textContent).not.toContain('request-only context')
  })

  it('returns generic command results and refreshes nested command mutations through revision inputs', async () => {
    const message: DisplayMessage = { role: 'assistant', content: 'original', state: { display: { text: 'before' } } }
    const display = message.state!.display!
    const connection = createAngularMessage({
      initialMessages: [message],
      plugins: [
        {
          commands: {
            annotate: (payload, { mutate, appendMessage }) => {
              mutate('messages', () => {
                display.text = String(payload)
              })
              appendMessage({ role: 'system', content: 'command audit' })
              return { accepted: payload }
            },
          },
        },
      ],
    })
    const fixture = await mount(connection)
    await expect(connection.dispatchCommand('annotate', 'after')).resolves.toEqual({ accepted: 'after' })
    await fixture.whenStable()
    expect(connection.messages()[0]).toBe(message)
    expect(message.state!.display).toBe(display)
    expect(fixture.nativeElement.querySelector('[data-display]').textContent).toBe('after')
    expect(fixture.nativeElement.textContent).toContain('command audit')
    await expect(connection.dispatchCommand('unknown')).rejects.toThrow('Unknown command')
  })

  it('preserves provider failure across throwing error/finally observers and renders recovery', async () => {
    const providerError = new Error('public provider failure')
    const observerError = new Error('observer failure')
    const finallyError = new Error('finally failure')
    const errorGate = deferred()
    const errorStarted = deferred()
    const lifecycle: string[] = []
    const observed: unknown[] = []
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const connection = createAngularMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [
        {
          name: 'throwing-error',
          onError: async () => {
            lifecycle.push('error:start')
            errorStarted.resolve()
            await errorGate.promise
            lifecycle.push('error:reject')
            throw observerError
          },
          onFinally: () => {
            lifecycle.push('finally:throw')
            throw finallyError
          },
        },
        {
          onError: ({ error, appendMessage }) => {
            observed.push(error)
            lifecycle.push('error:visible')
            appendMessage({ role: 'system', content: 'visible provider error', state: { display: { text: 'failed' } } })
          },
          onFinally: ({ getState }) => {
            lifecycle.push(`finally:${getState().requestState}`)
          },
        },
      ],
    })
    const fixture = await mount(connection)
    const sending = connection.sendMessage('fail')
    const rejected = expect(sending).rejects.toBe(providerError)
    await errorStarted.promise
    try {
      expect(lifecycle).toEqual(['error:start'])
    } finally {
      errorGate.resolve()
    }
    await rejected
    await fixture.whenStable()
    expect(observed).toEqual([providerError])
    expect(lifecycle).toEqual(['error:start', 'error:reject', 'error:visible', 'finally:throw', 'finally:error'])
    expect(log).toHaveBeenCalledWith('Error in onError hook for plugin [throwing-error]:', observerError)
    expect(log).toHaveBeenCalledWith('Error in onFinally hook for plugin [throwing-error]:', finallyError)
    expect(connection.requestState()).toBe('error')
    expect(connection.isProcessing()).toBe(false)
    expect(connection.canStartTurn()).toBe(true)
    expect(fixture.nativeElement.textContent).toContain('visible provider error')
    expect(
      fixture.nativeElement.querySelectorAll('[data-display]').item(connection.messages().length - 1).textContent,
    ).toBe('failed')
    connection.setResponseProvider(async () => completion('recovered'))
    await expect(connection.sendMessage('retry')).resolves.toBeUndefined()
    await fixture.whenStable()
    expect(connection.requestState()).toBe('completed')
    expect(fixture.nativeElement.textContent).toContain('recovered')
    expect(lifecycle.slice(-2)).toEqual(['finally:throw', 'finally:completed'])
  })
})
