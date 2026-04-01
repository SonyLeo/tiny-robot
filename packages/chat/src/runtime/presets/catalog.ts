import type { AgentPresetInput, SkillPackInput } from './types'

export const BUILT_IN_SKILL_PACKS = [
  {
    id: 'conversation-core',
    label: 'Conversation Core',
    features: {
      history: true,
      feedback: true,
    },
  },
  {
    id: 'docs-layout',
    label: 'Docs Layout',
    layout: {
      variant: 'docs',
      placements: {
        assistant: 'start',
        user: 'end',
      },
    },
    ui: {
      welcome: {
        title: 'Docs Assistant',
        description: 'Ask questions while keeping a docs-style reading layout.',
      },
    },
  },
  {
    id: 'tool-agent-core',
    label: 'Tool Agent Core',
    features: {
      history: true,
    },
    mcp: true,
    ui: {
      prompts: [
        { label: 'Available tools', description: 'List the tools currently available to you.' },
        { label: 'Plan with tools', description: 'Create a plan that uses the enabled tools.' },
      ],
    },
  },
] as const satisfies readonly SkillPackInput[]

export type BuiltInSkillPackId = (typeof BUILT_IN_SKILL_PACKS)[number]['id']

export const BUILT_IN_AGENT_PRESETS = [
  {
    id: 'assistant-base',
    label: 'Assistant Base',
    skills: ['conversation-core'],
    defaults: {
      systemPrompt: 'You are a helpful assistant.',
    },
    ui: {
      prompts: [{ label: 'Start', description: 'Help me get started.' }],
    },
  },
  {
    id: 'docs-reader',
    label: 'Docs Reader',
    extends: ['assistant-base'],
    skills: ['docs-layout'],
    ui: {
      brand: {
        title: 'Docs Reader',
      },
    },
  },
  {
    id: 'tool-agent',
    label: 'Tool Agent',
    extends: ['assistant-base'],
    skills: ['tool-agent-core'],
    defaults: {
      systemPrompt: 'You are a tool-using assistant. Prefer tool results when relevant.',
    },
    ui: {
      brand: {
        title: 'Tool Agent',
      },
    },
  },
] as const satisfies readonly AgentPresetInput[]

export type BuiltInAgentPresetId = (typeof BUILT_IN_AGENT_PRESETS)[number]['id']

export function getBuiltInSkillPack(skillPackId: string): SkillPackInput | undefined {
  return BUILT_IN_SKILL_PACKS.find((item) => item.id === skillPackId)
}

export function getBuiltInAgentPreset(presetId: string): AgentPresetInput | undefined {
  return BUILT_IN_AGENT_PRESETS.find((item) => item.id === presetId)
}
