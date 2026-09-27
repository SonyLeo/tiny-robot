import { spawn, execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { chromium } from 'playwright-core';

const cli = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', '4320'], { stdio: 'ignore' });
let browser;
const wait = async (url) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* not ready */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Service not ready: ${url}`);
};
try {
  const bundle = await build({ entryPoints: ['src/d2-browser.ts'], bundle: true, platform: 'browser', format: 'iife', write: false });
  await wait('http://127.0.0.1:4320');
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://api.github.com/repos/acme/skills', (route) => route.fulfill({ json: { default_branch: 'main' } }));
  await page.route('https://api.github.com/repos/acme/skills/contents/demo?ref=main', (route) => route.fulfill({ json: [
    { name: 'SKILL.md', path: 'demo/SKILL.md', type: 'file', download_url: 'https://raw.example/SKILL.md' },
    { name: 'guide.md', path: 'demo/guide.md', type: 'file', download_url: 'https://raw.example/guide.md' },
  ] }));
  await page.route('https://raw.example/SKILL.md', (route) => route.fulfill({ body: '---\nname: remote\ndescription: Remote skill\n---\n# Remote instructions' }));
  await page.route('https://raw.example/guide.md', (route) => route.fulfill({ body: '# Remote guide' }));
  await page.goto('http://127.0.0.1:4320/?mode=zoneless');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const result = await page.evaluate(() => window.__d2Result);
  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  console.log(JSON.stringify({ result, errors }));
} finally {
  await browser?.close();
  if (cli.exitCode === null) {
    try { execFileSync('taskkill', ['/pid', String(cli.pid), '/t', '/f'], { stdio: 'ignore' }); } catch { cli.kill(); }
  }
}
