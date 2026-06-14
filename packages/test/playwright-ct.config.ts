import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, devices } from '@playwright/experimental-ct-vue'

const configDir = fileURLToPath(new URL('.', import.meta.url))
const localBrowserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || (!process.env.CI ? 'chrome' : '')

export default defineConfig({
  testDir: './src/markdown-ct',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ctViteConfig: {
      resolve: {
        alias: [
          {
            find: '@opentiny/tiny-robot',
            replacement: resolve(configDir, '../components/src/index.ts'),
          },
          {
            find: '@opentiny/tiny-robot-svgs',
            replacement: resolve(configDir, '../svgs/src/index.ts'),
          },
        ],
      },
      optimizeDeps: {
        exclude: ['@opentiny/tiny-robot', '@opentiny/tiny-robot-svgs'],
      },
    },
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
