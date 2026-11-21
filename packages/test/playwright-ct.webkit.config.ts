import { defineConfig, devices } from '@playwright/experimental-ct-vue'
import baseConfig from './playwright-ct.config'

// Opt-in WebKit lane. WebKit 26.5 currently leaves Shiki's `[!code ++]` marker
// as a comment in the full-code transformer case; keep this discrepancy visible.
const webkitArtifactsDir = '.cache/playwright-ct-webkit'

export default defineConfig({
  ...baseConfig,
  outputDir: `${webkitArtifactsDir}/test-results`,
  reporter: [['html', { outputFolder: `${webkitArtifactsDir}/report`, open: 'never' }]],
  use: {
    ...baseConfig.use,
    ctCacheDir: `${webkitArtifactsDir}/cache`,
    ctPort: 4317,
  },
  projects: [
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
    },
  ],
})
