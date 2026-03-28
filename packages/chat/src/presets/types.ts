import type { ChatAdapter, ChatConfig, ChatConfigDefaults, ChatConfigUI, ChatLayoutConfig } from '../adapters/types'
import type { ChatPresetProps, ChatPresetSlices } from '../adapters/types'
import type { TrChatPresetOverrides } from '../types'
import type { ChatFeatureConfigMap, ChatMcpFeatureConfig } from '../features'
import type { ChatWorkspaceShellConfig } from '../types/workspace'

export interface AgentPresetUiInput extends Partial<ChatConfigUI> {
  promptMode?: 'replace' | 'append'
}

export interface AgentPresetRuntimeInput {
  mcpManager?: TrChatPresetOverrides['mcpManager']
}

export interface AgentPresetInput {
  id: string
  label?: string
  extends?: string[]
  defaults?: ChatConfigDefaults
  ui?: AgentPresetUiInput
  shell?: ChatWorkspaceShellConfig
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
  shell?: ChatWorkspaceShellConfig
  layout?: ChatLayoutConfig
  features?: ChatFeatureConfigMap
  mcp?: ChatMcpFeatureConfig
  runtime?: AgentPresetRuntimeInput
}

export interface ResolvedAgentPreset {
  presetId: string
  presetChain: AgentPresetInput[]
  skillPacks: SkillPackInput[]
  chatConfigPatch: Partial<Pick<ChatConfig, 'defaults' | 'ui' | 'shell' | 'layout' | 'features' | 'runtime'>>
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
  presetOverrides?: Partial<TrChatPresetOverrides>
}

export interface AgentPresetConsumptionResult extends AgentPresetResolutionResult {
  presetProps: ChatPresetProps & Partial<TrChatPresetOverrides>
  presetSlices: ChatPresetSlices
}
