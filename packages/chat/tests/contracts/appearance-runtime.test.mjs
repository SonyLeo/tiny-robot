import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { assert, runTest } from '../_helpers.mjs'

const chatLayoutPath = fileURLToPath(new URL('../../src/components/ChatLayout.vue', import.meta.url))
const chatLayoutSource = readFileSync(chatLayoutPath, 'utf8')

const conditionalThemeProviderPath = fileURLToPath(new URL('../../src/components/shared/ConditionalThemeProvider.vue', import.meta.url))
const conditionalThemeProviderSource = readFileSync(conditionalThemeProviderPath, 'utf8')

await runTest('ChatLayout source bridges appearance mode through ThemeProvider instead of writing color-mode attr directly', async () => {
  assert.equal(chatLayoutSource.includes('ConditionalThemeProvider'), true)
  assert.equal(chatLayoutSource.includes(':data-tr-color-mode='), false)
  assert.equal(chatLayoutSource.includes(":data-tr-appearance-mode="), true)
})

await runTest('ChatLayout source keeps system appearance mapping for runtime color-mode resolution', async () => {
  assert.equal(conditionalThemeProviderSource.includes("mode === 'system'"), true)
  assert.equal(conditionalThemeProviderSource.includes("'auto'"), true)
})

await runTest('ChatLayout source keeps explicit light/dark appearance mapping for runtime color-mode resolution', async () => {
  assert.equal(conditionalThemeProviderSource.includes("mode === 'light'"), true)
  assert.equal(conditionalThemeProviderSource.includes("mode === 'dark'"), true)
})

