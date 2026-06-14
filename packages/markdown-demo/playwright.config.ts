import { defineConfig, devices } from '@playwright/test'

const appendNoProxy = (value: string | undefined) => {
  const entries = new Set(
    (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )

  entries.add('127.0.0.1')
  entries.add('localhost')

  return [...entries].join(',')
}

process.env.NO_PROXY = appendNoProxy(process.env.NO_PROXY)
process.env.no_proxy = appendNoProxy(process.env.no_proxy)

const port = Number(process.env.TINY_ROBOT_MARKDOWN_DEMO_PORT || 3399)
const localBrowserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || (!process.env.CI ? 'chrome' : '')

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `pnpm dev -- --host 127.0.0.1 --port ${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    url: `http://127.0.0.1:${port}`,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(localBrowserChannel ? { channel: localBrowserChannel } : {}),
      },
    },
  ],
})
