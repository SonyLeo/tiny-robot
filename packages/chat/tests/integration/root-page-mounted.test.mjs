import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { assert, createRuntimeFromConfig, runTest, resolveTestDir } from '../_helpers.mjs'

const testDir = resolveTestDir(import.meta.url)
const chatRoot = resolve(testDir, '..', '..')
const tinyRobotStubPath = fileURLToPath(new URL('../_stubs/tiny-robot.mjs', import.meta.url))
const markstreamStubPath = fileURLToPath(new URL('../_stubs/markstream-vue.mjs', import.meta.url))
const emptyModuleStubPath = fileURLToPath(new URL('../_stubs/empty-module.mjs', import.meta.url))

const vite = await createServer({
  root: chatRoot,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: {
    middlewareMode: true,
  },
  resolve: {
    alias: {
      '@': resolve(chatRoot, 'src'),
      '@opentiny/tiny-robot': tinyRobotStubPath,
      'markstream-vue/index.css': emptyModuleStubPath,
      'markstream-vue': markstreamStubPath,
    },
  },
  plugins: [vue()],
})

try {
  const [{ default: TrChatRoot }, { default: TrChatPage }] = await Promise.all([
    vite.ssrLoadModule('/src/root/TrChatRoot.vue'),
    vite.ssrLoadModule('/src/page/TrChatPage.vue'),
  ])

  async function renderMountedRootPage() {
    const { runtime, ui } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      conversation: {
        initialMessages: [{ role: 'user', content: 'phase-1b mounted page proof' }],
      },
      history: {
        enabled: true,
        defaultOpen: true,
      },
      workspace: {
        enabled: true,
        defaultView: 'workspace',
        right: {
          enabled: true,
          defaultOpen: false,
          collapseMode: 'rail',
        },
      },
      ui: {
        brand: {
          title: 'SSR Root Page',
        },
      },
    })

    const app = createSSRApp({
      render: () => h(TrChatRoot, { runtime, ui }, { default: () => h(TrChatPage) }),
    })

    return renderToString(app)
  }

  await runTest('TrChat.Root + TrChat.Page mounted proof renders the Phase 1B workspace baseline', async () => {
    const html = await renderMountedRootPage()

    assert.equal(html.includes('SSR Root Page'), true)
    assert.equal(html.includes('phase-1b mounted page proof'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrHistory"'), true)
    assert.equal(html.includes('data-history-id='), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })
} finally {
  await vite.close()
}
