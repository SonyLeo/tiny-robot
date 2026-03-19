import {
  BUILT_IN_AGENT_PRESETS,
  BUILT_IN_SKILL_PACKS,
  assert,
  createChatAdapterFromAgentPreset,
  createPresetChatProps,
  createPresetChatSlices,
  getBuiltInAgentPreset,
  resolveAgentPreset,
  runTest,
  useMcpManager,
} from './_helpers.mjs'

await runTest('resolveAgentPreset merges listed skill packs first and lets the preset override them last', async () => {
  const mcpManager = useMcpManager()
  const resolved = resolveAgentPreset({
    preset: {
      id: 'tool-agent',
      skills: ['starter-tools', 'docs-layout'],
      defaults: {
        systemPrompt: 'Preset prompt wins',
      },
      ui: {
        prompts: [{ label: 'Preset prompt', description: 'Preset prompt' }],
      },
      features: {
        history: true,
      },
      mcp: {
        manager: mcpManager,
      },
    },
    skillPacks: [
      {
        id: 'docs-layout',
        layout: {
          variant: 'docs',
          placements: {
            assistant: 'end',
          },
        },
        ui: {
          welcome: {
            title: 'Docs Welcome',
          },
        },
      },
      {
        id: 'starter-tools',
        defaults: {
          systemPrompt: 'Skill prompt',
        },
        features: {
          feedback: true,
        },
        ui: {
          prompts: [{ label: 'Skill prompt', description: 'Skill prompt' }],
        },
      },
    ],
  })

  assert.deepEqual(
    resolved.skillPacks.map((item) => item.id),
    ['starter-tools', 'docs-layout'],
  )
  assert.equal(resolved.chatConfigPatch.defaults?.systemPrompt, 'Preset prompt wins')
  assert.equal(resolved.chatConfigPatch.ui?.prompts?.[0]?.label, 'Preset prompt')
  assert.equal(resolved.chatConfigPatch.ui?.welcome?.title, 'Docs Welcome')
  assert.equal(resolved.chatConfigPatch.layout?.variant, 'docs')
  assert.equal(resolved.chatConfigPatch.layout?.placements?.assistant, 'end')
  assert.equal(resolved.chatConfigPatch.features?.feedback, true)
  assert.equal(resolved.chatConfigPatch.features?.history, true)
  assert.equal(resolved.chatConfigPatch.features?.mcp?.manager, mcpManager)
  assert.deepEqual(
    resolved.presetChain.map((item) => item.id),
    ['tool-agent'],
  )
})

await runTest('resolveAgentPreset throws when a referenced skill pack is missing', async () => {
  assert.throws(
    () =>
      resolveAgentPreset({
        preset: {
          id: 'broken-preset',
          skills: ['missing-skill'],
        },
        skillPacks: [],
      }),
    /SkillPack "missing-skill" not found/,
  )
})

await runTest('resolveAgentPreset resolves inherited presets before the current preset and lets the current preset override them last', async () => {
  const resolved = resolveAgentPreset({
    preset: {
      id: 'child-preset',
      extends: ['base-preset'],
      skills: ['child-skill'],
      defaults: {
        systemPrompt: 'Child prompt',
      },
      ui: {
        brand: {
          title: 'Child Title',
        },
      },
      features: {
        history: true,
      },
    },
    presets: [
      {
        id: 'base-preset',
        skills: ['base-skill'],
        defaults: {
          systemPrompt: 'Base prompt',
        },
        ui: {
          brand: {
            logo: 'base-logo',
          },
          welcome: {
            title: 'Base Welcome',
          },
        },
        layout: {
          variant: 'docs',
        },
      },
    ],
    skillPacks: [
      {
        id: 'base-skill',
        features: {
          feedback: true,
        },
      },
      {
        id: 'child-skill',
        features: {
          history: {
            props: {
              selected: 'child-conversation',
            },
          },
        },
      },
    ],
  })

  assert.deepEqual(
    resolved.presetChain.map((item) => item.id),
    ['base-preset', 'child-preset'],
  )
  assert.deepEqual(
    resolved.skillPacks.map((item) => item.id),
    ['base-skill', 'child-skill'],
  )
  assert.equal(resolved.chatConfigPatch.defaults?.systemPrompt, 'Child prompt')
  assert.equal(resolved.chatConfigPatch.ui?.brand?.title, 'Child Title')
  assert.equal(resolved.chatConfigPatch.ui?.brand?.logo, 'base-logo')
  assert.equal(resolved.chatConfigPatch.ui?.welcome?.title, 'Base Welcome')
  assert.equal(resolved.chatConfigPatch.layout?.variant, 'docs')
  assert.equal(resolved.chatConfigPatch.features?.feedback, true)
  assert.equal(resolved.chatConfigPatch.features?.history?.props?.selected, 'child-conversation')
})

await runTest('resolveAgentPreset throws when an inherited preset is missing', async () => {
  assert.throws(
    () =>
      resolveAgentPreset({
        preset: {
          id: 'child-preset',
          extends: ['missing-base'],
        },
        presets: [],
      }),
    /AgentPreset "missing-base" not found/,
  )
})

await runTest('resolveAgentPreset throws on circular preset inheritance', async () => {
  assert.throws(
    () =>
      resolveAgentPreset({
        preset: {
          id: 'a',
          extends: ['b'],
        },
        presets: [
          {
            id: 'b',
            extends: ['a'],
          },
        ],
      }),
    /Circular preset inheritance detected/,
  )
})

await runTest('createChatAdapterFromAgentPreset resolves back into the existing chat adapter chain', async () => {
  const mcpManager = useMcpManager()
  const { resolvedPreset, chatConfig, adapter } = createChatAdapterFromAgentPreset({
    baseConfig: {
      models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/chat',
        },
      },
      ui: {
        welcome: {
          title: 'Base Welcome',
        },
      },
    },
    preset: {
      id: 'agent-preset',
      skills: ['feedback-skill'],
      defaults: {
        systemPrompt: 'Preset system prompt',
      },
      ui: {
        prompts: [{ label: 'Preset prompt', description: 'Preset prompt' }],
      },
      features: {
        history: true,
      },
      mcp: {
        manager: mcpManager,
      },
    },
    skillPacks: [
      {
        id: 'feedback-skill',
        features: {
          feedback: true,
        },
        layout: {
          variant: 'workspace',
        },
      },
    ],
  })

  assert.equal(resolvedPreset.presetId, 'agent-preset')
  assert.equal(chatConfig.defaults?.systemPrompt, 'Preset system prompt')
  assert.equal(chatConfig.ui?.welcome?.title, 'Base Welcome')
  assert.equal(chatConfig.ui?.prompts?.[0]?.label, 'Preset prompt')
  assert.equal(chatConfig.layout?.variant, 'workspace')
  assert.equal(chatConfig.features?.history, true)
  assert.equal(chatConfig.features?.feedback, true)
  assert.equal(chatConfig.features?.mcp?.manager, mcpManager)

  assert.deepEqual(adapter.resolvedFeatures.enabledKeys, ['mcp', 'history', 'feedback'])
  assert.equal(adapter.resolvedFeatures.entries.mcp.config?.manager, mcpManager)
  assert.equal(adapter.resolvedFeatures.entries.history.enabled, true)
  assert.equal(adapter.resolvedFeatures.entries.feedback.enabled, true)
})

await runTest('resolveAgentPreset merges brand, welcome, layout placements, and nested feature config predictably', async () => {
  const resolved = resolveAgentPreset({
    preset: {
      id: 'merge-heavy-preset',
      skills: ['brand-skill', 'attachments-skill'],
      ui: {
        brand: {
          title: 'Preset Title',
        },
        welcome: {
          icon: 'preset-icon',
        },
      },
      layout: {
        placements: {
          user: 'end',
        },
      },
      features: {
        attachments: {
          list: {
            variant: 'picture',
          },
        },
      },
    },
    skillPacks: [
      {
        id: 'brand-skill',
        ui: {
          brand: {
            logo: 'skill-logo',
          },
          welcome: {
            title: 'Skill Welcome',
            description: 'Skill description',
          },
        },
        layout: {
          variant: 'docs',
          placements: {
            assistant: 'start',
          },
        },
      },
      {
        id: 'attachments-skill',
        features: {
          attachments: {
            upload: {
              accept: '.pdf',
            },
            list: {
              wrap: true,
            },
          },
        },
      },
    ],
  })

  assert.equal(resolved.chatConfigPatch.ui?.brand?.title, 'Preset Title')
  assert.equal(resolved.chatConfigPatch.ui?.brand?.logo, 'skill-logo')
  assert.equal(resolved.chatConfigPatch.ui?.welcome?.title, 'Skill Welcome')
  assert.equal(resolved.chatConfigPatch.ui?.welcome?.description, 'Skill description')
  assert.equal(resolved.chatConfigPatch.ui?.welcome?.icon, 'preset-icon')
  assert.equal(resolved.chatConfigPatch.layout?.variant, 'docs')
  assert.equal(resolved.chatConfigPatch.layout?.placements?.assistant, 'start')
  assert.equal(resolved.chatConfigPatch.layout?.placements?.user, 'end')
  assert.equal(resolved.chatConfigPatch.features?.attachments?.upload?.accept, '.pdf')
  assert.equal(resolved.chatConfigPatch.features?.attachments?.list?.wrap, true)
  assert.equal(resolved.chatConfigPatch.features?.attachments?.list?.variant, 'picture')
})

await runTest('createChatAdapterFromAgentPreset keeps base feature config and lets preset composition merge into it', async () => {
  const { chatConfig } = createChatAdapterFromAgentPreset({
    baseConfig: {
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
            multiple: true,
          },
        },
      },
      layout: {
        placements: {
          assistant: 'end',
        },
      },
      ui: {
        brand: {
          title: 'Base Title',
        },
      },
    },
    preset: {
      id: 'base-merge-preset',
      skills: ['attachments-skill'],
      ui: {
        brand: {
          logo: 'preset-logo',
        },
      },
      layout: {
        variant: 'workspace',
      },
      features: {
        attachments: {
          list: {
            variant: 'card',
          },
        },
      },
    },
    skillPacks: [
      {
        id: 'attachments-skill',
        features: {
          attachments: {
            upload: {
              accept: '.md',
            },
          },
        },
      },
    ],
  })

  assert.equal(chatConfig.ui?.brand?.title, 'Base Title')
  assert.equal(chatConfig.ui?.brand?.logo, 'preset-logo')
  assert.equal(chatConfig.layout?.variant, 'workspace')
  assert.equal(chatConfig.layout?.placements?.assistant, 'end')
  assert.equal(chatConfig.features?.attachments?.upload?.multiple, true)
  assert.equal(chatConfig.features?.attachments?.upload?.accept, '.md')
  assert.equal(chatConfig.features?.attachments?.list?.variant, 'card')
})

await runTest('built-in preset and skill pack catalog provides concrete reference shapes that resolve through the same chain', async () => {
  const toolAgentPreset = getBuiltInAgentPreset('tool-agent')
  assert.ok(toolAgentPreset)

  const resolved = resolveAgentPreset({
    preset: toolAgentPreset,
    presets: BUILT_IN_AGENT_PRESETS,
    skillPacks: BUILT_IN_SKILL_PACKS,
  })

  assert.deepEqual(
    resolved.presetChain.map((item) => item.id),
    ['assistant-base', 'tool-agent'],
  )
  assert.deepEqual(
    resolved.skillPacks.map((item) => item.id),
    ['conversation-core', 'tool-agent-core'],
  )
  assert.equal(resolved.chatConfigPatch.defaults?.systemPrompt, 'You are a tool-using assistant. Prefer tool results when relevant.')
  assert.equal(resolved.chatConfigPatch.ui?.brand?.title, 'Tool Agent')
  assert.equal(resolved.chatConfigPatch.features?.history, true)
  assert.equal(resolved.chatConfigPatch.features?.feedback, true)
  assert.equal(resolved.chatConfigPatch.features?.mcp, true)
})

await runTest('resolveAgentPreset keeps prompts in replace mode by default and supports append mode explicitly', async () => {
  const replaced = resolveAgentPreset({
    preset: {
      id: 'replace-prompts',
      skills: ['base-prompts'],
      ui: {
        prompts: [{ label: 'Preset prompt', description: 'Preset prompt' }],
      },
    },
    skillPacks: [
      {
        id: 'base-prompts',
        ui: {
          prompts: [{ label: 'Skill prompt', description: 'Skill prompt' }],
        },
      },
    ],
  })

  assert.deepEqual(
    replaced.chatConfigPatch.ui?.prompts?.map((item) => item.label),
    ['Preset prompt'],
  )

  const appended = resolveAgentPreset({
    preset: {
      id: 'append-prompts',
      skills: ['base-prompts'],
      ui: {
        promptMode: 'append',
        prompts: [{ label: 'Preset prompt', description: 'Preset prompt' }],
      },
    },
    skillPacks: [
      {
        id: 'base-prompts',
        ui: {
          prompts: [{ label: 'Skill prompt', description: 'Skill prompt' }],
        },
      },
    ],
  })

  assert.deepEqual(
    appended.chatConfigPatch.ui?.prompts?.map((item) => item.label),
    ['Skill prompt', 'Preset prompt'],
  )
})

await runTest('resolveAgentPreset applies explicit mcp priority rules: object overrides true, false disables', async () => {
  const mcpManager = useMcpManager()

  const objectWins = resolveAgentPreset({
    preset: {
      id: 'object-mcp',
      skills: ['enable-mcp'],
      mcp: {
        manager: mcpManager,
      },
    },
    skillPacks: [
      {
        id: 'enable-mcp',
        mcp: true,
      },
    ],
  })

  assert.equal(objectWins.chatConfigPatch.features?.mcp?.manager, mcpManager)

  const falseWins = resolveAgentPreset({
    preset: {
      id: 'disable-mcp',
      skills: ['object-mcp'],
      mcp: false,
    },
    skillPacks: [
      {
        id: 'object-mcp',
        mcp: {
          manager: mcpManager,
        },
      },
    ],
  })

  assert.equal(falseWins.chatConfigPatch.features?.mcp, false)
})

await runTest('built-in presets can flow through adapter -> preset props -> preset slices without leaving the existing chat chain', async () => {
  const docsReaderPreset = getBuiltInAgentPreset('docs-reader')
  assert.ok(docsReaderPreset)

  const { chatConfig, adapter } = createChatAdapterFromAgentPreset({
    baseConfig: {
      models: [{ id: 'gpt-4o-mini', provider: 'openai' }],
      providers: {
        openai: {
          type: 'openai-compatible',
          endpoint: '/api/chat',
        },
      },
    },
    preset: docsReaderPreset,
    presets: BUILT_IN_AGENT_PRESETS,
    skillPacks: BUILT_IN_SKILL_PACKS,
  })

  const presetProps = createPresetChatProps(adapter)
  const slices = createPresetChatSlices(presetProps)

  assert.equal(chatConfig.layout?.variant, 'docs')
  assert.equal(chatConfig.features?.history, true)
  assert.equal(chatConfig.features?.feedback, true)
  assert.equal(presetProps.brand?.title, 'Docs Reader')
  assert.equal(presetProps.messageListVariant, 'docs')
  assert.equal(presetProps.showHistory, true)
  assert.equal(presetProps.showFeedback, true)
  assert.equal(slices.header.title, 'Docs Reader')
  assert.equal(slices.history.enabled, true)
  assert.equal(slices.messageList.variant, 'docs')
  assert.equal(slices.messageList.showFeedback, true)
  assert.equal(slices.welcome?.title, 'Docs Assistant')
})
