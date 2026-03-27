/**
 * Example chat proxy.
 *
 * Move this file into your server runtime (Express, Koa, Hono, Next.js Route
 * Handler, etc.) and keep the provider API key on the server.
 */

export async function proxyChatRequest(request: Request): Promise<Response> {
  const body = await request.json()

  const response = await fetch('__PROXY_ENDPOINT__', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.__PROXY_API_KEY_ENV__}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
