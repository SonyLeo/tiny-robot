import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { resolveRootPageBlackboxConfig } = await jiti.import('@/runtime/config/blackboxEntry.ts')

function createTargetConfig() {
  return {
    request: {
      models: [{ id: 'gpt-4.1-mini', providerId: 'openai' }],
      defaultModelId: 'gpt-4.1-mini',
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
  }
}

function createLegacyRequestSubset() {
  return {
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    defaults: {
      model: 'gpt-4.1-mini',
      systemPrompt: 'legacy-default-system',
    },
  }
}

function createLegacyDisplaySubset() {
  return {
    ...createLegacyRequestSubset(),
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
  }
}

function createLegacyContentLayoutSubset() {
  return {
    ...createLegacyDisplaySubset(),
    layout: {
      contentLayout: 'wide',
    },
  }
}

function createLegacyShellSubset() {
  return {
    ...createLegacyContentLayoutSubset(),
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
  }
}

function createLegacyShellViewStateSubset() {
  return {
    ...createLegacyShellSubset(),
    shell: {
      ...createLegacyShellSubset().shell,
      viewState: {
        fullWidth: true,
      },
    },
  }
}

function createLegacyPromptsSubset() {
  return {
    ...createLegacyDisplaySubset(),
    ui: {
      ...createLegacyDisplaySubset().ui,
      prompts: [{ label: 'legacy prompt', value: 'legacy prompt value' }],
    },
  }
}

function createLegacyLayoutVariantSubset() {
  return {
    ...createLegacyContentLayoutSubset(),
    layout: {
      variant: 'workspace',
    },
  }
}

function createLegacyLayoutPlacementsSubset() {
  return {
    ...createLegacyContentLayoutSubset(),
    layout: {
      placements: {
        assistant: 'start',
        user: 'end',
      },
    },
  }
}

await runTest('resolveRootPageBlackboxConfig keeps lifecycle-compatible callbacks on the Root + Page path', async () => {
  const onFinish = () => undefined
  const onError = () => undefined

  const resolved = resolveRootPageBlackboxConfig({
    config: createTargetConfig(),
    callbacks: {
      onFinish,
      onError,
    },
  })

  assert.notEqual(resolved, null)
  assert.equal(typeof resolved?.lifecycle?.afterReceive, 'function')
  assert.equal(typeof resolved?.lifecycle?.error, 'function')
})

await runTest('resolveRootPageBlackboxConfig accepts a serialized target TrChatConfig without reopening legacy config projection', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: JSON.stringify(createTargetConfig()),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.request.models[0]?.id, 'gpt-4.1-mini')
  assert.equal(resolved?.request.transport.endpoint, '/api/chat/completions')
})

await runTest('resolveRootPageBlackboxConfig promotes the smallest old ChatConfig request subset into the Root + Page path', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: createLegacyRequestSubset(),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.request.models[0]?.id, 'gpt-4.1-mini')
  assert.equal(resolved?.request.defaultModelId, 'gpt-4.1-mini')
  assert.equal(resolved?.request.systemPrompt, 'legacy-default-system')
  assert.equal(resolved?.request.transport.endpoint, '/api/chat/completions')
})

await runTest('resolveRootPageBlackboxConfig promotes a serialized old ChatConfig request subset only when it stays inside the request boundary', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: JSON.stringify(createLegacyRequestSubset()),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.request.models[0]?.providerId, 'openai')
  assert.equal(resolved?.request.transport.endpoint, '/api/chat/completions')
})

await runTest('resolveRootPageBlackboxConfig promotes the narrow old ChatConfig display-default subset into the Root + Page path', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: createLegacyDisplaySubset(),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.request.models[0]?.id, 'gpt-4.1-mini')
  assert.equal(resolved?.ui?.brand?.title, 'Legacy Display Brand')
  assert.equal(resolved?.ui?.welcome?.title, 'Legacy Display Welcome')
  assert.equal(resolved?.ui?.appearance?.mode, 'dark')
})

await runTest('resolveRootPageBlackboxConfig promotes a serialized old ChatConfig display-default subset only when it stays inside request plus display defaults', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: JSON.stringify(createLegacyDisplaySubset()),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.ui?.brand?.title, 'Legacy Display Brand')
  assert.equal(resolved?.ui?.welcome?.description, 'legacy display description')
  assert.equal(resolved?.ui?.appearance?.mode, 'dark')
})

await runTest('resolveRootPageBlackboxConfig promotes the narrow old ChatConfig content-layout subset into the Root + Page path', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: createLegacyContentLayoutSubset(),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.ui?.contentLayout, 'wide')
  assert.equal(resolved?.ui?.brand?.title, 'Legacy Display Brand')
})

await runTest('resolveRootPageBlackboxConfig promotes a serialized old ChatConfig content-layout subset only when layout stays inside contentLayout', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: JSON.stringify(createLegacyContentLayoutSubset()),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.ui?.contentLayout, 'wide')
  assert.equal(resolved?.ui?.appearance?.mode, 'dark')
})

await runTest('resolveRootPageBlackboxConfig promotes the narrow old ChatConfig shell subset into the Root + Page path', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: createLegacyShellSubset(),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.ui?.contentLayout, 'wide')
  assert.equal(resolved?.workspace?.defaultView, 'workspace')
  assert.equal(resolved?.workspace?.left?.defaultOpen, false)
  assert.equal(resolved?.workspace?.left?.railLabel, 'Legacy History')
  assert.equal(resolved?.workspace?.right?.defaultOpen, true)
  assert.equal(resolved?.workspace?.right?.railLabel, 'Legacy Preview')
})

await runTest('resolveRootPageBlackboxConfig promotes a serialized old ChatConfig shell subset only when shell stays inside variant plus left or right regions', async () => {
  const resolved = resolveRootPageBlackboxConfig({
    config: JSON.stringify(createLegacyShellSubset()),
  })

  assert.notEqual(resolved, null)
  assert.equal(resolved?.workspace?.defaultView, 'workspace')
  assert.equal(resolved?.workspace?.left?.collapseMode, 'rail')
  assert.equal(resolved?.workspace?.right?.collapseMode, 'hidden')
})

await runTest('resolveRootPageBlackboxConfig keeps old ChatConfig shell.viewState on the scaffold fallback path', async () => {
  assert.equal(
    resolveRootPageBlackboxConfig({
      config: createLegacyShellViewStateSubset(),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: JSON.stringify(createLegacyShellViewStateSubset()),
    }),
    null,
  )
})

await runTest('resolveRootPageBlackboxConfig composes config lifecycle hooks with compatibility callbacks without mutating the input config', async () => {
  const events = []
  const originalAfterReceive = (message) => {
    events.push(`config-after:${message.content}`)
  }
  const originalError = (error) => {
    events.push(`config-error:${error.message}`)
  }
  const config = {
    ...createTargetConfig(),
    lifecycle: {
      afterReceive: originalAfterReceive,
      error: originalError,
    },
  }
  const callbacks = {
    onFinish: (message) => {
      events.push(`callback-finish:${message.content}`)
    },
    onError: (error) => {
      events.push(`callback-error:${error.message}`)
    },
  }

  const resolved = resolveRootPageBlackboxConfig({
    config,
    callbacks,
  })

  assert.notEqual(resolved, null)
  assert.notEqual(resolved, config)
  assert.equal(config.lifecycle.afterReceive, originalAfterReceive)
  assert.equal(config.lifecycle.error, originalError)

  resolved.lifecycle.afterReceive({ role: 'assistant', content: 'reply:blackbox' })
  resolved.lifecycle.error(new Error('blackbox-boom'))

  assert.deepEqual(events, [
    'config-after:reply:blackbox',
    'callback-finish:reply:blackbox',
    'config-error:blackbox-boom',
    'callback-error:blackbox-boom',
  ])
})

await runTest('resolveRootPageBlackboxConfig keeps unsupported compatibility callbacks and other legacy entry props on the scaffold fallback', async () => {
  const config = createTargetConfig()

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onBeforeSend: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onMessageAction: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      callbacks: {
        onModelChange: () => undefined,
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      runtime: {
        selectedModel: 'gpt-4.1-mini',
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config,
      presetOverrides: {},
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: '{"legacy":true}',
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: {
        ...createLegacyRequestSubset(),
        ui: {
          prompts: [{ label: 'legacy-prompt' }],
        },
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: createLegacyLayoutVariantSubset(),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: {
        ...createLegacyContentLayoutSubset(),
        layout: {
          contentLayout: 'wide',
          variant: 'workspace',
        },
      },
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: createLegacyLayoutPlacementsSubset(),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: JSON.stringify(createLegacyLayoutPlacementsSubset()),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: createLegacyPromptsSubset(),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: JSON.stringify(createLegacyPromptsSubset()),
    }),
    null,
  )

  assert.equal(
    resolveRootPageBlackboxConfig({
      config: {
        models: [
          { id: 'gpt-4.1-mini', providerId: 'openai' },
          { id: 'claude-3-7-sonnet', providerId: 'anthropic' },
        ],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat/completions',
          },
          anthropic: {
            type: 'openai-compatible',
            endpoint: '/api/anthropic/chat',
          },
        },
      },
    }),
    null,
  )
})
