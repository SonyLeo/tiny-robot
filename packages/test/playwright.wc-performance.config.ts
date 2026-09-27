import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'src/chat-web-component-performance.spec.ts',
  reporter: 'list',
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: [
    {
      command: 'node ../../verification/chat-web-component-consumer/server.mjs',
      url: 'http://localhost:4179',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node ../../verification/chat-web-component-angular/server.mjs',
      url: 'http://localhost:4180',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
