import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function freePort() {
  const server = createServer(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port; await new Promise((resolve) => server.close(resolve)); return port;
}
const http = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' }).end(); return;
  }
  if (request.method !== 'POST' || request.url !== '/stream') { response.writeHead(404).end(); return; }
  for await (const _part of request) { /* consume the actual request body */ }
  response.writeHead(200, { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-cache' });
  for (const [index, content] of ['HTTP ', 'SSE ', 'works'].entries()) {
    if (response.destroyed) break;
    response.write(`data: ${JSON.stringify({ id: 'http', object: 'chat.completion.chunk', created: 0, model: 'p7',
      choices: [{ index: 0, delta: { content }, finish_reason: index === 2 ? 'stop' : null }] })}\n\n`);
    await delay(150);
  }
  response.end();
});
let cli; let browser;
try {
  await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
  const transportPort = http.address().port; const port = await freePort();
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
    await page.goto(base); await until(primary, 'Primary: A');
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
      await click(name); const started = Date.now();
      while (Date.now() - started < timeout) {
        const error = await diagnosticError.textContent(); if (error) throw new Error(`${name}: ${error}`);
        const result = await diagnosticResult.textContent(); if (result) return JSON.parse(result);
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
      nativeResources, controlledGitHub, liveGitHub, lifecycle, heapBefore, heapAfter }));
    await context.close();
  }
} finally {
  await browser?.close();
  if (cli && cli.exitCode === null) {
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/pid', String(cli.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true }); } catch { cli.kill(); } }
    else cli.kill('SIGTERM');
  }
  http.closeAllConnections(); await new Promise((resolve) => http.close(resolve));
}
