import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { runTest } from '../_harness.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createRuntimeFromConfig } = await jiti.import('../../src/runtime/config/createRuntimeFromConfig.ts')
const { createLegacyRootBridge } = await jiti.import('../../src/legacy/rootBridge.ts')
const { computed } = await jiti.import('vue')

await runTest('createRuntimeFromConfig returns a Phase 1A Root baseline with runtime and ui outputs', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'hello root runtime' }],
    },
    ui: {
      brand: { title: 'Root Baseline' },
      welcome: { title: 'Hello' },
      contentLayout: 'wide',
    },
    sender: {
      placeholder: 'Ask anything',
      mode: 'multiple',
      maxLength: 4000,
      wordCount: true,
    },
    attachments: {
      enabled: true,
      upload: {
        enabled: true,
        multiple: true,
      },
      list: {
        wrap: true,
      },
    },
    messages: {
      actions: [{ id: 'copy-custom', label: 'Copy custom' }],
      actionMode: 'append',
      feedback: {
        enabled: true,
      },
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(typeof runtime.conversation.send, 'function')
  assert.equal(typeof runtime.conversation.abort, 'function')
  assert.equal(typeof runtime.sender?.send, 'function')
  assert.equal(typeof runtime.message?.getViewState, 'function')
  assert.equal(typeof runtime.attachments?.prepareFiles, 'function')

  assert.equal(Array.isArray(runtime.conversation.messages.value), true)
  assert.equal(runtime.sender?.defaults?.placeholder, 'Ask anything')
  assert.equal(runtime.sender?.defaults?.mode, 'multiple')
  assert.equal(runtime.attachments?.enabled.value, true)
  assert.equal(runtime.attachments?.uploadConfig?.value?.multiple, true)
  assert.equal(runtime.message?.config?.feedback?.enabled, true)
  assert.equal(ui.brand?.title, 'Root Baseline')
  assert.equal(ui.contentLayout, 'wide')
})

await runTest('createRuntimeFromConfig eagerly materializes the initialMessages baseline before the first send', async () => {
  const seedMessages = [{ role: 'system', content: 'seed-visible-baseline' }]
  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: seedMessages,
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(Boolean(runtime.__legacyPhase1ABridge?.chatKit?.activeConversationId.value), true)
  assert.equal(runtime.conversation.messages.value.length, 1)
  assert.equal(runtime.conversation.messages.value[0]?.parts[0]?.text, 'seed-visible-baseline')
})

await runTest('Root legacy bridge keeps attachments area bound to sender pending attachments', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
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
      },
    },
  })

  const bridge = createLegacyRootBridge(
    computed(() => runtime),
    computed(() => ui),
  )
  const file = new File(['hello'], 'phase-1a.txt', { type: 'text/plain' })

  bridge.attachmentsManager.value?.addFiles([file])

  assert.equal(runtime.sender?.pendingAttachments.value.length, 1)
  assert.equal(bridge.attachmentsManager.value?.items, runtime.sender?.pendingAttachments)
  assert.equal(runtime.sender?.pendingAttachments.value[0]?.name, 'phase-1a.txt')
})

await runTest('Phase 1B root baseline exposes history models workspace runtime and page bridge slices', async () => {
  const { runtime, ui } = createRuntimeFromConfig({
    request: {
      models: [
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', providerId: 'openai' },
        { id: 'claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', providerId: 'anthropic' },
      ],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    conversation: {
      initialMessages: [{ role: 'user', content: 'phase-1b shell baseline' }],
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
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  const bridge = createLegacyRootBridge(
    computed(() => runtime),
    computed(() => ui),
  )

  assert.equal(runtime.history?.conversations.value.length, 1)
  assert.equal(runtime.models?.models.value.length, 2)
  assert.equal(runtime.models?.currentModelId.value, 'gpt-4.1-mini')
  assert.equal(runtime.workspace?.variant.value, 'workspace')
  assert.equal(runtime.workspace?.enabled.value, true)
  assert.equal(bridge.shell.value?.variant, 'workspace')
  assert.equal(bridge.scaffoldContext.presetSlices.value.history.enabled, true)
  assert.equal(bridge.scaffoldContext.presetSlices.value.modelSelector.enabled, true)
  assert.equal(bridge.scaffoldContext.models.value.length, 2)

  bridge.scaffoldContext.updateModel(bridge.scaffoldContext.models.value[1])

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(runtime.models?.currentModelId.value, 'claude-3.7-sonnet')
  assert.equal(bridge.scaffoldContext.currentModel.value, 'claude-3.7-sonnet')
  assert.equal(bridge.chatKit.value.conversations.value.length, 1)
  assert.equal(bridge.chatKit.value.activeConversationId.value, runtime.history?.activeConversationId.value ?? null)
})
