import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { runTest } from '../_harness.mjs'
import { waitFor } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createRuntimeFromConfig } = await jiti.import('../../src/runtime/config/createRuntimeFromConfig.ts')
const { createRootBootstrapState } = await jiti.import('../../src/entry/createRootBootstrapState.ts')
const { computed } = await jiti.import('vue')

await runTest('createRuntimeFromConfig returns a Phase 1A Root baseline with runtime and ui outputs', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'hello root runtime' }],
    },
    ui: {
      brand: { title: 'Root Baseline' },
      welcome: { title: 'Hello' },
      contentLayout: 'wide',
    },
    sender: {
      placeholder: 'Ask anything',
      mode: 'multiple',
      maxLength: 4000,
      wordCount: true,
      voice: {
        enabled: true,
        tooltip: 'Runtime voice',
        autoInsert: false,
      },
    },
    attachments: {
      enabled: true,
      upload: {
        enabled: true,
        multiple: true,
      },
      list: {
        wrap: true,
      },
    },
    messages: {
      actions: [{ id: 'copy-custom', label: 'Copy custom' }],
      actionMode: 'append',
      renderers: {
        contentMatches: [{ find: () => false, renderer: { name: 'RuntimeContentRenderer' } }],
        boxMatches: [{ find: () => false, renderer: { name: 'RuntimeBoxRenderer' } }],
      },
      feedback: {
        enabled: true,
      },
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(typeof runtime.conversation.send, 'function')
  assert.equal(typeof runtime.conversation.abort, 'function')
  assert.equal(typeof runtime.sender?.send, 'function')
  assert.equal(typeof runtime.message?.getViewState, 'function')
  assert.equal(typeof runtime.attachments?.prepareFiles, 'function')

  assert.equal(Array.isArray(runtime.conversation.messages.value), true)
  assert.equal(runtime.sender?.defaults?.placeholder, 'Ask anything')
  assert.equal(runtime.sender?.defaults?.mode, 'multiple')
  assert.equal(runtime.sender?.defaults?.wordCount, true)
  assert.equal(runtime.sender?.defaults?.voice?.enabled, true)
  assert.equal(runtime.sender?.defaults?.voice?.tooltip, 'Runtime voice')
  assert.equal(runtime.attachments?.enabled.value, true)
  assert.equal(runtime.attachments?.uploadConfig?.value?.multiple, true)
  assert.equal(runtime.message?.config?.renderers?.contentMatches?.length, 1)
  assert.equal(runtime.message?.config?.renderers?.boxMatches?.length, 1)
  assert.equal(runtime.message?.config?.feedback?.enabled, true)
  assert.equal(ui.brand?.title, 'Root Baseline')
  assert.equal(ui.contentLayout, 'wide')
})

await runTest('createRuntimeFromConfig eagerly materializes the initialMessages baseline before the first send', async () => {
  const seedMessages = [{ role: 'system', content: 'seed-visible-baseline' }]
  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: seedMessages,
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(Boolean(runtime.history?.activeConversationId.value), true)
  assert.equal(runtime.conversation.messages.value.length, 1)
  assert.equal(runtime.conversation.messages.value[0]?.parts[0]?.text, 'seed-visible-baseline')
})

await runTest('Root bootstrap state keeps attachments area bound to sender pending attachments', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    attachments: {
      enabled: true,
      upload: {
        enabled: true,
      },
    },
  })

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => ui),
  )
  const file = new File(['hello'], 'phase-1a.txt', { type: 'text/plain' })

  bootstrap.attachmentsManager.value?.addFiles([file])

  assert.equal(runtime.sender?.pendingAttachments.value.length, 1)
  assert.equal(bootstrap.attachmentsManager.value?.items, runtime.sender?.pendingAttachments)
  assert.equal(runtime.sender?.pendingAttachments.value[0]?.name, 'phase-1a.txt')
})

await runTest('createRuntimeFromConfig keeps sender attachment handoff and attachment configs on the runtime-owned path', async () => {
  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    attachments: {
      enabled: true,
      upload: {
        enabled: true,
        accept: '.md',
        multiple: false,
      },
      list: {
        wrap: true,
      },
    },
  })

  const file = new File(['runtime attachment'], 'phase-3a-runtime.md', { type: 'text/markdown' })
  const prepared = runtime.attachments?.prepareFiles([file]) ?? []

  runtime.sender?.addPendingAttachments(prepared)

  assert.equal(runtime.attachments?.uploadConfig?.value?.accept, '.md')
  assert.equal(runtime.attachments?.uploadConfig?.value?.multiple, false)
  assert.equal(runtime.attachments?.listConfig?.value?.wrap, true)
  assert.equal(runtime.sender?.pendingAttachments.value.length, 1)
  assert.equal(runtime.sender?.pendingAttachments.value[0]?.name, 'phase-3a-runtime.md')

  runtime.sender?.clearPendingAttachments()

  assert.equal(runtime.sender?.pendingAttachments.value.length, 0)
})

await runTest('Phase 1B root baseline exposes history models workspace runtime and page bootstrap slices', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' },
        { id: 'claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', providerId: 'anthropic' },
      ],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'phase-1b shell baseline' }],
    },
    history: {
      enabled: true,
      defaultOpen: true,
    },
    workspace: {
      enabled: true,
      defaultView: 'workspace',
      right: {
        enabled: true,
        defaultOpen: false,
        collapseMode: 'rail',
      },
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  const bootstrap = createRootBootstrapState(
    computed(() => runtime),
    computed(() => ui),
  )

  assert.equal(runtime.history?.conversations.value.length, 1)
  assert.equal(runtime.models?.models.value.length, 2)
  assert.equal(runtime.models?.currentModelId.value, 'gpt-4.1-mini')
  assert.equal(runtime.workspace?.variant.value, 'workspace')
  assert.equal(runtime.workspace?.enabled.value, true)
  assert.equal(bootstrap.shell.value?.variant, 'workspace')
  assert.equal('scaffoldContext' in bootstrap, false)
  assert.equal(bootstrap.pageInputs.value.history?.enabled, true)
  assert.equal(bootstrap.pageInputs.value.modelSelector?.enabled, true)
  assert.equal(bootstrap.pageInputs.value.modelSelector?.models?.length, 2)

  bootstrap.pageInputs.value.updateModel?.(bootstrap.pageInputs.value.modelSelector?.models?.[1])

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(runtime.models?.currentModelId.value, 'claude-3.7-sonnet')
  assert.equal(bootstrap.pageInputs.value.modelSelector?.defaultModel, 'claude-3.7-sonnet')
  assert.equal(bootstrap.chatKit.value.conversations.value.length, 1)
  assert.equal(bootstrap.chatKit.value.activeConversationId.value, runtime.history?.activeConversationId.value ?? null)
})

await runTest('createRuntimeFromConfig keeps messageTransforms active on the Root runtime send path', async () => {
  const originalFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const encoder = new TextEncoder()

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}'))
      const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''
      const reply = `reply:${lastMessage}`
      const chunks = [
        `data: ${JSON.stringify({
          id: 'mock-transform',
          object: 'chat.completion.chunk',
          created: 0,
          model: 'mock-model',
          choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
        })}\n\n`,
        `data: ${JSON.stringify({
          id: 'mock-transform',
          object: 'chat.completion.chunk',
          created: 0,
          model: 'mock-model',
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        })}\n\n`,
        'data: [DONE]\n\n',
      ]

      return new Response(
        new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      )
    },
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        defaultModelId: 'gpt-4.1-mini',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      messages: {
        transforms: {
          onFinish: ({ message }) => ({
            content: `runtime-transform:${message.content}`,
            metadata: {
              transformedBy: 'createRuntimeFromConfig',
            },
          }),
        },
      },
    })

    await runtime.sender.send({
      text: 'root-transform',
    })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(runtime.conversation.messages.value.length, 2)
      assert.equal(runtime.conversation.messages.value[1]?.parts[0]?.text, 'runtime-transform:reply:root-transform')
      assert.equal(runtime.conversation.messages.value[1]?.raw?.metadata?.transformedBy, 'createRuntimeFromConfig')
    })
  } finally {
    if (originalFetchDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalFetchDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }
})

await runTest('createRuntimeFromConfig beforeSend only receives text and can rewrite the outbound text', async () => {
  const originalFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const encoder = new TextEncoder()
  const requests = []
  const beforeSendInputs = []

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}'))
      requests.push(requestBody)
      const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''
      const reply = `reply:${lastMessage}`
      const chunks = [
        `data: ${JSON.stringify({
          id: 'mock-before-send',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
        })}\n\n`,
        `data: ${JSON.stringify({
          id: 'mock-before-send',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        })}\n\n`,
        'data: [DONE]\n\n',
      ]

      return new Response(
        new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      )
    },
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        defaultModelId: 'gpt-4.1-mini',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      lifecycle: {
        beforeSend(input) {
          beforeSendInputs.push(structuredClone(input))
          return {
            text: `rewritten:${input.text}`,
          }
        },
      },
    })

    await runtime.sender.send({
      text: 'original-before-send',
      attachments: [{ name: 'ignored.txt', size: 1 }],
      modelId: 'ignored-model',
    })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(requests.length, 1)
      assert.equal(runtime.conversation.messages.value.at(-1)?.parts[0]?.text, 'reply:rewritten:original-before-send')
    })

    assert.deepEqual(beforeSendInputs, [{ text: 'original-before-send' }])
    assert.equal(requests[0]?.messages?.at(-1)?.content, 'rewritten:original-before-send')
  } finally {
    if (originalFetchDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalFetchDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }
})

await runTest('createRuntimeFromConfig conversation.retry(messageId) only retries the targeted failed turn', async () => {
  const originalFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const encoder = new TextEncoder()
  let failureCount = 0
  const requests = []

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}'))
      requests.push(requestBody)
      const lastMessage = requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''

      if (lastMessage === 'retry-target' && failureCount === 0) {
        failureCount += 1
        return new Response(JSON.stringify({ error: { message: 'temporary retryable failure' } }), {
          status: 502,
          headers: {
            'content-type': 'application/json',
          },
        })
      }

      const reply = `reply:${lastMessage}`
      const chunks = [
        `data: ${JSON.stringify({
          id: 'mock-retry-target',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
        })}\n\n`,
        `data: ${JSON.stringify({
          id: 'mock-retry-target',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        })}\n\n`,
        'data: [DONE]\n\n',
      ]

      return new Response(
        new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      )
    },
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        defaultModelId: 'gpt-4.1-mini',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
    })

    await runtime.sender.send({ text: 'retry-target' })

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'error')
      assert.equal(runtime.conversation.messages.value.length, 2)
    })

    const failedAssistantId = runtime.conversation.messages.value[1]?.id

    assert.equal(await Promise.resolve(runtime.conversation.retry('missing-message-id')), false)
    assert.equal(await Promise.resolve(runtime.conversation.retry(failedAssistantId)), true)

    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(runtime.conversation.messages.value.length, 2)
      assert.equal(runtime.conversation.messages.value[1]?.parts[0]?.text, 'reply:retry-target')
      assert.equal(requests.length, 2)
    })
  } finally {
    if (originalFetchDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalFetchDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }
})

await runTest('createRuntimeFromConfig updates the active request provider after runtime model switches', async () => {
  const originalFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const requests = []
  const encoder = new TextEncoder()

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}'))
      requests.push(requestBody)

      const reply = `[${requestBody.model}] ${requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''}`
      const chunks = [
        `data: ${JSON.stringify({
          id: 'mock-model-switch',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
        })}\n\n`,
        `data: ${JSON.stringify({
          id: 'mock-model-switch',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        })}\n\n`,
        'data: [DONE]\n\n',
      ]

      return new Response(
        new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      )
    },
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [
          { id: 'openai-test', providerId: 'openai' },
          { id: 'deepseek-test', providerId: 'deepseek' },
        ],
        defaultModelId: 'openai-test',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/openai',
        },
      },
    })

    await runtime.sender.send({ text: 'model-a' })
    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(requests.length, 1)
    })

    assert.equal(requests[0]?.model, 'openai-test')

    assert.equal(await Promise.resolve(runtime.models?.selectModel('deepseek-test')), true)
    await runtime.sender.send({ text: 'model-b' })
    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(requests.length, 2)
    })

    assert.equal(runtime.models?.currentModelId.value, 'deepseek-test')
    assert.equal(requests[1]?.model, 'deepseek-test')
    assert.equal(runtime.conversation.messages.value.at(-1)?.parts[0]?.text, '[deepseek-test] model-b')
  } finally {
    if (originalFetchDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalFetchDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }
})

await runTest('createRuntimeFromConfig uses the newly selected provider when the first send creates a conversation', async () => {
  const originalFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
  const requests = []
  const encoder = new TextEncoder()

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}'))
      requests.push(requestBody)

      const reply = `[${requestBody.model}] ${requestBody.messages?.[requestBody.messages.length - 1]?.content ?? ''}`
      const chunks = [
        `data: ${JSON.stringify({
          id: 'mock-first-send-model-switch',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: { role: 'assistant', content: reply }, finish_reason: null }],
        })}\n\n`,
        `data: ${JSON.stringify({
          id: 'mock-first-send-model-switch',
          object: 'chat.completion.chunk',
          created: 0,
          model: requestBody.model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        })}\n\n`,
        'data: [DONE]\n\n',
      ]

      return new Response(
        new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      )
    },
  })

  try {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [
          { id: 'openai-test', providerId: 'openai' },
          { id: 'deepseek-test', providerId: 'deepseek' },
        ],
        defaultModelId: 'openai-test',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/openai',
        },
      },
    })

    assert.equal(runtime.history?.activeConversationId.value ?? null, null)
    assert.equal(await Promise.resolve(runtime.models?.selectModel('deepseek-test')), true)

    await runtime.sender.send({ text: 'first-model-switch' })
    await waitFor(() => {
      assert.equal(runtime.conversation.status.value, 'ready')
      assert.equal(requests.length, 1)
    })

    assert.equal(runtime.models?.currentModelId.value, 'deepseek-test')
    assert.equal(Boolean(runtime.history?.activeConversationId.value), true)
    assert.equal(requests[0]?.model, 'deepseek-test')
    assert.equal(runtime.conversation.messages.value.at(-1)?.parts[0]?.text, '[deepseek-test] first-model-switch')
  } finally {
    if (originalFetchDescriptor) {
      Object.defineProperty(globalThis, 'fetch', originalFetchDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'fetch')
    }
  }
})
