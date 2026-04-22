import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { assert, runTest, resolveTestDir } from '../_helpers.mjs'

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
  const [{ default: TrChat }] = await Promise.all([vite.ssrLoadModule('/src/components/core/Chat.vue')])

  async function renderBlackboxTrChat(callbacks) {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            request: {
              models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
              defaultModelId: 'gpt-4.1-mini',
              transport: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            conversation: {
              initialMessages: [{ role: 'user', content: 'phase-2 blackbox baseline' }],
            },
            history: {
              enabled: true,
              defaultOpen: true,
            },
            workspace: {
              enabled: true,
              defaultView: 'workspace',
            },
            ui: {
              brand: {
                title: 'Blackbox Root Page',
              },
            },
          },
          callbacks,
        }),
    })

    return renderToString(app)
  }

  await runTest('TrChat blackbox default path uses Root + Page when given target TrChatConfig input', async () => {
    const html = await renderBlackboxTrChat()

    assert.equal(html.includes('Blackbox Root Page'), true)
    assert.equal(html.includes('phase-2 blackbox baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for target TrChatConfig plus lifecycle-compatible callbacks', async () => {
    const html = await renderBlackboxTrChat({
      onFinish: () => undefined,
      onError: () => undefined,
    })

    assert.equal(html.includes('Blackbox Root Page'), true)
    assert.equal(html.includes('phase-2 blackbox baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })
} finally {
  await vite.close()
}
