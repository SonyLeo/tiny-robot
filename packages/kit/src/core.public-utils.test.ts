import type { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'

// Importing these helpers from core must not evaluate Vue, even without tree shaking.
vi.mock('vue', () => {
  throw new Error('core public helpers must not import Vue')
})

import { AIClient, BaseModelProvider, extractTextFromResponse, formatMessages } from './core'
import { AIClient as OriginalAIClient } from './client'
import { extractTextFromResponse as originalExtract, formatMessages as originalFormat } from './utils'
import type { ChatCompletionRequest, ChatCompletionResponse, StreamHandler } from './core'

describe('core public text helpers', () => {
  it('exports the original implementations without evaluating Vue', () => {
    expect(formatMessages).toBe(originalFormat)
    expect(extractTextFromResponse).toBe(originalExtract)
    expect(AIClient).toBe(OriginalAIClient)
  })

  it('keeps the legacy text normalization without changing input messages', () => {
    const namedMessage = { role: 'assistant', content: 'answer', name: 'robot', metadata: { id: '1' } }
    const emptyName = { role: 'user', content: 'question', name: '' }

    expect(formatMessages(['hello', namedMessage, emptyName])).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'answer', name: 'robot' },
      { role: 'user', content: 'question' },
    ])
    expect(namedMessage).toEqual({
      role: 'assistant',
      content: 'answer',
      name: 'robot',
      metadata: { id: '1' },
    })
    expect(formatMessages([])).toEqual([])
  })

  it('accepts OpenAI tool messages but preserves the explicitly lossy legacy output', () => {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [{ id: 'tool-1', type: 'function', function: { name: 'weather', arguments: '{}' } }],
      },
      { role: 'tool', content: 'sunny', tool_call_id: 'tool-1' },
      { role: 'user', content: [{ type: 'text', text: 'question' }] },
    ]

    expect(formatMessages(messages)).toEqual([
      { role: 'assistant', content: 'null' },
      { role: 'tool', content: 'sunny' },
      { role: 'user', content: '[object Object]' },
    ])
    expect(messages[0]).toHaveProperty('tool_calls')
    expect(messages[1]).toHaveProperty('tool_call_id', 'tool-1')
  })

  it('keeps the legacy fallback for an assistant message without a content property', () => {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'assistant',
        tool_calls: [{ id: 'tool-1', type: 'function', function: { name: 'weather', arguments: '{}' } }],
      },
    ]

    expect(formatMessages(messages)).toEqual([{ role: 'user', content: '[object Object]' }])
  })

  it('extracts only the first OpenAI response choice and handles null tool content', () => {
    const response: ChatCompletion = {
      id: 'completion-1',
      object: 'chat.completion',
      created: 1,
      model: 'test',
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          logprobs: null,
          message: { role: 'assistant', content: 'first', refusal: null },
        },
        {
          index: 1,
          finish_reason: 'stop',
          logprobs: null,
          message: { role: 'assistant', content: 'second', refusal: null },
        },
      ],
    }

    expect(extractTextFromResponse(response)).toBe('first')
    response.choices[0].message.content = null
    response.choices[0].message.tool_calls = [
      { id: 'tool-1', type: 'function', function: { name: 'weather', arguments: '{}' } },
    ]
    expect(extractTextFromResponse(response)).toBe('')
  })

  it('returns empty text for missing choices, message, or content', () => {
    expect(extractTextFromResponse({})).toBe('')
    expect(extractTextFromResponse({ choices: [] })).toBe('')
    expect(extractTextFromResponse({ choices: [{}] })).toBe('')
    expect(extractTextFromResponse({ choices: [{ message: {} }] })).toBe('')
  })
})

describe('core legacy AIClient', () => {
  it('delegates to the original custom provider with its existing request and stream contract', async () => {
    const response: ChatCompletionResponse = {
      id: 'legacy-1',
      object: 'chat.completion',
      created: 1,
      model: 'test',
      choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: 'answer' } }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }
    class CustomProvider extends BaseModelProvider {
      chat = vi.fn(async (_request: ChatCompletionRequest) => response)
      chatStream = vi.fn(async (_request: ChatCompletionRequest, handler: StreamHandler) => handler.onDone('stop'))
    }
    const provider = new CustomProvider({ provider: 'custom' })
    const client = new AIClient({ provider: 'custom', providerImplementation: provider })
    const request: ChatCompletionRequest = { messages: [{ role: 'user', content: 'question' }] }
    const handler: StreamHandler = { onData: vi.fn(), onError: vi.fn(), onDone: vi.fn() }

    await expect(client.chat(request)).resolves.toBe(response)
    expect(provider.chat).toHaveBeenCalledWith(request)
    await client.chatStream(request, handler)
    expect(provider.chatStream).toHaveBeenCalledWith({ ...request, options: { stream: true } }, handler)
    expect(handler.onDone).toHaveBeenCalledWith('stop')
    expect(request).not.toHaveProperty('options')
  })
})
