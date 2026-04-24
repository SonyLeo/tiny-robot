import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getOrCreateSessionId(req: IncomingMessage) {
  const cookieHeader = req.headers.cookie ?? ''
  const matchedSessionId = cookieHeader.match(/(?:^|;\s*)mock-chat-session=([^;]+)/)?.[1]

  return matchedSessionId ?? `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function getLastUserMessageContent(body: unknown) {
  if (!body || typeof body !== 'object') {
    return ''
  }

  const messages = (body as { messages?: Array<{ content?: unknown }> }).messages
  const lastMessage = messages?.[messages.length - 1]?.content
  return typeof lastMessage === 'string' ? lastMessage : ''
}

async function readJsonBody(req: IncomingMessage) {
  let rawBody = ''

  for await (const chunk of req) {
    rawBody += String(chunk)
  }

  return rawBody ? JSON.parse(rawBody) : {}
}

function createChunk({
  content,
  role,
  finishReason = null,
  model,
}: {
  content?: string
  role?: string
  finishReason?: string | null
  model: string
}) {
  return {
    id: `mock-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role,
          content,
        },
        logprobs: null,
        finish_reason: finishReason,
      },
    ],
  }
}

function writeSseEvent(res: ServerResponse, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function resolveProviderLabel(providerId: string, model: string) {
  const normalizedModel = model.toLowerCase()

  if (normalizedModel.includes('deepseek')) {
    return 'deepseek'
  }

  if (normalizedModel.includes('openai')) {
    return 'openai'
  }

  if (normalizedModel.includes('claude') || normalizedModel.includes('anthropic')) {
    return 'anthropic'
  }

  return providerId === 'edge' ? 'edge-provider' : providerId
}

async function streamMockChatResponse(
  req: IncomingMessage,
  res: ServerResponse,
  {
    providerId,
    model,
    userMessage,
  }: {
    providerId: string
    model: string
    userMessage: string
  },
) {
  const providerLabel = resolveProviderLabel(providerId, model)
  const reply = `[${providerLabel}:${model}] ${userMessage}\nThis is a streamed reply from the mock provider.`
  const initialDelay = userMessage === 'abort-request' || userMessage === 'optimistic-state' ? 120 : 10
  const isConnectionClosed = () => req.aborted || res.destroyed || res.writableEnded

  if (initialDelay > 0) {
    await delay(initialDelay)
  }

  let isFirstChunk = true
  for (const char of reply) {
    if (isConnectionClosed()) {
      res.end()
      return
    }

    await delay(25)
    writeSseEvent(
      res,
      createChunk({
        content: char,
        role: isFirstChunk ? 'assistant' : undefined,
        model,
      }),
    )
    isFirstChunk = false
  }

  if (isConnectionClosed()) {
    res.end()
    return
  }

  writeSseEvent(
    res,
    createChunk({
      content: undefined,
      finishReason: 'stop',
      model,
    }),
  )
  res.write('data: [DONE]\n\n')
  res.end()
}

export function createMockChatApiPlugin(): Plugin {
  const failureCount = new Map<string, number>()

  return {
    name: 'tiny-robot-test-chat-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        const providerId = req.url?.replace(/^\//, '').split('?')[0]
        if (!providerId) {
          next()
          return
        }

        const sessionId = getOrCreateSessionId(req)
        const body = await readJsonBody(req)
        const model =
          typeof (body as { model?: unknown }).model === 'string' ? (body as { model: string }).model : providerId
        const userMessage = getLastUserMessageContent(body)
        res.setHeader('Set-Cookie', `mock-chat-session=${sessionId}; Path=/; SameSite=Lax`)

        const shouldFailOnce = userMessage === 'err-once'

        if ((providerId === 'edge' && userMessage === 'err') || shouldFailOnce) {
          const failureKey = `${sessionId}:${providerId}:${model}:${userMessage}`
          const currentFailureCount = failureCount.get(failureKey) ?? 0
          failureCount.set(failureKey, currentFailureCount + 1)

          if (currentFailureCount === 0) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: {
                  message: 'Mock API Error: provider execution failed',
                  code: 'mock_provider_failed',
                },
              }),
            )
            return
          }
        }

        if (providerId !== 'edge' && userMessage === 'err') {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: {
                message: 'Mock API Error: provider execution failed',
                code: 'mock_provider_failed',
              },
            }),
          )
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache, no-transform')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')
        res.flushHeaders?.()

        void streamMockChatResponse(req, res, {
          providerId,
          model,
          userMessage,
        })
      })
    },
  }
}
