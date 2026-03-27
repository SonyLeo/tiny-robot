import {
  assert,
  ChatProviderError,
  createChatAdapterFromConfig,
  createOpenAICompatibleResponseProvider,
  expectThrowsAsync,
  runTest,
} from './_helpers.mjs'

await runTest(
  'createOpenAICompatibleResponseProvider resolves endpoint, forwards request options, and surfaces structured server errors',
  async () => {
    const originalFetch = globalThis.fetch
    const requests = []
    const tools = [
      {
        type: 'function',
        function: {
          name: 'microsoft-learn__microsoft_docs_search',
          description: 'Search Microsoft Learn documentation.',
          parameters: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
              },
            },
            required: ['question'],
          },
        },
      },
    ]

    globalThis.fetch = async (input, init) => {
      requests.push({
        input,
        init,
      })

      return {
        ok: false,
        status: 502,
        headers: {
          get() {
            return null
          },
        },
        async text() {
          return 'proxy unavailable'
        },
      }
    }

    try {
      const provider = createOpenAICompatibleResponseProvider({
        providerId: 'openai',
        baseURL: 'https://example.com/',
        apiPath: 'v1/chat/completions',
        model: 'gpt-test',
        systemPrompt: 'Be helpful',
        temperature: 0.4,
        maxTokens: 256,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer token',
        },
      })

      const error = await expectThrowsAsync(
        async () => {
          for await (const _chunk of provider({
            messages: [{ role: 'user', content: 'hello' }],
            tools,
            tool_choice: 'auto',
          })) {
            // no-op
          }
        },
        /openai API error 502: proxy unavailable/,
      )

      assert.equal(error instanceof ChatProviderError, true)
      assert.equal(error.httpStatus, 502)
      assert.equal(error.providerId, 'openai')
      assert.equal(error.retryable, true)

      assert.equal(requests.length, 1)
      assert.equal(requests[0].input, 'https://example.com/v1/chat/completions')
      assert.equal(requests[0].init?.credentials, 'include')
      assert.equal(requests[0].init?.headers?.Authorization, 'Bearer token')

      const parsedBody = JSON.parse(requests[0].init?.body)
      assert.equal(parsedBody.model, 'gpt-test')
      assert.equal(parsedBody.stream, true)
      assert.equal(parsedBody.temperature, 0.4)
      assert.equal(parsedBody.max_tokens, 256)
      assert.deepEqual(parsedBody.tools, tools)
      assert.equal(parsedBody.tool_choice, 'auto')
      assert.deepEqual(parsedBody.messages, [
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'hello' },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  },
)

await runTest('createChatAdapterFromConfig creates response providers from providerId-mapped models', async () => {
  const originalFetch = globalThis.fetch
  const requests = []

  globalThis.fetch = async (input, init) => {
    requests.push({ input, init })

    return {
      ok: false,
      status: 500,
      headers: {
        get() {
          return null
        },
      },
      async text() {
        return 'adapter failure'
      },
    }
  }

  try {
    const adapter = createChatAdapterFromConfig({
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      providers: {
        openai: {
          endpoint: '/api/chat',
        },
      },
      defaults: {
        model: 'gpt-4o-mini',
      },
    })

    const provider = adapter.createResponseProvider()

    const error = await expectThrowsAsync(
      async () => {
        for await (const _chunk of provider({
          messages: [{ role: 'user', content: 'ping' }],
        })) {
          // no-op
        }
      },
      /openai API error 500: adapter failure/,
    )

    assert.equal(error.httpStatus, 500)
    assert.equal(error.providerId, 'openai')

    const parsedBody = JSON.parse(requests[0].init?.body)
    assert.equal(parsedBody.model, 'gpt-4o-mini')
    assert.equal(requests[0].input, '/api/chat')
  } finally {
    globalThis.fetch = originalFetch
  }
})

await runTest(
  'createOpenAICompatibleResponseProvider surfaces http status, code, and providerId metadata from JSON error payloads',
  async () => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 401,
        headers: {
          get(name) {
            return name === 'content-type' ? 'application/json' : null
          },
        },
        async text() {
          return JSON.stringify({
            error: {
              message: 'Unauthorized',
              code: 'invalid_api_key',
            },
          })
        },
      }
    }

    try {
      const provider = createOpenAICompatibleResponseProvider({
        providerId: 'openai',
        endpoint: '/api/openai',
        model: 'gpt-4o-mini',
      })

      const error = await expectThrowsAsync(
        async () => {
          for await (const _chunk of provider({
            messages: [{ role: 'user', content: 'hello' }],
          })) {
            // no-op
          }
        },
        /openai API error 401: Unauthorized/,
      )

      assert.equal(error instanceof ChatProviderError, true)
      assert.equal(error.httpStatus, 401)
      assert.equal(error.code, 'invalid_api_key')
      assert.equal(error.providerId, 'openai')
      assert.equal(error.retryable, false)
    } finally {
      globalThis.fetch = originalFetch
    }
  },
)
