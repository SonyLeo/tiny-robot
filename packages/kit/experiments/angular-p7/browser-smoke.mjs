import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const negativeOnly = process.argv.includes('--negative-transports');
const transportObservations = new Map();
async function waitFor(check, label, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) { if (await check()) return; await delay(30); }
  throw new Error(`Timed out: ${label}`);
}
const sse = (content, done = false) => `data: ${JSON.stringify({ id: 'http', object: 'chat.completion.chunk', created: 0, model: 'p7',
  choices: [{ index: 0, delta: { content }, finish_reason: done ? 'stop' : null }] })}\n\n`;
async function cancelledResponse(response, key, contentType, first, late) {
  const observation = { key, received: true, firstChunk: false, closedBeforeEnd: false, lateAttempt: false, lateWriteAccepted: false };
  transportObservations.set(key, observation);
  response.on('close', () => { observation.closedBeforeEnd = !response.writableEnded; });
  response.writeHead(200, { 'content-type': contentType, 'access-control-allow-origin': '*', 'cache-control': 'no-cache' });
  response.write(first); observation.firstChunk = true;
  await delay(1000);
  observation.lateAttempt = true;
  if (!response.destroyed) { observation.lateWriteAccepted = response.write(late); response.end(); }
}
async function freePort() {
  const server = createServer(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port; await new Promise((resolve) => server.close(resolve)); return port;
}
const http = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': '*' }).end(); return;
  }
  const url = new URL(request.url, 'http://127.0.0.1');
  if (request.method === 'GET' && url.pathname === '/github/missing') {
    const key = `github404-${url.searchParams.get('mode')}`;
    transportObservations.set(key, { key, received: true, status: 404 });
    response.writeHead(404, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }).end('{"message":"Not Found"}'); return;
  }
  if (request.method === 'GET' && url.pathname === '/github/cancel') {
    await cancelledResponse(response, `github-${url.searchParams.get('mode')}`, 'application/json', '[', ']'); return;
  }
  if (request.method !== 'POST' || request.url !== '/stream') { response.writeHead(404).end(); return; }
  let body = ''; for await (const part of request) body += part;
  const prompt = JSON.parse(body).messages.findLast((message) => message.role === 'user')?.content;
  if (String(prompt).startsWith('cancel-http-')) {
    await cancelledResponse(response, String(prompt), 'text/event-stream', sse('before cancellation '), sse('late forbidden transport', true)); return;
  }
  response.writeHead(200, { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-cache' });
  for (const [index, content] of ['HTTP ', 'SSE ', 'works'].entries()) {
    if (response.destroyed) break;
    response.write(`data: ${JSON.stringify({ id: 'http', object: 'chat.completion.chunk', created: 0, model: 'p7',
      choices: [{ index: 0, delta: { content }, finish_reason: index === 2 ? 'stop' : null }] })}\n\n`);
    await delay(150);
  }
  response.end();
});
let cli; let browser; let angularPort; let localTransportPort;
try {
  await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
  const transportPort = http.address().port; const port = await freePort();
  angularPort = port; localTransportPort = transportPort;
  cli = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let serverOutput = ''; cli.stdout.on('data', (chunk) => { serverOutput += chunk; }); cli.stderr.on('data', (chunk) => { serverOutput += chunk; });
  let ready = false;
  for (let attempt = 0; attempt < 160; attempt++) {
    if (cli.exitCode !== null) throw new Error(`Angular exited: ${serverOutput}`);
    try { if ((await fetch(`http://127.0.0.1:${port}`)).ok) { ready = true; break; } } catch { /* starting */ }
    await delay(300);
  }
  if (!ready) throw new Error(`Angular readiness timeout: ${serverOutput}`);
  const executable = process.env.P7_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'; await access(executable);
  browser = await chromium.launch({ executablePath: executable, headless: true });
  for (const mode of ['zoneless', 'zone']) {
    const context = await browser.newContext(); const page = await context.newPage();
    // Observe the real browser fetch signal without replacing its transport.
    await page.addInitScript(() => {
      window.__p7FetchSignals = [];
      const fetchTransport = window.fetch.bind(window);
      window.fetch = (input, options) => {
        const entry = { url: String(input), aborted: options?.signal?.aborted ?? false, responseStatus: null };
        window.__p7FetchSignals.push(entry);
        options?.signal?.addEventListener('abort', () => { entry.aborted = true; }, { once: true });
        return fetchTransport(input, options).then((response) => { entry.responseStatus = response.status; return response; });
      };
    });
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    const base = `http://127.0.0.1:${port}/?mode=${mode}&transportPort=${transportPort}`;
    const primary = page.locator('[data-view="Primary"]');
    const state = primary.locator('[data-request-state]');
    const until = async (locator, expected) => {
      const started = Date.now();
      while (Date.now() - started < 15000) { if ((await locator.textContent())?.includes(expected)) return; await delay(30); }
      throw new Error(`Expected ${expected}; got ${await locator.textContent()}`);
    };
    const click = (name) => page.getByRole('button', { name, exact: true }).first().click();
    await page.goto(`${base}&diagnostics=1`); await until(primary, 'Primary: A');
    const negativeTransports = await (async () => {
      await click('Use HTTP');
      await page.locator('input').first().fill(`cancel-http-${mode}`);
      await click('Send'); await until(primary, 'before cancellation '); await until(state, 'processing');
      const httpKey = `cancel-http-${mode}`;
      assert.equal(transportObservations.get(httpKey)?.firstChunk, true, 'HTTP request did not reach the server');
      await click('Cancel'); await until(state, 'aborted');
      await waitFor(() => transportObservations.get(httpKey)?.closedBeforeEnd, 'HTTP connection close after cancel');
      await waitFor(() => transportObservations.get(httpKey)?.lateAttempt, 'HTTP late chunk attempt');
      assert.equal(transportObservations.get(httpKey)?.lateWriteAccepted, false);
      assert.ok(!(await primary.textContent()).includes('late forbidden transport'));
      await click('Save messages'); await until(page.locator('[data-result]'), 'Done');
      const history = await page.evaluate(() => localStorage.getItem('tiny-robot-angular-p7-history'));
      assert.ok(history.includes('before cancellation ')); assert.ok(!history.includes('late forbidden transport'));
      const requestState = (await state.textContent()).trim();
      await click('Use scripted'); await page.locator('input').first().fill('stream');

      // The browser follows the redirect and owns the local network request/AbortSignal.
      const redirect = (route, path) => route.fulfill({ status: 307,
        headers: { location: `http://127.0.0.1:${transportPort}${path}`, 'access-control-allow-origin': '*' } });
      await page.route('https://api.github.com/repos/acme/p7/contents/missing?ref=fixture', (route) => redirect(route, `/github/missing?mode=${mode}`));
      await page.route('https://api.github.com/repos/acme/p7/contents/cancel?ref=fixture', (route) => redirect(route, `/github/cancel?mode=${mode}`));
      const result = page.locator('[data-diagnostic-result]'); const error = page.locator('[data-diagnostic-error]');
      const readResult = async () => {
        await waitFor(async () => {
          const failure = await error.textContent(); if (failure) throw new Error(failure);
          return Boolean(await result.textContent());
        }, 'GitHub diagnostic result');
        return JSON.parse(await result.textContent());
      };
      await click('Validate GitHub 404'); const github404 = await readResult();
      assert.ok(github404.error.includes('404'));
      assert.equal(transportObservations.get(`github404-${mode}`)?.received, true);
      await click('Validate GitHub cancellation');
      const githubKey = `github-${mode}`;
      await waitFor(() => transportObservations.get(githubKey)?.firstChunk, 'GitHub request body began before job.cancel');
      await waitFor(async () => (await page.evaluate(() => window.__p7FetchSignals)).some((entry) => entry.url.includes('/contents/cancel?') && entry.responseStatus === 200), 'GitHub browser response headers before job.cancel');
      await click('Cancel controlled GitHub'); const githubCancel = await readResult();
      await waitFor(() => transportObservations.get(githubKey)?.closedBeforeEnd, 'GitHub connection close after job.cancel');
      await waitFor(() => transportObservations.get(githubKey)?.lateAttempt, 'GitHub late response attempt');
      assert.equal(transportObservations.get(githubKey)?.lateWriteAccepted, false);
      const fetchSignals = await page.evaluate(() => window.__p7FetchSignals);
      const httpSignal = fetchSignals.find((entry) => entry.url.endsWith('/stream'));
      const githubSignal = fetchSignals.find((entry) => entry.url.includes('/contents/cancel?'));
      assert.equal(httpSignal?.aborted, true); assert.equal(githubSignal?.aborted, true);
      assert.ok(githubCancel.error.includes('SkillLoadCancelledError'));
      return { httpCancel: { ...transportObservations.get(httpKey), requestState, lateContentInHistory: false, signal: httpSignal },
        github404: { ...github404, ...transportObservations.get(`github404-${mode}`) },
        githubCancel: { ...githubCancel, ...transportObservations.get(githubKey), signal: githubSignal } };
    })();
    if (negativeOnly) {
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ mode, status: 'passed', scope: 'negative-transports', pageErrors: errors, negativeTransports }));
      await context.close(); continue;
    }
    const firstBoot = await page.locator('[data-boot-id]').textContent();
    await click('Send'); await until(primary, 'one '); await click('B'); await until(primary, 'Primary: B');
    await delay(800); await click('A'); await until(primary, 'one two three');
    await click('Send'); await until(state, 'processing'); await click('Destroy secondary view');
    await until(primary, 'one two three'); await until(state, 'completed');
    assert.equal(await page.locator('[data-view]').count(), 1);
    await click('Start tool'); await until(state, 'paused');
    await click('Dispose manager'); await until(page.locator('[data-result]'), 'Done');
    await page.reload(); await until(state, 'paused');
    assert.notEqual(await page.locator('[data-boot-id]').textContent(), firstBoot);
    await click('Approve'); await until(state, 'completed'); await until(primary, 'approved');
    await click('Start tool'); await until(state, 'paused'); await page.reload(); await until(state, 'paused');
    await click('Reject'); await until(state, 'completed'); await until(primary.locator('[data-tool-status]').last(), 'denied');
    await click('Read Skill'); await until(state, 'paused'); await page.reload(); await until(state, 'paused');
    const resolverBefore = Number(await page.locator('[data-resolver-reads]').textContent());
    await click('Approve'); await until(state, 'completed'); await until(primary, '# Persisted P7 guide');
    assert.ok(Number(await page.locator('[data-resolver-reads]').textContent()) > resolverBefore, 'Resolver was not called in the new page');
    await click('Read Skill'); await until(state, 'paused'); await page.reload(); await until(state, 'paused');
    await click('Reject'); await until(state, 'completed'); await until(primary.locator('[data-tool-status]').last(), 'denied');

    await click('Read Skill'); await until(state, 'paused'); await click('Remove Skill resource'); await until(page.locator('[data-result]'), 'Done');
    await page.reload(); await until(state, 'paused'); await click('Approve'); await until(state, 'completed');
    await until(primary.locator('[data-tool-status]').last(), 'failed');
    await click('Restore Skill'); await until(page.locator('[data-result]'), 'Done');
    await click('Read Skill'); await until(state, 'paused'); await click('Remove Skill'); await until(page.locator('[data-result]'), 'Done');
    await page.reload(); await until(state, 'paused'); await click('Approve');
    await until(page.locator('[data-error]'), 'Unable to restore selected skills: docs');
    assert.equal((await state.textContent()).trim(), 'paused');
    assert.notEqual(await page.evaluate(() => localStorage.getItem('__tiny-robot-turn')), null);
    await until(primary.locator('[data-tool-status]').last(), 'awaiting-approval');
    await click('Restore Skill'); await until(page.locator('[data-result]'), 'Done');
    await click('Approve'); await until(state, 'completed'); await until(primary.locator('[data-tool-status]').last(), 'success');

    await click('Start tool'); await until(state, 'paused'); await click('Remove paused snapshot'); await until(page.locator('[data-result]'), 'Done'); await page.reload();
    await until(state, 'idle'); await click('Approve'); await until(page.locator('[data-result]'), 'missing');
    await click('Start tool'); await until(state, 'paused'); await click('Delete active conversation');
    await until(page.locator('[data-result]'), 'Done');
    await page.reload(); await until(primary, 'Primary: B');
    assert.equal(await page.getByRole('button', { name: 'A', exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('__tiny-robot-turn')), null);
    await click('Fail saves'); await click('Save messages'); await until(page.locator('[data-error]'), 'P7 storage save failed');
    await click('Allow saves'); await click('Save messages'); await until(page.locator('[data-result]'), 'Done');
    await click('Use HTTP'); await click('Send'); await until(primary, 'HTTP SSE works'); await until(state, 'completed');
    await click('Use scripted'); await click('Send'); await until(state, 'processing'); await click('Dispose manager');
    await until(page.locator('[data-result]'), 'Done'); await page.reload(); await until(state, 'idle');
    assert.ok((await primary.textContent()).includes('HTTP SSE works'), 'History was not retained after final disposal');
    await page.goto(`${base}&diagnostics=1`); await until(primary, 'Primary: B');
    const diagnosticResult = page.locator('[data-diagnostic-result]');
    const diagnosticError = page.locator('[data-diagnostic-error]');
    const diagnostic = async (name, timeout = 30000) => {
      const previousResult = await diagnosticResult.textContent();
      await click(name); const started = Date.now();
      while (Date.now() - started < timeout) {
        const error = await diagnosticError.textContent(); if (error) throw new Error(`${name}: ${error}`);
        const result = await diagnosticResult.textContent();
        if (result && result !== previousResult) return JSON.parse(result);
        await delay(50);
      }
      throw new Error(`${name}: timeout`);
    };
    const nativeResources = await diagnostic('Validate native resources');
    await page.route('https://api.github.com/repos/acme/p7/contents/skill?ref=fixture', (route) => route.fulfill({ json: [
      { name: 'SKILL.md', path: 'skill/SKILL.md', type: 'file', download_url: 'https://raw.example/p7/SKILL.md' },
    ] }));
    await page.route('https://raw.example/p7/SKILL.md', (route) => route.fulfill({ body: '---\nname: controlled-remote\ndescription: Controlled HTTP\n---\n# Controlled instructions' }));
    const controlledGitHub = await diagnostic('Validate controlled GitHub');
    const cdp = await context.newCDPSession(page); await cdp.send('HeapProfiler.collectGarbage');
    const heapBefore = await cdp.send('Runtime.getHeapUsage');
    const lifecycle = await diagnostic('Measure long history and disposal', 180000);
    assert.deepEqual(lifecycle.histories?.map((history) => history.historyLength), [500, 2000]);
    assert.equal(lifecycle.destructionCycles, 30);
    for (const key of ['subscriptions', 'requests', 'queues', 'databases', 'timers']) assert.equal(lifecycle.final?.[key], 0);
    await cdp.send('HeapProfiler.collectGarbage'); const heapAfter = await cdp.send('Runtime.getHeapUsage');
    let liveGitHub = { status: 'not run', reason: 'P7_LIVE_GITHUB_JSON was not provided' };
    if (process.env.P7_LIVE_GITHUB_JSON) {
      const config = JSON.parse(process.env.P7_LIVE_GITHUB_JSON);
      await page.getByRole('textbox', { name: 'Live GitHub repository' }).fill(config.repo);
      await page.getByRole('textbox', { name: 'Fixed ref' }).fill(config.ref);
      await page.getByRole('textbox', { name: 'Skill path' }).fill(config.path);
      liveGitHub = await diagnostic('Validate live GitHub');
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ mode, status: 'passed', pageErrors: errors, transport: 'real local HTTP/SSE', reload: 'page.reload',
      negativeTransports, nativeResources, controlledGitHub, liveGitHub, lifecycle, heapBefore, heapAfter }));
    await context.close();
  }
} finally {
  await browser?.close();
  if (cli && cli.exitCode === null) {
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/pid', String(cli.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true }); } catch { cli.kill(); } }
    else cli.kill('SIGTERM');
  }
  http.closeAllConnections(); await new Promise((resolve) => http.close(resolve));
  if (cli) await waitFor(() => cli.exitCode !== null || cli.signalCode !== null, 'owned Angular CLI termination', 5000);
  console.log(JSON.stringify({ scope: 'cleanup', angularPid: cli?.pid, angularPort, localTransportPort,
    angularStopped: !cli || cli.exitCode !== null || cli.signalCode !== null,
    browserClosed: !browser?.isConnected(), httpClosed: !http.listening }));
}
