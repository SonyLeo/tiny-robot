import { sseStreamToGenerator, type ResponseProvider } from '@opentiny/tiny-robot-kit/core';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources';

export const completion = (content: string, toolName?: string, args = '{}'): ChatCompletion => ({
  id: 'p7-response', object: 'chat.completion', created: 0, model: 'p7',
  choices: [{ index: 0, message: toolName
    ? { role: 'assistant', content: '', tool_calls: [{ id: 'p7-call', type: 'function', function: { name: toolName, arguments: args } }] }
    : { role: 'assistant', content }, finish_reason: toolName ? 'tool_calls' : 'stop' }],
} as ChatCompletion);

export const chunk = (content: string, done = false): ChatCompletionChunk => ({
  id: 'p7-chunk', object: 'chat.completion.chunk', created: 0, model: 'p7',
  choices: [{ index: 0, delta: { role: 'assistant', content }, finish_reason: done ? 'stop' : null }],
});

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve) => {
  const end = () => { clearTimeout(timer); signal.removeEventListener('abort', end); resolve(); };
  const timer = setTimeout(end, ms);
  signal.addEventListener('abort', end, { once: true });
  if (signal.aborted) end();
});

export const scriptedProvider: ResponseProvider = async function* (body, signal) {
  const userIndex = body.messages.map((message) => message.role).lastIndexOf('user');
  const tools = body.messages.slice(userIndex + 1).filter((message) => message.role === 'tool');
  if (tools.length) { yield completion(`Result: ${tools.map((message) => String(message.content)).join(' ')}`); return; }
  const prompt = String(body.messages[userIndex]?.content ?? '');
  if (prompt === 'error') throw new Error('P7 provider failure');
  if (prompt === 'tool') { yield completion('', 'confirm'); return; }
  if (prompt === 'skill') {
    yield completion('', 'read_skill_file', JSON.stringify({ skillName: 'docs', path: 'guide.md' }));
    return;
  }
  for (const [index, content] of ['one ', 'two ', 'three'].entries()) {
    await wait(250, signal);
    if (signal.aborted) return;
    yield chunk(content, index === 2);
  }
};

export const httpProvider: ResponseProvider = async function* (body, signal) {
  const port = new URLSearchParams(location.search).get('transportPort');
  if (!port) throw new Error('transportPort is required for the local HTTP transport');
  const response = await fetch(`http://127.0.0.1:${port}/stream`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body), signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  yield* sseStreamToGenerator<ChatCompletionChunk>(response, { signal });
};
