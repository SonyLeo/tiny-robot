import {
  CHAT_MESSAGES,
  assert,
  createPresetConsumptionFromAgentPreset,
  runTest,
  useMcpManager,
} from './_helpers.mjs'

await runTest('createPresetConsumptionFromAgentPreset exposes scaffold-ready defaults for leaf components', async () => {
  const mcpManager = useMcpManager()

  const consumption = createPresetConsumptionFromAgentPreset({
    baseConfig: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/chat',
        },
      },
      appearance: {
        mode: 'dark',
      },
      ui: {
        brand: {
          title: 'Scaffold Brand',
        },
        welcome: {
          title: 'Scaffold Welcome',
          description: 'Scaffold description',
        },
      },
      layout: {
        variant: 'docs',
        placements: {
          assistant: 'start',
          user: 'end',
        },
      },
      features: {
        senderActions: {
          voice: {
            enabled: true,
          },
        },
      },
    },
    preset: {
      id: 'scaffold-consumer',
      features: {
        attachments: {
          upload: {
            accept: '.md',
          },
        },
        history: true,
        feedback: true,
      },
      mcp: {
        manager: mcpManager,
      },
    },
  })

  assert.equal(consumption.presetSlices.root.mcpManager, mcpManager)
  assert.equal(consumption.presetSlices.root.attachmentsFeature?.upload?.accept, '.md')
  assert.equal(consumption.presetSlices.root.senderActionsFeature?.voice?.enabled, true)

  assert.deepEqual(consumption.presetSlices.appearance.appearance, {
    mode: 'dark',
  })
  assert.equal(consumption.presetSlices.layout.roleConfigs?.assistant?.placement, 'start')
  assert.equal(consumption.presetSlices.layout.roleConfigs?.user?.placement, 'end')

  assert.equal(consumption.presetSlices.header.title, 'Scaffold Brand')
  assert.equal(consumption.presetSlices.header.showHistory, true)
  assert.equal(consumption.presetSlices.welcome?.title, 'Scaffold Welcome')
  assert.equal(consumption.presetSlices.welcome?.description, 'Scaffold description')
  assert.equal(consumption.presetSlices.messageList.variant, 'docs')
  assert.equal(consumption.presetSlices.messageList.showFeedback, true)
  assert.equal(consumption.presetSlices.sender.placeholder, CHAT_MESSAGES.sender.placeholder)
  assert.equal(consumption.presetSlices.sender.mode, 'multiple')
  assert.equal(consumption.presetSlices.history.enabled, true)
  assert.equal(consumption.presetSlices.modelSelector.enabled, false)
  assert.equal(consumption.presetSlices.modelSelector.defaultModel, 'gpt-4o-mini')
})

await runTest('presetOverrides remain the highest-priority defaults in scaffold consumption output', async () => {
  const consumption = createPresetConsumptionFromAgentPreset({
    baseConfig: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/chat',
        },
      },
      appearance: {
        mode: 'light',
      },
      layout: {
        variant: 'docs',
      },
      ui: {
        brand: {
          title: 'Base Brand',
        },
      },
      features: {
        history: true,
      },
    },
    preset: {
      id: 'scaffold-overrides',
      features: {
        feedback: true,
      },
    },
    presetOverrides: {
      appearance: {
        mode: 'dark',
      },
      messageListVariant: 'workspace',
      showHistory: false,
      roleConfigs: {
        assistant: {
          placement: 'end',
        },
      },
      placeholder: 'top-level placeholder',
      senderProps: {
        placeholder: 'sender override placeholder',
      },
      senderMode: 'single',
      maxLength: 120,
      show: true,
      messages: {
        sender: {
          placeholder: 'messages-level placeholder',
        },
      },
    },
  })

  assert.deepEqual(consumption.presetSlices.appearance.appearance, {
    mode: 'dark',
  })
  assert.equal(consumption.presetSlices.messageList.variant, 'workspace')
  assert.equal(consumption.presetSlices.header.showHistory, false)
  assert.equal(consumption.presetSlices.layout.roleConfigs?.assistant?.placement, 'end')
  assert.equal(consumption.presetSlices.layout.show, true)
  assert.equal(consumption.presetSlices.sender.placeholder, 'sender override placeholder')
  assert.equal(consumption.presetSlices.sender.mode, 'single')
  assert.equal(consumption.presetSlices.sender.maxLength, 120)
  assert.equal(consumption.presetSlices.root.messages?.sender?.placeholder, 'messages-level placeholder')
})

await runTest('presetOverrides can force system appearance mode and keep it in scaffold slices', async () => {
  const consumption = createPresetConsumptionFromAgentPreset({
    baseConfig: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/chat',
        },
      },
      appearance: {
        mode: 'light',
      },
    },
    preset: {
      id: 'scaffold-system-appearance-override',
    },
    presetOverrides: {
      appearance: {
        mode: 'system',
      },
    },
  })

  assert.deepEqual(consumption.presetProps.appearance, {
    mode: 'system',
  })
  assert.deepEqual(consumption.presetSlices.appearance.appearance, {
    mode: 'system',
  })
})

