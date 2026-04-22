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
const chatScaffoldStubPath = fileURLToPath(new URL('../_stubs/chat-scaffold.mjs', import.meta.url))

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
        find: /ChatScaffold\.vue$/,
        replacement: chatScaffoldStubPath,
      },
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

  await runTest('TrChat blackbox keeps Root + Page active for serialized target TrChatConfig input', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: JSON.stringify({
            request: {
              models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
              defaultModelId: 'gpt-4.1-mini',
              transport: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            conversation: {
              initialMessages: [{ role: 'user', content: 'phase-2 serialized blackbox baseline' }],
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
                title: 'Serialized Blackbox Root Page',
              },
            },
          }),
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('Serialized Blackbox Root Page'), true)
    assert.equal(html.includes('phase-2 serialized blackbox baseline'), true)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for the promoted old ChatConfig request subset', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
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
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), false)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for the promoted old ChatConfig display-default subset', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
              systemPrompt: 'legacy-display-subset-system',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Display Brand',
              },
              welcome: {
                title: 'Legacy Display Welcome',
                description: 'legacy display description',
              },
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), false)
    assert.equal(html.includes('Legacy Display Brand'), true)
    assert.equal(html.includes('Legacy Display Welcome'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for the promoted old ChatConfig content-layout subset', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
              systemPrompt: 'legacy-content-layout-system',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Content Layout Brand',
              },
            },
            layout: {
              contentLayout: 'wide',
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), false)
    assert.equal(html.includes('data-chat-content-layout="wide"'), true)
    assert.equal(html.includes('Legacy Content Layout Brand'), true)
  })

  await runTest('TrChat blackbox keeps Root + Page active for the promoted old ChatConfig shell subset', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
              systemPrompt: 'legacy-shell-subset-system',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Shell Brand',
              },
            },
            layout: {
              contentLayout: 'wide',
            },
            shell: {
              variant: 'workspace',
              leftRegion: {
                defaultOpen: false,
                collapseMode: 'rail',
                railLabel: 'Legacy History',
              },
              rightRegion: {
                enabled: true,
                defaultOpen: true,
                collapseMode: 'hidden',
                railLabel: 'Legacy Preview',
              },
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), false)
    assert.equal(html.includes('tr-chat-workspace-layout'), true)
    assert.equal(html.includes('data-chat-content-layout="wide"'), true)
    assert.equal(html.includes('Legacy Shell Brand'), true)
  })

  await runTest('TrChat blackbox keeps old ChatConfig shell.viewState on the scaffold fallback path', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
              systemPrompt: 'legacy-shell-view-state-system',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Shell ViewState Brand',
              },
            },
            layout: {
              contentLayout: 'wide',
            },
            shell: {
              variant: 'workspace',
              leftRegion: {
                defaultOpen: false,
                collapseMode: 'rail',
                railLabel: 'Legacy History',
              },
              viewState: {
                fullWidth: true,
              },
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), true)
  })

  await runTest('TrChat blackbox keeps old ChatConfig ui.prompts on the scaffold fallback path', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Prompt Brand',
              },
              welcome: {
                title: 'Legacy Prompt Welcome',
              },
              prompts: [{ label: 'legacy prompt', value: 'legacy prompt value' }],
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), true)
  })

  await runTest('TrChat blackbox keeps old ChatConfig layout.variant on the scaffold fallback path', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Variant Brand',
              },
            },
            layout: {
              variant: 'workspace',
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), true)
  })

  await runTest('TrChat blackbox keeps old ChatConfig layout.placements on the scaffold fallback path', async () => {
    const app = createSSRApp({
      render: () =>
        h(TrChat, {
          config: {
            models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
            providers: {
              openai: {
                type: 'openai-compatible',
                endpoint: '/api/chat/completions',
              },
            },
            defaults: {
              model: 'gpt-4.1-mini',
            },
            appearance: {
              mode: 'dark',
            },
            ui: {
              brand: {
                title: 'Legacy Placements Brand',
              },
            },
            layout: {
              placements: {
                assistant: 'start',
                user: 'end',
              },
            },
          },
        }),
    })

    const html = await renderToString(app)

    assert.equal(html.includes('data-stub="ChatScaffoldFallback"'), true)
  })
} finally {
  await vite.close()
}
