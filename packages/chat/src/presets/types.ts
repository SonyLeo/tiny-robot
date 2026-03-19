import type { ChatAdapter, ChatConfig, ChatConfigDefaults, ChatConfigUI, ChatLayoutConfig } from '../adapters/types'
import type { ChatFeatureConfigMap, ChatMcpFeatureConfig } from '../features'

export interface AgentPresetUiInput extends Partial<ChatConfigUI> {
  promptMode?: 'replace' | 'append'
}

export interface AgentPresetInput {
  id: string
  label?: string
  extends?: string[]
  defaults?: ChatConfigDefaults
  ui?: AgentPresetUiInput
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
  mcp?: ChatMcpFeatureConfig
  skills?: string[]
}

export interface SkillPackInput {
  id: string
  label?: string
  defaults?: ChatConfigDefaults
  ui?: AgentPresetUiInput
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
  mcp?: ChatMcpFeatureConfig
}

export interface ResolvedAgentPreset {
  presetId: string
  presetChain: AgentPresetInput[]
  skillPacks: SkillPackInput[]
  chatConfigPatch: Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'layout' | 'features'>>
}

export interface ResolveAgentPresetOptions {
  preset: AgentPresetInput
  presets?: AgentPresetInput[]
  skillPacks?: SkillPackInput[]
}

export interface ApplyAgentPresetOptions extends ResolveAgentPresetOptions {
  baseConfig: ChatConfig
}

export type CreateChatAdapterFromAgentPresetOptions = ApplyAgentPresetOptions

export interface AgentPresetResolutionResult {
  resolvedPreset: ResolvedAgentPreset
  chatConfig: ChatConfig
  adapter: ChatAdapter
}
