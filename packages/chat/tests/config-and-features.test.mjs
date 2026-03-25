import {
  assert,
  createChatAdapterFromConfig,
  createPresetChatProps,
  loadChatConfig,
  resolveChatFeatures,
  runTest,
} from './_helpers.mjs'

await runTest('loadChatConfig normalizes feature config and createPresetChatProps consumes resolved feature defaults', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      attachments: {
        upload: {
          accept: '.pdf',
          multiple: false,
        },
      },
      senderActions: {
        voice: {
          enabled: true,
          tooltip: '语音输入',
          size: 'small',
          autoInsert: false,
        },
        wordCount: true,
        defaultActions: {
          clear: {
            tooltip: '清空',
          },
        },
      },
      history: {
        props: {
          selected: 'conversation-1',
        },
      },
      feedback: true,
    },
  })

  assert.deepEqual(config.features, {
    attachments: {
      enabled: undefined,
      upload: {
        enabled: undefined,
        accept: '.pdf',
        multiple: false,
        maxCount: undefined,
        maxSize: undefined,
        tooltip: undefined,
        tooltipPlacement: undefined,
      },
      list: undefined,
    },
    senderActions: {
      enabled: undefined,
      upload: undefined,
      voice: {
        enabled: true,
        tooltip: '语音输入',
        tooltipPlacement: undefined,
        size: 'small',
        speechConfig: undefined,
        autoInsert: false,
        onButtonClick: undefined,
        icon: undefined,
        recordingIcon: undefined,
      },
      wordCount: true,
      defaultActions: {
        clear: {
          tooltip: '清空',
        },
      },
    },
    welcomePrompts: undefined,
    mcp: undefined,
    history: {
      enabled: undefined,
      props: {
        selected: 'conversation-1',
      },
    },
    feedback: true,
  })

  const adapter = createChatAdapterFromConfig(config)

  assert.deepEqual(adapter.resolvedFeatures.enabledKeys, ['attachments', 'senderActions', 'history', 'feedback'])
  assert.equal(adapter.resolvedFeatures.entries.attachments.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.senderActions.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.history.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.feedback.enabled, true)

  const presetProps = createPresetChatProps(adapter)

  assert.equal(presetProps.attachmentsFeature?.enabled, true)
  assert.equal(presetProps.attachmentsFeature?.upload?.accept, '.pdf')
  assert.equal(presetProps.attachmentsFeature?.upload?.multiple, false)
  assert.equal(presetProps.attachmentsFeature?.list?.variant, 'card')
  assert.equal(presetProps.senderActionsFeature?.voice?.enabled, true)
  assert.equal(presetProps.senderActionsFeature?.voice?.tooltip, '语音输入')
  assert.equal(presetProps.senderActionsFeature?.voice?.size, 'small')
  assert.equal(presetProps.senderActionsFeature?.voice?.autoInsert, false)
  assert.equal(presetProps.senderActionsFeature?.wordCount, true)
  assert.equal(presetProps.senderActionsFeature?.defaultActions?.clear?.tooltip, '清空')
  assert.equal(presetProps.showHistory, true)
  assert.equal(presetProps.showFeedback, true)
  assert.deepEqual(presetProps.historyProps, {
    selected: 'conversation-1',
  })
})

await runTest('createPresetChatProps lets explicit overrides win over resolved feature defaults', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      attachments: true,
      senderActions: {
        wordCount: true,
      },
      welcomePrompts: {
        welcome: [{ label: 'feature prompt', description: 'feature prompt' }],
      },
      history: true,
      feedback: true,
    },
  })

  const presetProps = createPresetChatProps(adapter, {
    attachmentsFeature: {
      enabled: true,
      upload: {
        accept: 'image/*',
      },
    },
    senderActionsFeature: {
      wordCount: false,
    },
    prompts: [{ label: 'override prompt', description: 'override prompt' }],
    showHistory: false,
    showFeedback: false,
  })

  assert.equal(presetProps.attachmentsFeature?.upload?.accept, 'image/*')
  assert.equal(presetProps.senderActionsFeature?.wordCount, false)
  assert.equal(presetProps.prompts?.[0]?.label, 'override prompt')
  assert.equal(presetProps.showHistory, false)
  assert.equal(presetProps.showFeedback, false)
})

await runTest('loadChatConfig normalizes layout config and createPresetChatProps consumes it as layout defaults', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    layout: {
      variant: 'docs',
      placements: {
        assistant: 'end',
        user: 'start',
      },
    },
  })

  assert.deepEqual(config.layout, {
    variant: 'docs',
    placements: {
      assistant: 'end',
      user: 'start',
    },
  })

  const adapter = createChatAdapterFromConfig(config)
  const presetProps = createPresetChatProps(adapter)

  assert.equal(presetProps.messageListVariant, 'docs')
  assert.equal(presetProps.roleConfigs?.assistant?.placement, 'end')
  assert.equal(presetProps.roleConfigs?.user?.placement, 'start')
})

await runTest('loadChatConfig normalizes appearance config and createPresetChatProps exposes it for runtime consumption', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    appearance: {
      mode: 'dark',
    },
  })

  assert.deepEqual(config.appearance, {
    mode: 'dark',
  })

  const presetProps = createPresetChatProps(createChatAdapterFromConfig(config))
  assert.deepEqual(presetProps.appearance, {
    mode: 'dark',
  })
})

await runTest('loadChatConfig preserves system appearance mode and createPresetChatProps forwards it for runtime resolution', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    appearance: {
      mode: 'system',
    },
  })

  assert.deepEqual(config.appearance, {
    mode: 'system',
  })

  const presetProps = createPresetChatProps(createChatAdapterFromConfig(config))
  assert.deepEqual(presetProps.appearance, {
    mode: 'system',
  })
})

await runTest('resolveChatFeatures keeps attachments and senderActions outputs independent for runtime composition', async () => {
  const resolved = resolveChatFeatures({
    attachments: {
      upload: {
        accept: '.txt',
        multiple: true,
      },
    },
    senderActions: {
      upload: {
        enabled: false,
      },
      voice: {
        enabled: true,
        tooltip: '语音输入',
      },
    },
  })

  assert.deepEqual(resolved.enabledKeys, ['attachments', 'senderActions'])
  assert.equal(resolved.entries.attachments.presetProps.attachmentsFeature?.upload?.accept, '.txt')
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.upload?.enabled, false)
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.voice?.enabled, true)
  assert.equal(resolved.entries.senderActions.presetProps.senderActionsFeature?.voice?.tooltip, '语音输入')
})

await runTest('createPresetChatProps lets welcomePrompts override legacy ui.prompts and explicit disable clears prompts', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
    },
    features: {
      welcomePrompts: {
        welcome: [
          { label: 'feature prompt 1', description: 'feature prompt 1' },
          { label: 'feature prompt 2', description: 'feature prompt 2' },
        ],
      },
    },
  })

  const presetProps = createPresetChatProps(adapter)
  assert.equal(presetProps.prompts?.length, 2)
  assert.equal(presetProps.prompts?.[0]?.label, 'feature prompt 1')
  assert.equal(adapter.resolvedFeatures.entries.welcomePrompts.enabled, true)

  const disabledAdapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
    },
    features: {
      welcomePrompts: false,
    },
  })

  const disabledPresetProps = createPresetChatProps(disabledAdapter)
  assert.deepEqual(disabledPresetProps.prompts, [])
  assert.equal(disabledAdapter.resolvedFeatures.entries.welcomePrompts.enabled, false)
})

await runTest('loadChatConfig still accepts legacy suggestions as an alias of welcomePrompts', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      suggestions: {
        welcome: [{ label: 'legacy alias prompt', description: 'legacy alias prompt' }],
      },
    },
  })

  assert.equal(adapter.resolvedFeatures.entries.welcomePrompts.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.welcomePrompts.config?.welcome?.[0]?.label, 'legacy alias prompt')

  const presetProps = createPresetChatProps(adapter)
  assert.equal(presetProps.prompts?.[0]?.label, 'legacy alias prompt')
})

await runTest('resolveChatFeatures keeps disabled features out of preset props', async () => {
  const resolved = resolveChatFeatures({
    attachments: false,
    senderActions: false,
    welcomePrompts: false,
    mcp: false,
    history: false,
    feedback: {
      enabled: false,
    },
  })

  assert.deepEqual(resolved.enabledKeys, [])
  assert.deepEqual(resolved.presetProps, {
    prompts: [],
  })
  assert.equal(resolved.entries.attachments.enabled, false)
  assert.equal(resolved.entries.senderActions.enabled, false)
  assert.equal(resolved.entries.welcomePrompts.enabled, false)
  assert.equal(resolved.entries.mcp.enabled, false)
  assert.equal(resolved.entries.history.enabled, false)
  assert.equal(resolved.entries.feedback.enabled, false)
})

await runTest('loadChatConfig hoists mcp runtime objects out of declarative features into runtime', async () => {
  const mcpManager = { id: 'manager' }

  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      mcp: {
        manager: mcpManager,
      },
    },
  })

  assert.equal(config.features?.mcp?.enabled, undefined)
  assert.equal(config.features?.mcp?.manager, undefined)
  assert.equal(config.runtime?.mcpManager, mcpManager)

  const explicitRuntimeConfig = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      mcp: true,
    },
    runtime: {
      mcpManager,
    },
  })

  assert.equal(explicitRuntimeConfig.features?.mcp, true)
  assert.equal(explicitRuntimeConfig.runtime?.mcpManager, mcpManager)
})

await runTest('loadChatConfig rejects invalid feature shapes', async () => {
  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          history: {
            props: 'invalid',
          },
        },
      }),
    /features\.history\.props must be an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          senderActions: 'invalid',
        },
      }),
    /features\.senderActions must be a boolean or an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          welcomePrompts: 'invalid',
        },
      }),
    /features\.welcomePrompts must be a boolean or an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        features: {
          mcp: 'invalid',
        },
      }),
    /features\.mcp must be a boolean or an object/,
  )

  assert.throws(
    () =>
      loadChatConfig({
        models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
        providers: {
          openai: {
            type: 'openai-compatible',
            endpoint: '/api/chat',
          },
        },
        appearance: 'dark',
      }),
    /appearance must be an object/,
  )
})
