import { ChangeDetectionStrategy, Component, InjectionToken, Input, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { injectAngularMessage, injectSharedAngularMessage } from '@opentiny/tiny-robot-kit/angular';
import { createMessageEngine, createNativeMessageAdapter, type ChatMessage, type CreateMessageEngineOptions, type MessageEngine } from '@opentiny/tiny-robot-kit/core';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources';

const OPTIONS = new InjectionToken<CreateMessageEngineOptions>('D1 options');
const SHARED = new InjectionToken<MessageEngine>('D1 shared engine');
const chunk = (content: string): ChatCompletionChunk => ({
  id: 'd1', object: 'chat.completion.chunk', created: 0, model: 'd1',
  choices: [{ index: 0, delta: { content }, finish_reason: null }],
});

@Component({
  selector: 'd1-message', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span data-message>{{ message.content }} {{ status() }}</span>',
})
class MessageChild {
  @Input({ required: true }) message!: ChatMessage;
  @Input({ required: true }) revision = 0;
  status() { return (this.message.state?.detail as { status: string } | undefined)?.status; }
}

@Component({
  standalone: true, imports: [MessageChild], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (message of session.messages(); track $index) {
    <d1-message [message]="message" [revision]="session.revision()" />
  }<span data-status>{{ session.requestState() }}</span>`,
})
class Host {
  private readonly shared = inject(SHARED, { optional: true });
  readonly session = this.shared ? injectSharedAngularMessage(this.shared) : injectAngularMessage(inject(OPTIONS));
}

const mount = async (options: CreateMessageEngineOptions = {}, shared?: MessageEngine) => {
  TestBed.configureTestingModule({ providers: [
    provideZonelessChangeDetection(),
    { provide: OPTIONS, useValue: options },
    ...(shared ? [{ provide: SHARED, useValue: shared }] : []),
  ] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
};

describe('D1 Angular message connection', () => {
  it('keeps nested identity and refreshes an OnPush child through controlled updates', async () => {
    const message: ChatMessage = { role: 'assistant', content: 'hello', state: { detail: { status: 'waiting' } } };
    const fixture = await mount({ initialMessages: [message] });
    const session = fixture.componentInstance.session;
    expect(session.revision()).toBe(0);
    session.updateMessage(message, (current) => { (current.state!.detail as { status: string }).status = 'done'; });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-message]').textContent).toContain('done');
    expect(session.messages()[0]).toBe(message);
    expect(session.revision()).toBe(1);
    expect(() => session.updateMessage({ role: 'assistant', content: 'hello' }, () => {})).toThrow();
    fixture.destroy();
    await session.dispose();
    expect(() => session.updateMessage(message, () => {})).toThrow('disposed');
  });

  it('streams into an OnPush child and drops a late chunk after owned destruction', async () => {
    let release!: () => void;
    let started!: () => void;
    const startedPromise = new Promise<void>((resolve) => { started = resolve; });
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const fixture = await mount({ responseProvider: async function* () {
      yield chunk('first');
      started();
      await gate;
      yield chunk('late');
    } });
    const session = fixture.componentInstance.session;
    const sending = session.sendMessage('hello');
    await startedPromise;
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('first');
    const priorRevision = session.revision();
    fixture.destroy();
    const disposing = session.dispose();
    release();
    await Promise.all([sending, disposing]);
    expect(session.revision()).toBe(priorRevision);
    expect(session.engine.getState().requestState).toBe('aborted');
    expect(session.engine.getState().messages.at(-1)?.content).toBe('first');
  });

  it('detaches a shared connection while its request continues', async () => {
    const engine = createMessageEngine(createNativeMessageAdapter(), { responseProvider: async () => ({
      id: 'shared', object: 'chat.completion', created: 0, model: 'd1',
      choices: [{ index: 0, message: { role: 'assistant', content: 'background' }, finish_reason: 'stop' }],
    }) as ChatCompletion });
    const fixture = await mount({}, engine);
    const session = fixture.componentInstance.session;
    fixture.destroy();
    await session.dispose();
    await engine.sendMessage('continue');
    expect(engine.getState().requestState).toBe('completed');
    expect(session.messages()).toHaveLength(0);
    expect(session.revision()).toBe(0);
  });

  it('preserves provider error state and propagates the rejection', async () => {
    const fixture = await mount({ responseProvider: async () => { throw new Error('D1 failure'); } });
    const session = fixture.componentInstance.session;
    await expect(session.sendMessage('error')).rejects.toThrow('D1 failure');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-status]').textContent).toContain('error');
    fixture.destroy();
  });
});
