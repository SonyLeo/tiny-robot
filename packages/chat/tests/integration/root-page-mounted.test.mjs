import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { assert, createRuntimeFromConfig, createStreamingProvider, runTest, resolveTestDir } from '../_helpers.mjs'

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
    { default: ChatProvider },
    { default: ChatLayout },
    { default: ChatWorkspaceLayout },
    { default: ChatDefaultHeaderRegion },
    { default: ChatDefaultFooterRegion },
    { default: ChatHeader },
    { default: ChatWelcome },
    { default: ChatMessageList },
    { default: ChatFeedback },
    { default: ChatFooter },
    { default: ChatSender },
    { default: ChatAttachments },
    { useMcpManager },
    { CHAT_KIT_KEY, CHAT_RUNTIME_KEY, CHAT_UI_KEY, MCP_MANAGER_KEY, createChatUiContext },
  ] =
    await Promise.all([
      vite.ssrLoadModule('/src/entry/TrChatRoot.vue'),
      vite.ssrLoadModule('/src/entry/TrChatPage.vue'),
      vite.ssrLoadModule('/src/entry/TrChatProvider.vue'),
      vite.ssrLoadModule('/src/components/ChatLayout.vue'),
      vite.ssrLoadModule('/src/components/workspace/ChatWorkspaceLayout.vue'),
      vite.ssrLoadModule('/src/components/page-regions/ChatDefaultHeaderRegion.vue'),
      vite.ssrLoadModule('/src/components/page-regions/ChatDefaultFooterRegion.vue'),
      vite.ssrLoadModule('/src/components/ChatHeader.vue'),
      vite.ssrLoadModule('/src/components/ChatWelcome.vue'),
      vite.ssrLoadModule('/src/components/ChatMessageList.vue'),
      vite.ssrLoadModule('/src/components/feedback/ChatFeedback.vue'),
      vite.ssrLoadModule('/src/components/ChatFooter.vue'),
      vite.ssrLoadModule('/src/components/ChatSender.vue'),
      vite.ssrLoadModule('/src/components/attachments/ChatAttachments.vue'),
      vite.ssrLoadModule('/src/components/mcp/useMcpManager.ts'),
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
      messages: {
        feedback: {
          enabled: true,
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

  async function renderMountedRootPageWelcomeState() {
    const welcomePrompts = [
      { label: 'Mounted root page prompt', description: 'Mounted root page prompt' },
      { label: 'Mounted root page follow-up', description: 'Mounted root page follow-up' },
    ]

    const { runtime, ui } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      ui: {
        brand: {
          title: 'SSR Root Page Welcome',
        },
        welcome: {
          title: 'SSR Root Page Welcome',
          description: 'Mounted root page should keep official welcome prompts on the default page path.',
          prompts: welcomePrompts,
        },
      },
    })

    const app = createSSRApp({
      render: () => h(TrChatRoot, { runtime, ui }, { default: () => h(TrChatPage) }),
    })

    return renderToString(app)
  }

  async function renderMountedRootPrimitives({ initialMessages }) {
    const brandTitle = 'Root + primitives'
    const welcomeTitle = 'Official Root + primitives entry'
    const welcomeDescription = 'Compose the public building blocks directly when you want to own page structure yourself.'
    const welcomePrompts = [{ label: 'Use granular prompt', description: 'Use granular prompt' }]

    const { runtime, ui } = createRuntimeFromConfig({
      request: {
        models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
        transport: {
          type: 'openai-compatible',
          endpoint: '/api/chat/completions',
        },
      },
      conversation: initialMessages
        ? {
            initialMessages,
          }
        : undefined,
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
      attachments: {
        enabled: true,
        upload: {
          enabled: true,
          accept: '.txt',
          tooltip: 'Granular runtime upload',
          multiple: false,
        },
        list: {
          wrap: true,
        },
      },
      sender: {
        placeholder: 'Granular sender placeholder',
        mode: 'multiple',
        maxLength: 400,
        wordCount: true,
      },
      ui: {
        brand: {
          title: brandTitle,
        },
        welcome: {
          title: welcomeTitle,
          description: welcomeDescription,
          prompts: welcomePrompts,
        },
        contentLayout: 'wide',
      },
    })

    if (runtime.attachments && initialMessages?.length) {
      const file = new File(['granular mounted attachment'], 'granular-proof.txt', { type: 'text/plain' })
      const prepared = runtime.attachments.prepareFiles([file])
      runtime.sender.addPendingAttachments(prepared)
    }

    const hasMessages = runtime.conversation.messages.value.length > 0

    const app = createSSRApp({
      render: () =>
        h(TrChatRoot, { runtime, ui }, {
          default: () =>
            h(
              ChatWorkspaceLayout,
              {
                appearance: ui.appearance,
                sidebarTitle: ui.brand?.title,
              },
              {
                right: () =>
                  h('aside', { 'data-testid': 'granular-right-panel' }, [
                    h('p', { 'data-testid': 'granular-right-eyebrow' }, 'Public composition'),
                    h('h3', { 'data-testid': 'granular-right-title' }, 'Root + primitives'),
                  ]),
                default: () =>
                  h(
                    ChatLayout,
                    null,
                    {
                      default: () => [
                        h(
                          ChatHeader,
                          {
                            showHistory: true,
                          },
                          {
                            extra: () => h('div', { 'data-testid': 'granular-header-extra' }, 'granular header extra'),
                          },
                        ),
                        hasMessages
                          ? h(ChatMessageList, {
                              variant: 'workspace',
                              bubbleListProps: {
                                dividerRole: 'assistant',
                                contentRenderMode: 'split',
                              },
                            })
                          : h(ChatWelcome, {
                            }),
                        h(ChatFooter, null, {
                          default: () => [
                            h(ChatAttachments),
                            h(ChatSender, {
                              senderProps: {
                                size: 'small',
                                submitType: 'ctrlEnter',
                                autofocus: true,
                              },
                            }),
                          ],
                        }),
                      ],
                    },
                  ),
              },
            ),
        }),
    })

    return renderToString(app)
  }

  async function renderOwnerLinkedHeaderAndFooterTools() {
    const { runtime } = createRuntimeFromConfig({
      request: {
        models: [
          { id: 'gpt-4.1-mini', providerId: 'openai' },
          { id: 'claude-3-7-sonnet', providerId: 'anthropic' },
        ],
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
        right: {
          enabled: true,
          defaultOpen: false,
          collapseMode: 'rail',
        },
      },
      sender: {
        placeholder: 'Owner linked footer sender',
      },
    })

    runtime.workspace.isMobile.value = true
    runtime.workspace.left.visible.value = false
    runtime.workspace.left.collapsed.value = false
    runtime.workspace.right.visible.value = false
    runtime.workspace.right.collapsed.value = true

    const chatUi = createChatUiContext({ workspaceRuntime: runtime.workspace })
    const mcpManager = useMcpManager({
      initialPlugins: [
        {
          id: 'owner-linked-plugin',
          name: 'Owner Linked Plugin',
          enabled: true,
          tools: [],
        },
      ],
    })

    const app = createSSRApp({
      render: () =>
        h('div', [
          h(ChatDefaultHeaderRegion, {
            headerInput: {
              title: 'Owner linked header',
              showHistory: true,
              showClose: false,
            },
            shell: {
              variant: 'workspace',
              rightRegion: {
                enabled: true,
              },
            },
          }),
          h(ChatDefaultFooterRegion, {
            showFooterTools: true,
            showModelSelector: true,
            showMcpTrigger: true,
            modelSelectorInput: {
              enabled: true,
              models: [
                { value: 'gpt-4.1-mini', label: 'GPT 4.1 Mini', providerId: 'openai' },
                { value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet', providerId: 'anthropic' },
              ],
              defaultModel: 'gpt-4.1-mini',
            },
            onChangeModel() {},
          }),
        ]),
    })

    app.provide(CHAT_RUNTIME_KEY, runtime)
    app.provide(CHAT_UI_KEY, chatUi)
    app.provide(MCP_MANAGER_KEY, mcpManager)
    app.provide(CHAT_KIT_KEY, {
      activeConversationId: ref(null),
      activeConversation: ref(null),
      status: ref('ready'),
      lastError: ref(null),
      sendMessage() {},
      abort() {},
      retry() {},
      createConversation() {
        return { id: 'new-conversation' }
      },
    })

    return renderToString(app)
  }

  async function renderMountedProviderLeafComposition() {
    const app = createSSRApp({
      render: () =>
        h(
          ChatProvider,
          {
            responseProvider: createStreamingProvider(),
            initialMessages: [{ role: 'assistant', content: 'provider mounted message' }],
          },
          {
            default: () =>
              h(
                ChatLayout,
                {
                  appearance: {
                    mode: 'light',
                  },
                },
                {
                  default: () => [
                    h(
                      ChatHeader,
                      {
                        title: 'Provider mounted title',
                        showHistory: true,
                      },
                      {
                        title: () =>
                          h('span', { 'data-testid': 'provider-mounted-title-slot' }, 'Provider mounted title slot'),
                        extra: () =>
                          h('span', { 'data-testid': 'provider-mounted-extra-slot' }, 'Provider mounted extra slot'),
                      },
                    ),
                    h(
                      ChatMessageList,
                      null,
                      {
                        after: (slotProps) => h(ChatFeedback, slotProps),
                      },
                    ),
                    h(ChatFooter, null, {
                      default: () =>
                        h(ChatSender, {
                          placeholder: 'Provider mounted sender...',
                        }),
                    }),
                  ],
                },
              ),
          },
        ),
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
    assert.equal(html.includes('placeholder="Ask the mounted root page"'), true)
    assert.equal(html.includes('data-mode="single"'), true)
    assert.equal(html.includes('data-max-length="512"'), true)
    assert.equal(html.includes('data-show-word-limit="true"'), true)
    assert.equal(html.includes('data-testid="chat-sender-action-voice"'), true)
    assert.equal(html.includes('data-testid="chat-feedback"'), true)
  })

  await runTest('TrChat.Root + TrChat.Page mounted proof keeps ui.welcome.prompts on the default page path', async () => {
    const html = await renderMountedRootPageWelcomeState()

    assert.equal(html.includes('SSR Root Page Welcome'), true)
    assert.equal(html.includes('Mounted root page prompt'), true)
    assert.equal(html.includes('Mounted root page follow-up'), true)
  })

  await runTest('ChatLayout mounted proof can fall back to runtime-owned renderer config without page-input or scaffold relay', async () => {
    const html = await renderRuntimeBackedLayout()

    assert.equal(html.includes('renderer-runtime-proof'), true)
    assert.equal(html.includes('data-content-renderer-count="5"'), true)
    assert.equal(html.includes('data-box-renderer-count="4"'), true)
  })

  await runTest('TrChat.Root + primitives mounted proof renders the official welcome-state composition without page relay', async () => {
    const html = await renderMountedRootPrimitives({ initialMessages: [] })

    assert.equal(html.includes('Root + primitives'), true)
    assert.equal(html.includes('Official Root + primitives entry'), true)
    assert.equal(html.includes('Use granular prompt'), true)
    assert.equal(html.includes('data-testid="granular-header-extra"'), true)
    assert.equal(html.includes('data-testid="granular-right-panel"'), true)
    assert.equal(html.includes('data-stub="TrHistory"'), true)
    assert.equal(html.includes('placeholder="Granular sender placeholder"'), true)
    assert.equal(html.includes('data-mode="multiple"'), true)
    assert.equal(html.includes('data-size="small"'), true)
    assert.equal(html.includes('data-submit-type="ctrlEnter"'), true)
    assert.equal(html.includes('data-autofocus="true"'), true)
    assert.equal(html.includes('data-show-word-limit="true"'), true)
    assert.equal(html.includes('data-chat-content-layout="wide"'), true)
  })

  await runTest('TrChat.Root + primitives mounted proof renders the official message-state composition with history, attachments, and sender defaults', async () => {
    const html = await renderMountedRootPrimitives({
      initialMessages: [{ role: 'assistant', content: 'granular owner-path message' }],
    })

    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('granular owner-path message'), true)
    assert.equal(html.includes('Official Root + primitives entry'), false)
    assert.equal(html.includes('data-testid="chat-attachments-area"'), true)
    assert.equal(html.includes('granular-proof.txt'), true)
    assert.equal(html.includes('data-divider-role="assistant"'), true)
    assert.equal(html.includes('data-content-render-mode="split"'), true)
    assert.equal(html.includes('data-stub="TrSender"'), true)
    assert.equal(html.includes('data-count="1"'), true)
    assert.equal(html.includes('data-history-id='), true)
    assert.equal(html.includes('data-chat-content-layout="wide"'), true)
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

  await runTest('default owner header and footer tools mounted proof keep history, model, workspace, and MCP affordances on explicit inputs', async () => {
    const html = await renderOwnerLinkedHeaderAndFooterTools()

    assert.equal(html.includes('aria-label="打开历史"'), true)
    assert.equal(html.includes('aria-label="切换工作区面板"'), true)
    assert.equal(html.includes('data-testid="chat-mcp-trigger"'), true)
    assert.equal(html.includes('data-testid="chat-mcp-trigger-count"'), true)
    assert.equal(html.includes('aria-label="选择模型"'), true)
    assert.equal(html.includes('title="gpt-4.1-mini"'), true)
  })
  await runTest('TrChat.Provider mounted proof keeps the retained responseProvider leaf-composition contract near the owner surface', async () => {
    const html = await renderMountedProviderLeafComposition()

    assert.equal(html.includes('Provider mounted title slot'), true)
    assert.equal(html.includes('Provider mounted extra slot'), true)
    assert.equal(html.includes('data-testid="stub-bubble-list"'), true)
    assert.equal(html.includes('placeholder="Provider mounted sender..."'), true)
  })
} finally {
  await vite.close()
}
