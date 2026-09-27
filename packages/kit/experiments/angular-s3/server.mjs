import { createServer } from 'node:http';

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' }).end();
    return;
  }
  if (request.method !== 'POST' || request.url !== '/stream') {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'content-type': 'text/event-stream', 'access-control-allow-origin': '*',
    'cache-control': 'no-cache',
  });
  for (const [index, content] of ['HTTP ', 'SSE ', 'works'].entries()) {
    if (response.destroyed) break;
    response.write(`data: ${JSON.stringify({ id: 'http-chunk', object: 'chat.completion.chunk', created: 0,
      model: 's3', choices: [{ index: 0, delta: { role: 'assistant', content },
        finish_reason: index === 2 ? 'stop' : null }] })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  response.end();
}).listen(4317, '127.0.0.1', () => console.log('S3 SSE listening on 4317'));
