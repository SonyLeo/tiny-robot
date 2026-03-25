import {
  assert,
  CHAT_MESSAGES,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  loadChatConfig,
  runTest,
  useMcpManager,
} from './_helpers.mjs'

await runTest('createPresetChatSlices exposes white-box slices that preserve blackbox defaults', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      brand: {
        title: 'Preset Slice Brand',
        logo: 'brand-logo',
      },
      welcome: {
        title: 'Preset Slice Welcome',
        description: 'Preset Slice Description',
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
    maxLength: 200,
    senderProps: {
      maxLength: 120,
    },
    show: true,
    enableFullscreen: true,
    fullscreen: false,
    messageListVariant: 'docs',
    groupStrategy: 'consecutive',
  })

  const slices = createPresetChatSlices(presetProps)

  assert.deepEqual(slices.root.attachmentsFeature, presetProps.attachmentsFeature)
  assert.deepEqual(slices.root.senderActionsFeature, presetProps.senderActionsFeature)
  assert.equal(slices.header.title, 'Preset Slice Brand')
  assert.equal(slices.header.showHistory, true)
  assert.equal(slices.header.showFullScreen, true)
  assert.equal(slices.header.showClose, true)
  assert.equal(slices.welcome?.title, 'Preset Slice Welcome')
  assert.equal(slices.welcome?.icon, 'brand-logo')
  assert.equal(slices.welcome?.prompts?.[0]?.label, 'feature prompt')
  assert.equal(slices.messageList.autoScroll, true)
  assert.equal(slices.messageList.variant, 'docs')
  assert.equal(slices.messageList.groupStrategy, 'consecutive')
  assert.equal(slices.messageList.showFeedback, true)
  assert.equal(slices.sender.placeholder, CHAT_MESSAGES.sender.placeholder)
  assert.equal(slices.sender.mode, 'multiple')
  assert.equal(slices.sender.maxLength, 120)
  assert.equal(slices.history.enabled, true)
  assert.equal(slices.modelSelector.enabled, true)
  assert.equal(slices.modelSelector.defaultModel, 'gpt-4o-mini')
})

await runTest('createPresetChatSlices keeps white-box slices empty when optional capabilities are absent', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
  })

  const slices = createPresetChatSlices(createPresetChatProps(adapter))

  assert.equal(slices.header.showHistory, false)
  assert.equal(slices.header.showFullScreen, false)
  assert.equal(slices.header.showClose, false)
  assert.equal(slices.welcome, undefined)
  assert.equal(slices.messageList.autoScroll, true)
  assert.equal(slices.messageList.showFeedback, false)
  assert.equal(slices.sender.placeholder, CHAT_MESSAGES.sender.placeholder)
  assert.equal(slices.sender.mode, 'multiple')
  assert.equal(slices.history.enabled, false)
  assert.equal(slices.modelSelector.enabled, true)
})

await runTest('createPresetChatSlices exposes layout variant and placement defaults for white-box composition', async () => {
  const adapter = createChatAdapterFromConfig({
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

  const slices = createPresetChatSlices(createPresetChatProps(adapter))

  assert.equal(slices.messageList.variant, 'docs')
  assert.equal(slices.layout.roleConfigs?.assistant?.placement, 'end')
  assert.equal(slices.layout.roleConfigs?.user?.placement, 'start')
})

await runTest('createPresetChatSlices exposes appearance config as a dedicated white-box slice', async () => {
  const adapter = createChatAdapterFromConfig({
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

  const presetProps = createPresetChatProps(adapter)
  const slices = createPresetChatSlices(presetProps)

  assert.deepEqual(presetProps.appearance, {
    mode: 'dark',
  })
  assert.deepEqual(slices.appearance.appearance, {
    mode: 'dark',
  })
})

await runTest('createPresetChatSlices keeps system appearance mode as a dedicated white-box slice value', async () => {
  const adapter = createChatAdapterFromConfig({
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

  const presetProps = createPresetChatProps(adapter)
  const slices = createPresetChatSlices(presetProps)

  assert.deepEqual(presetProps.appearance, {
    mode: 'system',
  })
  assert.deepEqual(slices.appearance.appearance, {
    mode: 'system',
  })
})

await runTest('loadChatConfig and preset slices preserve workspace layout variant as a pure layout choice', async () => {
  const config = loadChatConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    layout: {
      variant: 'workspace',
      placements: {
        assistant: 'start',
        user: 'end',
      },
    },
  })

  assert.deepEqual(config.layout, {
    variant: 'workspace',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  })

  const presetProps = createPresetChatProps(createChatAdapterFromConfig(config))
  const slices = createPresetChatSlices(presetProps)

  assert.equal(presetProps.messageListVariant, 'workspace')
  assert.equal(presetProps.roleConfigs?.assistant?.placement, 'start')
  assert.equal(presetProps.roleConfigs?.user?.placement, 'end')
  assert.equal(slices.messageList.variant, 'workspace')
  assert.equal(slices.layout.roleConfigs?.assistant?.placement, 'start')
  assert.equal(slices.layout.roleConfigs?.user?.placement, 'end')
})

await runTest('createPresetChatSlices preserves senderProps.extensions for passthrough composition', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
  })

  const extensions = [{ name: 'suggestion-ext' }, { name: 'mention-ext' }]
  const slices = createPresetChatSlices(
    createPresetChatProps(adapter, {
      senderProps: {
        extensions,
      },
    }),
  )

  assert.equal(slices.sender.extensions, extensions)
})

await runTest('createPresetChatSlices keeps root feature defaults while sender slice honors explicit sender overrides', async () => {
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      welcome: {
        title: 'Alignment Welcome',
      },
    },
    features: {
      attachments: true,
      senderActions: {
        voice: {
          enabled: true,
          tooltip: 'voice from features',
        },
        wordCount: true,
      },
    },
  })

  const slices = createPresetChatSlices(
    createPresetChatProps(adapter, {
      placeholder: 'top-level placeholder',
      senderMode: 'single',
      maxLength: 80,
      senderProps: {
        placeholder: 'sender override placeholder',
        allowSpeech: false,
      },
    }),
  )

  assert.equal(slices.root.attachmentsFeature?.enabled, true)
  assert.equal(slices.root.senderActionsFeature?.voice?.enabled, true)
  assert.equal(slices.root.senderActionsFeature?.wordCount, true)
  assert.equal(slices.sender.placeholder, 'sender override placeholder')
  assert.equal(slices.sender.mode, 'single')
  assert.equal(slices.sender.maxLength, 80)
  assert.equal(slices.sender.allowSpeech, false)
})

await runTest('createPresetChatProps and createPresetChatSlices expose mcp manager through the runtime pipeline', async () => {
  const mcpManager = useMcpManager({
    initialPlugins: [
      {
        id: 'weather-service',
        name: 'Weather Service',
        icon: 'W',
        description: 'Weather tools',
        enabled: true,
        expanded: true,
        tools: [
          {
            id: 'get-weather',
            name: 'Get Weather',
            description: 'Get current weather',
            enabled: true,
          },
        ],
        category: 'utilities',
      },
    ],
  })

  const adapter = createChatAdapterFromConfig({
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

  assert.equal(adapter.resolvedFeatures.entries.mcp.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.mcp.config?.manager, undefined)
  assert.equal(adapter.config.runtime?.mcpManager, mcpManager)

  const presetProps = createPresetChatProps(adapter)
  const presetSlices = createPresetChatSlices(presetProps)

  assert.equal(presetProps.mcpManager, mcpManager)
  assert.equal(presetSlices.root.mcpManager, mcpManager)
})

await runTest('createPresetChatProps lets explicit mcpManager override win over resolved runtime defaults', async () => {
  const featureManager = useMcpManager()
  const overrideManager = useMcpManager()
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    features: {
      mcp: {
        manager: featureManager,
      },
    },
  })

  const presetProps = createPresetChatProps(adapter, {
    mcpManager: overrideManager,
  })

  assert.equal(presetProps.mcpManager, overrideManager)
})

await runTest('feature registry output flows into preset props and white-box slices through a stable mapping contract', async () => {
  const mcpManager = useMcpManager()
  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    ui: {
      welcome: {
        title: 'Feature Welcome',
      },
    },
    features: {
      attachments: {
        upload: {
          accept: '.md',
        },
      },
      senderActions: {
        voice: {
          enabled: true,
          tooltip: 'voice from feature',
        },
      },
      welcomePrompts: {
        welcome: [{ label: 'feature prompt', description: 'feature prompt' }],
      },
      mcp: {
        manager: mcpManager,
      },
      history: {
        props: {
          selected: 'conversation-3',
        },
      },
      feedback: true,
    },
  })

  const presetProps = createPresetChatProps(adapter)
  const slices = createPresetChatSlices(presetProps)

  assert.equal(presetProps.attachmentsFeature?.upload?.accept, '.md')
  assert.equal(presetProps.senderActionsFeature?.voice?.tooltip, 'voice from feature')
  assert.equal(presetProps.prompts?.[0]?.label, 'feature prompt')
  assert.equal(presetProps.mcpManager, mcpManager)
  assert.equal(presetProps.showHistory, true)
  assert.equal(presetProps.showFeedback, true)
  assert.deepEqual(presetProps.historyProps, {
    selected: 'conversation-3',
  })

  assert.equal(slices.root.attachmentsFeature?.upload?.accept, '.md')
  assert.equal(slices.root.senderActionsFeature?.voice?.tooltip, 'voice from feature')
  assert.equal(slices.root.mcpManager, mcpManager)
  assert.equal(slices.welcome?.prompts?.[0]?.label, 'feature prompt')
  assert.equal(slices.header.showHistory, true)
  assert.equal(slices.history.enabled, true)
  assert.deepEqual(slices.history.props, {
    selected: 'conversation-3',
  })
  assert.equal(slices.messageList.showFeedback, true)
})
