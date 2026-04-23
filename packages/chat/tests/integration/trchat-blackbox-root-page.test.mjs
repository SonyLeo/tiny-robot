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

  async function renderBlackboxTrChat(config) {
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

  await runTest('TrChat blackbox default path uses Root + Page when given target TrChatConfig input', async () => {
    const html = await renderBlackboxTrChat(createTargetConfig('Blackbox Root Page', 'phase-2 blackbox baseline'))

    assert.equal(html.includes('Blackbox Root Page'), true)
    assert.equal(html.includes('phase-2 blackbox baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for serialized target TrChatConfig input', async () => {
    const html = await renderBlackboxTrChat(
      JSON.stringify(createTargetConfig('Serialized Blackbox Root Page', 'phase-2 serialized blackbox baseline')),
    )

    assert.equal(html.includes('Serialized Blackbox Root Page'), true)
    assert.equal(html.includes('phase-2 serialized blackbox baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox now throws for old ChatConfig objects instead of routing them through scaffold fallback', async () => {
    await expectThrowsAsync(
      () =>
        renderBlackboxTrChat({
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
      /\[TrChat\] The blackbox entry now accepts only target TrChatConfig/,
    )
  })

  await runTest('TrChat blackbox now throws for non-target serialized config instead of falling back to scaffold', async () => {
    await expectThrowsAsync(
      () => renderBlackboxTrChat('{"legacy":true}'),
      /\[TrChat\] The blackbox entry now accepts only target TrChatConfig/,
    )
  })
} finally {
  await vite.close()
}
