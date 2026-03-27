import {
  assert,
  ChatProviderError,
  createOpenAIProvider,
  createServerProxyFactory,
  createServerProxyProvider,
  expectThrowsAsync,
  matchProvider,
  runTest,
} from './_helpers.mjs'

await runTest('matchProvider only matches models from the requested provider id', async () => {
  const matchOpenAI = matchProvider('openai')

  assert.equal(matchOpenAI({ provider: 'openai' }), true)
  assert.equal(matchOpenAI({ provider: 'deepseek' }), false)
  assert.equal(matchOpenAI({}), false)
})

await runTest('createServerProxyProvider resolves endpoint, forwards request options, and surfaces structured server errors', async () => {
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
    const provider = createServerProxyProvider({
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
      /server_proxy API error 502: proxy unavailable/,
    )

    assert.equal(error instanceof ChatProviderError, true)
    assert.equal(error.httpStatus, 502)
    assert.equal(error.provider, 'server_proxy')
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
})

await runTest('createServerProxyFactory binds model values into provider instances and reuses provider matching', async () => {
  const factory = createServerProxyFactory({
    provider: 'openai',
    endpoint: '/api/chat',
  })

  assert.equal(factory.match({ provider: 'openai' }), true)
  assert.equal(factory.match({ provider: 'deepseek' }), false)

  const originalFetch = globalThis.fetch
  const requests = []

  globalThis.fetch = async (input, init) => {
    requests.push({
      input,
      init,
    })

    return {
      ok: false,
      status: 500,
      headers: {
        get() {
          return null
        },
      },
      async text() {
        return 'factory failure'
      },
    }
  }

  try {
    const provider = factory.createProvider({
      value: 'gpt-4o-mini',
      provider: 'openai',
    })

    const error = await expectThrowsAsync(
      async () => {
        for await (const _chunk of provider({
          messages: [{ role: 'user', content: 'ping' }],
        })) {
          // no-op
        }
      },
      /server_proxy API error 500: factory failure/,
    )

    assert.equal(error.httpStatus, 500)
    const parsedBody = JSON.parse(requests[0].init?.body)
    assert.equal(parsedBody.model, 'gpt-4o-mini')
  } finally {
    globalThis.fetch = originalFetch
  }
})

await runTest('createOpenAIProvider surfaces http status, code, and provider metadata from JSON error payloads', async () => {
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
    const provider = createOpenAIProvider({
      apiKey: 'token',
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
    assert.equal(error.provider, 'openai')
    assert.equal(error.retryable, false)
  } finally {
    globalThis.fetch = originalFetch
  }
})
