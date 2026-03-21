import type { ChatAdapter, ChatConfig, ChatConfigDefaults, ChatConfigUI, ChatLayoutConfig } from '../adapters/types'
import type { ChatPresetProps, ChatPresetSlices } from '../adapters/types'
import type { TrChatProps } from '../types'
import type { ChatFeatureConfigMap, ChatMcpFeatureConfig } from '../features'

export interface AgentPresetUiInput extends Partial<ChatConfigUI> {
  promptMode?: 'replace' | 'append'
}

export interface AgentPresetRuntimeInput {
  mcpManager?: TrChatProps['mcpManager']
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
  runtime?: AgentPresetRuntimeInput
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
  runtime?: AgentPresetRuntimeInput
}

export interface ResolvedAgentPreset {
  presetId: string
  presetChain: AgentPresetInput[]
  skillPacks: SkillPackInput[]
  chatConfigPatch: Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'layout' | 'features' | 'runtime'>>
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

export interface CreatePresetConsumptionFromAgentPresetOptions extends CreateChatAdapterFromAgentPresetOptions {
  presetOverrides?: Partial<TrChatProps>
}

export interface AgentPresetConsumptionResult extends AgentPresetResolutionResult {
  presetProps: ChatPresetProps & Partial<TrChatProps>
  presetSlices: ChatPresetSlices
}
