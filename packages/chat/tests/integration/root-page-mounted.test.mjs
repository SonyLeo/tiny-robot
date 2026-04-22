import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h, ref } from 'vue'
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
  const [
    { default: TrChatRoot },
    { default: TrChatPage },
    { default: ChatLayout },
    { default: ChatWorkspaceLayout },
    { default: ChatSender },
    { default: ChatAttachments },
    { CHAT_KIT_KEY, CHAT_RUNTIME_KEY, CHAT_UI_KEY, createChatUiContext },
  ] =
    await Promise.all([
      vite.ssrLoadModule('/src/root/TrChatRoot.vue'),
      vite.ssrLoadModule('/src/page/TrChatPage.vue'),
      vite.ssrLoadModule('/src/components/core/ChatLayout.vue'),
      vite.ssrLoadModule('/src/components/workspace/ChatWorkspaceLayout.vue'),
      vite.ssrLoadModule('/src/components/core/ChatSender.vue'),
      vite.ssrLoadModule('/src/components/attachments/ChatAttachments.vue'),
      vite.ssrLoadModule('/src/shared/context/index.ts'),
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
      sender: {
        placeholder: 'Ask the mounted root page',
        mode: 'single',
        maxLength: 512,
        wordCount: true,
        voice: {
          enabled: true,
          tooltip: 'Mounted root page voice',
          autoInsert: false,
        },
      },
    })

    const app = createSSRApp({
      render: () => h(TrChatRoot, { runtime, ui }, { default: () => h(TrChatPage) }),
    })

    return renderToString(app)
  }

  async function renderRuntimeBackedLayout() {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      messages: {
        renderers: {
          contentMatches: [{ find: () => false, renderer: { name: 'RuntimeLayoutContentRenderer' } }],
          boxMatches: [{ find: () => false, renderer: { name: 'RuntimeLayoutBoxRenderer' } }],
        },
      },
    })

    const app = createSSRApp({
      render: () => h(ChatLayout, null, { default: () => 'renderer-runtime-proof' }),
    })
    app.provide(CHAT_RUNTIME_KEY, runtime)

    return renderToString(app)
  }

  async function renderRuntimeBackedSenderAndAttachments() {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      attachments: {
        enabled: true,
        upload: {
          enabled: true,
          accept: '.md',
          tooltip: 'Runtime upload',
          multiple: false,
        },
        list: {
          wrap: true,
        },
      },
      sender: {
        placeholder: 'Runtime sender attachments',
      },
    })

    const file = new File(['runtime-backed sender attachment'], 'phase-3a-mounted.md', { type: 'text/markdown' })
    const prepared = runtime.attachments?.prepareFiles([file]) ?? []
    runtime.sender.addPendingAttachments(prepared)

    const app = createSSRApp({
      render: () => h('div', [h(ChatAttachments), h(ChatSender)]),
    })

    app.provide(CHAT_RUNTIME_KEY, runtime)
    app.provide(CHAT_KIT_KEY, {
      status: ref('ready'),
      sendMessage() {},
      abort() {},
      lastError: ref(null),
      retry() {},
    })

    return renderToString(app)
  }

  async function renderRuntimeBackedWorkspaceMobileFallback() {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      history: {
        enabled: true,
        defaultOpen: true,
      },
      workspace: {
        enabled: true,
        defaultView: 'workspace',
        left: {
          enabled: true,
          defaultOpen: true,
          collapseMode: 'rail',
          railLabel: 'History',
          width: 'md',
        },
        right: {
          enabled: true,
          defaultOpen: true,
          collapseMode: 'hidden',
          width: 'lg',
        },
      },
    })

    runtime.workspace.isMobile.value = true
    runtime.workspace.left.visible.value = true
    runtime.workspace.left.collapsed.value = false
    runtime.workspace.right.visible.value = true
    runtime.workspace.right.collapsed.value = false

    const chatUi = createChatUiContext({ workspaceRuntime: runtime.workspace })

    const app = createSSRApp({
      render: () =>
        h(
          ChatWorkspaceLayout,
          {
            appearance: {
              mode: 'light',
            },
            sidebarTitle: 'Runtime mobile shell',
          },
          {
            left: () => h('div', { 'data-testid': 'workspace-left-fallback' }, 'runtime left fallback'),
            right: () => h('div', { 'data-testid': 'workspace-right-fallback' }, 'runtime right fallback'),
          },
        ),
    })

    app.provide(CHAT_RUNTIME_KEY, runtime)
    app.provide(CHAT_UI_KEY, chatUi)

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
    assert.equal(html.includes('placeholder="Ask the mounted root page"'), true)
    assert.equal(html.includes('data-mode="single"'), true)
    assert.equal(html.includes('data-max-length="512"'), true)
    assert.equal(html.includes('data-show-word-limit="true"'), true)
    assert.equal(html.includes('data-testid="chat-sender-action-voice"'), true)
  })

  await runTest('ChatLayout mounted proof can fall back to runtime-owned renderer config without page-input or scaffold relay', async () => {
    const html = await renderRuntimeBackedLayout()

    assert.equal(html.includes('renderer-runtime-proof'), true)
    assert.equal(html.includes('data-content-renderer-count="5"'), true)
    assert.equal(html.includes('data-box-renderer-count="4"'), true)
  })

  await runTest('ChatSender and ChatAttachments mounted proof can fall back to runtime-owned attachment config without feature context', async () => {
    const html = await renderRuntimeBackedSenderAndAttachments()

    assert.equal(html.includes('data-testid="chat-attachments-area"'), true)
    assert.equal(html.includes('data-stub="TrAttachments"'), true)
    assert.equal(html.includes('data-count="1"'), true)
    assert.equal(html.includes('phase-3a-mounted.md'), true)
    assert.equal(html.includes('data-testid="chat-attachments-upload"'), true)
    assert.equal(html.includes('tooltip="Runtime upload"'), true)
    assert.equal(html.includes('placeholder="Runtime sender attachments"'), true)
  })

  await runTest('ChatWorkspaceLayout mounted proof can fall back to runtime-owned shell state for mobile-left and mobile-right sheets', async () => {
    const html = await renderRuntimeBackedWorkspaceMobileFallback()

    assert.equal(html.includes('runtime left fallback'), true)
    assert.equal(html.includes('runtime right fallback'), true)
    assert.equal(html.includes('tr-chat-drawer is-open'), true)
    assert.equal(html.includes('tr-chat-workspace-right-sheet is-open'), true)
  })
} finally {
  await vite.close()
}
