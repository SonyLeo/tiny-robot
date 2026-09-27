import { computed, DestroyRef, signal } from '@angular/core';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import {
  createMessageEngine, createNativeMessageAdapter, toolPlugin,
  TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND,
  type MessageEngine, type PublicMessageState, type CreateMessageEngineOptions, type ResponseProvider,
} from '@opentiny/tiny-robot-kit/core';

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const completion = (content: string, tool = false): ChatCompletion => ({
  id: 's3-response', object: 'chat.completion' as const, created: 0, model: 's3',
  choices: [{ index: 0, message: tool ? {
    role: 'assistant' as const, content: '',
    tool_calls: [{ id: 's3-tool', type: 'function' as const, function: { name: 'confirm', arguments: '{}' } }],
  } : { role: 'assistant' as const, content }, finish_reason: tool ? 'tool_calls' as const : 'stop' as const }],
} as ChatCompletion);

export const scriptedProvider: ResponseProvider = async function* (body, abortSignal) {
  const currentUserIndex = body.messages.map((message) => message.role).lastIndexOf('user');
  if (body.messages.slice(currentUserIndex + 1).some((message) => message.role === 'tool')) {
    yield completion('Tool finished');
    return;
  }
  const prompt = String(body.messages[currentUserIndex]?.content ?? '');
  if (prompt === 'error') throw new Error('S3 provider error');
  if (prompt === 'tool') {
    yield completion('', true);
    return;
  }
  for (const [index, content] of ['one ', 'two ', 'three'].entries()) {
    await pause(90);
    if (abortSignal.aborted) return;
    yield {
      id: 's3-chunk', object: 'chat.completion.chunk', created: 0, model: 's3',
      choices: [{ index: 0, delta: { role: 'assistant', content }, finish_reason: index === 2 ? 'stop' : null }],
    } as ChatCompletionChunk;
  }
};

export const httpProvider: ResponseProvider = async function* (body, abortSignal) {
  const response = await fetch('http://localhost:4317/stream', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: body.messages }), signal: abortSignal,
  });
  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let newline: number;
      while ((newline = buffer.indexOf('\n\n')) >= 0) {
        const event = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 2);
        if (event.startsWith('data: ')) yield JSON.parse(event.slice(6));
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export function createExperimentOptions(): CreateMessageEngineOptions {
  return {
    responseProvider: scriptedProvider,
    plugins: [toolPlugin({
      getTools: () => [{ type: 'function', function: { name: 'confirm', description: 'Approval demo', parameters: { type: 'object', properties: {} } } }],
      shouldPauseToolCall: () => true,
      callTool: () => 'approved',
    })],
  };
}

export function createExperimentEngine(): MessageEngine {
  return createMessageEngine(createNativeMessageAdapter(), createExperimentOptions());
}

export class MessageSession {
  readonly state = signal<PublicMessageState>(this.engine.getState());
  readonly messages = computed(() => this.state().messages);
  readonly status = computed(() => this.state().requestState);
  readonly busy = computed(() => this.state().isProcessing);
  private readonly unsubscribe: () => void;
  private destroyed = false;

  constructor(readonly engine: MessageEngine, destroyRef: DestroyRef, ownsEngine: boolean) {
    this.unsubscribe = engine.subscribe((state) => {
      if (!this.destroyed) this.state.set({ ...state, messages: structuredClone(state.messages) });
    });
    destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.unsubscribe();
      if (ownsEngine) void engine.abort();
    });
  }

  send(text: string) { return this.engine.sendMessage(text); }
  cancel() { return this.engine.abort(); }
  decide(approve: boolean, toolCallId: string) {
    return this.engine.dispatchCommand(approve ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND, { toolCallId });
  }
  useHttp(enabled: boolean) { this.engine.setResponseProvider(enabled ? httpProvider : scriptedProvider); }
}
