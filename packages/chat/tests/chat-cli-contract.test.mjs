import {
  assert,
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  createChatAdapterFromConfig,
  createChatCliCapabilitySurface,
  runTest,
  useMcpManager,
} from './_helpers.mjs'

await runTest('createChatCliCapabilitySurface exposes the current stable chat-cli consumption contract', async () => {
  assert.deepEqual(CHAT_CLI_CONSUMABLE_FEATURE_KEYS, [
    'attachments',
    'senderActions',
    'welcomePrompts',
    'mcp',
    'history',
    'feedback',
  ])
  assert.deepEqual(CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS, [
    'attachmentsFeature',
    'senderActionsFeature',
    'prompts',
    'mcpManager',
    'messageListVariant',
    'contentLayout',
    'roleConfigs',
    'showHistory',
    'historyProps',
    'showFeedback',
  ])
  assert.deepEqual(CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS, [
    'root',
    'layout',
    'header',
    'welcome',
    'messageList',
    'sender',
    'history',
    'modelSelector',
  ])

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
        title: 'CLI Welcome',
      },
    },
    layout: {
      variant: 'workspace',
      contentLayout: 'centered',
      placements: {
        assistant: 'start',
        user: 'end',
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
      mcp: {
        manager: mcpManager,
      },
      history: {
        props: {
          selected: 'conversation-2',
        },
      },
      feedback: true,
    },
  })

  const surface = createChatCliCapabilitySurface(adapter, {
    contentLayout: 'wide',
    senderProps: {
      maxLength: 80,
    },
  })

  assert.deepEqual(surface.featureKeys, ['attachments', 'senderActions', 'welcomePrompts', 'mcp', 'history', 'feedback'])
  assert.equal(surface.presetProps.attachmentsFeature?.enabled, true)
  assert.equal(surface.presetProps.senderActionsFeature?.wordCount, true)
  assert.equal(surface.presetProps.prompts?.[0]?.label, 'feature prompt')
  assert.equal(surface.presetProps.mcpManager, mcpManager)
  assert.equal(surface.presetProps.messageListVariant, 'workspace')
  assert.equal(surface.presetProps.contentLayout, 'wide')
  assert.equal(surface.presetProps.roleConfigs?.assistant?.placement, 'start')
  assert.equal(surface.presetProps.roleConfigs?.user?.placement, 'end')
  assert.equal(surface.presetProps.showHistory, true)
  assert.equal(surface.presetProps.showFeedback, true)
  assert.deepEqual(surface.presetProps.historyProps, {
    selected: 'conversation-2',
  })
  assert.deepEqual(Object.keys(surface.presetSlices), [
    'root',
    'layout',
    'header',
    'welcome',
    'messageList',
    'sender',
    'history',
    'modelSelector',
  ])
  assert.equal(surface.presetSlices.root.attachmentsFeature?.enabled, true)
  assert.equal(surface.presetSlices.root.mcpManager, mcpManager)
  assert.equal(surface.presetSlices.layout.contentLayout, 'wide')
  assert.equal(surface.presetSlices.layout.roleConfigs?.assistant?.placement, 'start')
  assert.equal(surface.presetSlices.layout.roleConfigs?.user?.placement, 'end')
  assert.equal(surface.presetSlices.header.title, undefined)
  assert.equal(surface.presetSlices.header.showHistory, true)
  assert.equal(surface.presetSlices.welcome?.title, 'CLI Welcome')
  assert.equal(surface.presetSlices.messageList.variant, 'workspace')
  assert.equal(surface.presetSlices.messageList.showFeedback, true)
  assert.equal(surface.presetSlices.sender.maxLength, 80)
  assert.equal(surface.presetSlices.history.enabled, true)
  assert.deepEqual(surface.presetSlices.history.props, {
    selected: 'conversation-2',
  })
  assert.equal(surface.presetSlices.modelSelector.enabled, true)
  assert.equal(surface.presetSlices.modelSelector.defaultModel, 'gpt-4o-mini')
})
