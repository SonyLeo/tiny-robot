import { defineConfig, devices } from '@playwright/test'

const testPort = Number(process.env.TINY_ROBOT_TEST_PORT || 3340)
const baseURL = `http://127.0.0.1:${testPort}`
const localBrowserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || (!process.env.CI ? 'chrome' : '')
const disableVideo = process.env.PLAYWRIGHT_DISABLE_VIDEO === '1' || Boolean(localBrowserChannel)

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot only on failures */
    screenshot: 'only-on-failure',
    /* Record video only on failures */
    video: disableVideo ? 'off' : 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(localBrowserChannel ? { channel: localBrowserChannel } : {}),
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npm run dev -- --force --port ${testPort}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
