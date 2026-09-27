import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'src/chat-web-component-angular.spec.ts',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4180', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
  webServer: {
    command: 'node ../../verification/chat-web-component-angular/server.mjs',
    url: 'http://localhost:4180',
    reuseExistingServer: !process.env.CI,
  },
})
