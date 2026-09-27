import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'src/chat-web-component.spec.ts',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4178',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ../chat/verification/web-component/server.mjs',
    url: 'http://localhost:4178',
    reuseExistingServer: !process.env.CI,
  },
})
