import { ChangeDetectionStrategy, Component, DestroyRef, Input, inject, OnInit, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  createMessageEngine, createNativeMessageAdapter, toolPlugin, TOOL_RESUME_COMMAND,
  type ChatMessage, type MessageEngine, type MessageEnginePlugin, type ResponseProvider,
} from '@opentiny/tiny-robot-kit/core';
import type { ChatCompletionChunk } from 'openai/resources';
import { scriptedProvider } from './session';
import { createS4State, type S4Mode } from './s4-state';

const modes: S4Mode[] = ['full', 'revision', 'adapter'];
const tool = toolPlugin({
  getTools: () => [{ type: 'function', function: { name: 'confirm', description: 'S4', parameters: { type: 'object', properties: {} } } }],
  shouldPauseToolCall: () => true,
  callTool: () => 'approved',
});
const chunk = (content: string, last: boolean): ChatCompletionChunk => ({
  id: 's4', object: 'chat.completion.chunk', created: 0, model: 's4',
  choices: [{ index: 0, delta: { role: 'assistant', content }, finish_reason: last ? 'stop' : null }],
});
const deferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
};
const createRun = (mode: S4Mode, provider: ResponseProvider, initialMessages: ChatMessage[] = [], plugins: MessageEnginePlugin[] = []) => {
  const bridge = createS4State(mode);
  const engine = createMessageEngine(bridge.adapter ?? createNativeMessageAdapter(), {
    responseProvider: provider, initialMessages, plugins,
  });
  bridge.connect(engine);
  return { bridge, engine };
};

@Component({
  selector: 's4-tool', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span data-tool>{{ status }}</span>',
})
class S4Tool {
  @Input() status = '';
}
@Component({
  selector: 's4-message', standalone: true, imports: [S4Tool], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article data-message>{{ message.content }}
    @for (call of message.tool_calls ?? []; track call.id) {
      <s4-tool [status]="toolStatus(call.id)" />
    }
  </article>`,
})
class S4Message {
  @Input({ required: true }) message!: ChatMessage;
  @Input() revision = 0;
  toolStatus(id: string) {
    return (this.message.state?.toolCall as Record<string, { status: string }> | undefined)?.[id]?.status ?? 'pending';
  }
}
@Component({
  standalone: true, imports: [S4Message], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (message of bridge.state()?.messages ?? []; track $index) {
    <s4-message [message]="message" [revision]="bridge.revision()" />
  }`,
})
class S4Host implements OnInit {
  @Input({ required: true }) bridge!: ReturnType<typeof createS4State>;
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit() { this.destroyRef.onDestroy(() => this.bridge.dispose()); }
}

const mount = async (bridge: ReturnType<typeof createS4State>) => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(S4Host);
  fixture.componentRef.setInput('bridge', bridge);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
};

for (const mode of modes) {
  describe(`S4 ${mode}`, () => {
    it('observes every chunk, identity, OnPush child, plugin and disposal', async () => {
      const gates = [deferred(), deferred(), deferred()];
      const provider: ResponseProvider = async function* () {
        for (const [index, gate] of gates.entries()) {
          await gate.promise;
          yield chunk(String(index + 1), index === 2);
        }
      };
      const original: ChatMessage = { role: 'assistant', content: 'old', metadata: { marker: { value: 1 } } };
      const pluginContents: string[] = [];
      const plugin: MessageEnginePlugin = {
        onCompletionChunk(context) {
          pluginContents.push(String(context.getState().messages.at(-1)?.content));
        },
      };
      const { bridge, engine } = createRun(mode, provider, [original], [plugin]);
      const fixture = await mount(bridge);
      const snapshots: Array<{ array: ChatMessage[]; old: ChatMessage; nested: unknown; active: ChatMessage; content: string }> = [];
      const notificationOrdering: boolean[] = [];
      const unsubscribe = engine.subscribe('messages', (state) => {
        notificationOrdering.push(bridge.state()?.messages.at(-1)?.content === state.messages.at(-1)?.content);
        const active = state.messages.at(-1);
        if (active?.role === 'assistant' && active !== original) snapshots.push({
          array: bridge.state()!.messages, old: bridge.state()!.messages[0],
          nested: bridge.state()!.messages[0].metadata?.marker,
          active: bridge.state()!.messages.at(-1)!, content: String(active.content),
        });
      });
      const pending = engine.sendMessage('stream');
      for (const [index, gate] of gates.entries()) {
        const notificationsBefore = bridge.metrics.notifications;
        gate.release();
        for (let attempts = 0; pluginContents.length <= index && attempts < 100; attempts++)
          await new Promise((resolve) => setTimeout(resolve, 1));
        await fixture.whenStable();
        expect(bridge.metrics.notifications).toBeGreaterThan(notificationsBefore);
        expect(fixture.nativeElement.querySelectorAll('[data-message]')[2].textContent).toContain('123'.slice(0, index + 1));
      }
      await pending;
      expect(pluginContents).toEqual(['1', '12', '123']);
      expect(notificationOrdering.every(Boolean)).toBe(true);
      const byContent = ['1', '12', '123'].map((value) => snapshots.find((item) => item.content === value)!);
      expect(byContent.every(Boolean)).toBe(true);
      expect(byContent[0].array).not.toBe(byContent[1].array);
      expect(byContent[0].old === byContent[1].old).toBe(mode !== 'full');
      expect(byContent[0].nested === byContent[1].nested).toBe(mode !== 'full');
      expect(byContent[0].active === byContent[1].active).toBe(mode !== 'full');
      expect(byContent[0].active === engine.getState().messages.at(-1)).toBe(mode !== 'full');
      if (mode !== 'full') expect(byContent[0].active.content).toBe('123');
      else expect(byContent[0].active.content).toBe('1');
      const before = bridge.metrics.notifications;
      fixture.destroy();
      await engine.sendMessage('after-dispose');
      expect(bridge.metrics.notifications).toBe(before);
      unsubscribe();
      TestBed.resetTestingModule();
    });

    it('refreshes nested tool OnPush child on approval and preserves plugin state', async () => {
      const { bridge, engine } = createRun(mode, scriptedProvider, [], [tool]);
      const fixture = await mount(bridge);
      await engine.sendMessage('tool');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('[data-tool]').textContent).toContain('awaiting-approval');
      const assistant = engine.getState().messages.find((message) => message.tool_calls?.length);
      const callId = assistant!.tool_calls![0].id;
      const priorTool = bridge.state()!.messages.find((message) => message.tool_calls?.length)!;
      const priorStatus = (priorTool.state?.toolCall as Record<string, { status: string }>)[callId];
      await engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: callId });
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('[data-tool]').textContent).toContain('success');
      const currentTool = bridge.state()!.messages.find((message) => message.tool_calls?.length)!;
      expect(priorTool === currentTool).toBe(mode !== 'full');
      expect(priorStatus.status).toBe(mode === 'full' ? 'awaiting-approval' : 'success');
      expect(engine.getState().messages.some((message) => message.content === 'Tool finished')).toBe(true);
      fixture.destroy();
      TestBed.resetTestingModule();
    });
  });
}

const benchmarkModes: S4Mode[] = modes;

it('S4 long-history continuous stream measurement', async () => {
  const history: ChatMessage[] = Array.from({ length: 500 }, (_, index) => ({
    role: 'assistant', content: `${index}:` + 'x'.repeat(1024), metadata: { marker: { value: index } },
  }));
  for (const mode of benchmarkModes) {
    const provider: ResponseProvider = async function* () {
      for (let index = 0; index < 80; index++) yield chunk('x'.repeat(32), index === 79);
    };
    const { bridge, engine } = createRun(mode, provider, history);
    const heapBefore = process.memoryUsage().heapUsed;
    let peakHeap = heapBefore;
    const unsubscribeMemory = engine.subscribe(() => { peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed); });
    const start = performance.now();
    await engine.sendMessage('benchmark');
    const elapsedMs = performance.now() - start;
    const heapAfter = process.memoryUsage().heapUsed;
    expect(engine.getState().messages.at(-1)?.content).toHaveLength(2560);
    const historyPayloadBytes = JSON.stringify(history).length;
    const finalPayloadBytes = JSON.stringify(engine.getState().messages).length;
    const estimatedDeepCopyBytes = mode === 'full' ? finalPayloadBytes * bridge.metrics.notifications : 0;
    console.log('S4_MEASURE ' + JSON.stringify({ mode, history: history.length, historyPayloadBytes,
      chunks: 80, elapsedMs, heapBefore, heapAfter, peakHeap, heapDelta: heapAfter - heapBefore,
      estimatedDeepCopyBytes, ...bridge.metrics }));
    unsubscribeMemory();
    bridge.dispose();
  }
}, 120_000);
