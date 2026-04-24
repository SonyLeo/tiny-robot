import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { assert, expectThrowsAsync, runTest, resolveTestDir } from '../_helpers.mjs'

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
    alias: [
      {
        find: '@',
        replacement: resolve(chatRoot, 'src'),
      },
      {
        find: '@opentiny/tiny-robot',
        replacement: tinyRobotStubPath,
      },
      {
        find: 'markstream-vue/index.css',
        replacement: emptyModuleStubPath,
      },
      {
        find: 'markstream-vue',
        replacement: markstreamStubPath,
      },
    ],
  },
  plugins: [vue()],
})

try {
  const [{ default: TrChat }] = await Promise.all([vite.ssrLoadModule('/src/components/core/Chat.vue')])

  async function renderTrChatEntry(config) {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config,
        }),
    })

    return renderToString(app)
  }

  function createTargetConfig(title, content) {
    return {
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        defaultModelId: 'gpt-4.1-mini',
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      conversation: {
        initialMessages: [{ role: 'user', content }],
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
          title,
        },
      },
    }
  }

  await runTest('TrChat config entry uses Root + Page when given target TrChatConfig input', async () => {
    const html = await renderTrChatEntry(createTargetConfig('TrChat Root Page', 'phase-2 trchat baseline'))

    assert.equal(html.includes('TrChat Root Page'), true)
    assert.equal(html.includes('phase-2 trchat baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat config entry keeps Root + Page active for serialized target TrChatConfig input', async () => {
    const html = await renderTrChatEntry(
      JSON.stringify(createTargetConfig('Serialized TrChat Root Page', 'phase-2 serialized trchat baseline')),
    )

    assert.equal(html.includes('Serialized TrChat Root Page'), true)
    assert.equal(html.includes('phase-2 serialized trchat baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat config entry now throws for old ChatConfig objects instead of routing them through scaffold fallback', async () => {
    await expectThrowsAsync(
      () =>
        renderTrChatEntry({
          models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
          providers: {
            openai: {
              type: 'openai-compatible',
              endpoint: '/api/chat/completions',
            },
          },
          defaults: {
            model: 'gpt-4.1-mini',
            systemPrompt: 'legacy-request-subset-system',
          },
        }),
      /\[TrChat\] The TrChat config entry accepts only target TrChatConfig/,
    )
  })

  await runTest('TrChat config entry now throws for non-target serialized config instead of falling back to scaffold', async () => {
    await expectThrowsAsync(
      () => renderTrChatEntry('{"legacy":true}'),
      /\[TrChat\] The TrChat config entry accepts only target TrChatConfig/,
    )
  })
} finally {
  await vite.close()
}
