import {
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
} from './chatCli'
import type {
  ChatCliConsumableFeatureKey,
  ChatCliConsumablePresetPropKey,
  ChatCliConsumablePresetSliceKey,
} from './chatCli'
import { BUILT_IN_AGENT_PRESETS, BUILT_IN_SKILL_PACKS } from '../presets/catalog'

export interface ChatCapabilityCatalogEntry {
  id: string
  label?: string
}

export interface ChatCapabilityPresetEntry extends ChatCapabilityCatalogEntry {
  extends?: string[]
  skills?: string[]
}

export interface ChatCapabilityManifest {
  schemaVersion: 1
  featureKeys: readonly ChatCliConsumableFeatureKey[]
  presetPropKeys: readonly ChatCliConsumablePresetPropKey[]
  presetSliceKeys: readonly ChatCliConsumablePresetSliceKey[]
  skillPacks: readonly ChatCapabilityCatalogEntry[]
  presets: readonly ChatCapabilityPresetEntry[]
}

export function createChatCapabilityManifest(): ChatCapabilityManifest {
  return {
    schemaVersion: 1,
    featureKeys: CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
    presetPropKeys: CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
    presetSliceKeys: CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
    skillPacks: BUILT_IN_SKILL_PACKS.map((skillPack) => ({
      id: skillPack.id,
      label: skillPack.label,
    })),
    presets: BUILT_IN_AGENT_PRESETS.map((preset) => ({
      id: preset.id,
      label: preset.label,
      extends: 'extends' in preset && preset.extends ? [...preset.extends] : undefined,
      skills: 'skills' in preset && preset.skills ? [...preset.skills] : undefined,
    })),
  }
}

export const CHAT_CAPABILITY_MANIFEST = createChatCapabilityManifest()
