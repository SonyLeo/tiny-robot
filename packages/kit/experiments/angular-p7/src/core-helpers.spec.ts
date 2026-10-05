import { describe, expect, it } from 'vitest';
import { AIClient, BaseModelProvider, formatMessages, extractTextFromResponse } from '@opentiny/tiny-robot-kit/core';

type Request = Parameters<BaseModelProvider['chat']>[0];
type Handler = Parameters<BaseModelProvider['chatStream']>[1];
type Response = Awaited<ReturnType<BaseModelProvider['chat']>>;

class ControlledClientProvider extends BaseModelProvider {
  readonly response: Response = {
    id: 'p7-client', object: 'chat.completion', created: 0, model: 'p7-client',
    choices: [{ index: 0, message: { role: 'assistant', content: 'typed client result' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
  };
  streamEnabled = false;
  async chat(_request: Request): Promise<Response> { return this.response; }
  async chatStream(request: Request, handler: Handler) {
    this.streamEnabled = request.options?.stream === true;
    handler.onData({ id: 'chunk', object: 'chat.completion.chunk', created: 0, model: 'p7',
      choices: [{ index: 0, delta: { content: 'typed stream' }, finish_reason: 'stop' }] });
    handler.onDone('stop');
  }
}

describe('P7 strict packed core helper consumption', () => {
  it('uses exported format/extract helpers and AIClient with a custom provider', async () => {
    const messages = formatMessages(['hello', { role: 'assistant', content: 'answer' }]);
    expect(messages.map((message: { content: string }) => message.content)).toEqual(['hello', 'answer']);
    const provider = new ControlledClientProvider({ provider: 'custom' });
    const client = new AIClient({ provider: 'custom', providerImplementation: provider });
    const result = await client.chat({ messages });
    expect(extractTextFromResponse(result)).toBe('typed client result');
    let text = ''; let done = '';
    const handler: Handler = {
      onData: (chunk) => { text += chunk.choices[0].delta.content ?? ''; },
      onError: (error) => { throw new Error(error.message); }, onDone: (reason) => { done = reason ?? ''; },
    };
    await client.chatStream({ messages }, handler);
    expect(text).toBe('typed stream'); expect(done).toBe('stop'); expect(provider.streamEnabled).toBe(true);
  });
});
