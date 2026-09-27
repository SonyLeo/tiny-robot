import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const cli = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', '4318'], { stdio: 'ignore' });
const sse = spawn(process.execPath, ['server.mjs'], { stdio: 'ignore' });
let browser;
const wait = async (url) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* not ready */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Service not ready: ${url}`);
};
const stop = (child) => {
  if (child.exitCode === null) {
    try { execFileSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' }); } catch { child.kill(); }
  }
};
try {
  await wait('http://127.0.0.1:4318');
  await wait('http://127.0.0.1:4317');
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const mode of ['zone', 'zoneless']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:4318/?mode=${mode}`);
    await page.getByRole('textbox', { name: 'Message' }).fill('hello');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText('assistant: one ', { exact: false }).waitFor();
    await page.getByText('assistant: one two three', { exact: false }).waitFor();
    await page.getByText('completed', { exact: true }).waitFor();

    await page.getByRole('textbox', { name: 'Message' }).fill('tool');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.locator('[data-tool-status="awaiting-approval"]').waitFor();
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.getByText('Tool finished').waitFor();

    await page.getByRole('textbox', { name: 'Message' }).fill('tool');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.locator('[data-tool-status="awaiting-approval"]').last().waitFor();
    await page.getByRole('button', { name: 'Reject' }).last().click();
    await page.locator('[data-tool-status="denied"]').last().waitFor();

    await page.getByRole('textbox', { name: 'Message' }).fill('error');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText('error', { exact: true }).waitFor();

    await page.getByRole('textbox', { name: 'Message' }).fill('cancel');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText('assistant: one ', { exact: false }).last().waitFor();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByText('aborted', { exact: true }).waitFor();

    await page.getByRole('checkbox', { name: 'Local HTTP/SSE' }).check();
    await page.getByRole('textbox', { name: 'Message' }).fill('http');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText('assistant: HTTP SSE works', { exact: false }).waitFor();
    await page.getByText('completed', { exact: true }).waitFor();
    if (errors.length) throw new Error(`${mode} browser errors: ${errors.join('; ')}`);
    console.log(JSON.stringify({ mode, result: 'PASS', errors }));
    await page.close();
  }
} finally {
  await browser?.close();
  stop(cli);
  stop(sse);
}
