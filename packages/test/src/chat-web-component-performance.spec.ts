import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

declare global {
  interface Window {
    chatReadyTimes?: number[]
  }
}

test('record local fresh-context ready times for installed native and Angular hosts', async ({ browser }) => {
  const hosts = {
    native: 'http://localhost:4179/',
    angular: 'http://localhost:4180/',
  }
  const results: Record<string, number[]> = {}
  for (const [name, url] of Object.entries(hosts)) {
    const times: number[] = []
    for (let sample = 0; sample < 5; sample++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      await page.addInitScript(() => {
        window.chatReadyTimes = []
        document.addEventListener('ready', () => window.chatReadyTimes!.push(performance.now()))
      })
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await expect.poll(() => page.evaluate(() => window.chatReadyTimes?.length), { timeout: 15_000 }).toBe(2)
      times.push(Math.round(await page.evaluate(() => Math.max(...window.chatReadyTimes!))))
      await context.close()
    }
    results[name] = times
  }
  const report = {
    browser: browser.version(),
    host: 'local static HTTP; browser process warm; fresh context and cache per sample',
    metric: 'navigationStart to the later of two ready events, milliseconds',
    samples: results,
    median: Object.fromEntries(
      Object.entries(results).map(([name, samples]) => [name, [...samples].sort((a, b) => a - b)[2]]),
    ),
  }
  const output = fileURLToPath(new URL('../../../verification/chat-web-component-performance.json', import.meta.url))
  await writeFile(output, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
})
