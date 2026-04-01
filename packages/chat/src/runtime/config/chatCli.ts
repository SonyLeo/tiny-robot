import type { TrChatPresetOverrides } from '@/types'
import { createPresetChatProps, createPresetChatSlices } from './configProjection'
import type { ChatAdapter, ChatPresetProps, ChatPresetSlices } from './types'

export const CHAT_CLI_CONSUMABLE_FEATURE_KEYS = [
  'attachments',
  'senderActions',
  'welcomePrompts',
  'mcp',
  'history',
  'feedback',
] as const
export type ChatCliConsumableFeatureKey = (typeof CHAT_CLI_CONSUMABLE_FEATURE_KEYS)[number]

export const CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS = [
  'attachmentsFeature',
  'senderActionsFeature',
  'prompts',
  'shell',
  'mcpManager',
  'messageListVariant',
  'contentLayout',
  'roleConfigs',
  'showHistory',
  'historyProps',
  'showFeedback',
] as const
export type ChatCliConsumablePresetPropKey = (typeof CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS)[number]

export const CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS = [
  'root',
  'layout',
  'shell',
  'header',
  'welcome',
  'messageList',
  'sender',
  'history',
  'modelSelector',
] as const
export type ChatCliConsumablePresetSliceKey = (typeof CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS)[number]

export interface ChatCliCapabilitySurface {
  featureKeys: readonly ChatCliConsumableFeatureKey[]
  presetProps: Pick<ChatPresetProps & Partial<TrChatPresetOverrides>, ChatCliConsumablePresetPropKey>
  presetSlices: Pick<ChatPresetSlices, ChatCliConsumablePresetSliceKey>
}

export function createChatCliCapabilitySurface(
  adapter: ChatAdapter,
  overrides: Partial<TrChatPresetOverrides> = {},
): ChatCliCapabilitySurface {
  const preset = createPresetChatProps(adapter, overrides)
  const presetSlices = createPresetChatSlices(preset)

  return {
    featureKeys: CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
    presetProps: {
      attachmentsFeature: preset.attachmentsFeature,
      senderActionsFeature: preset.senderActionsFeature,
      prompts: preset.prompts,
      shell: preset.shell,
      mcpManager: preset.mcpManager,
      messageListVariant: preset.messageListVariant,
      contentLayout: preset.contentLayout,
      roleConfigs: preset.roleConfigs,
      showHistory: preset.showHistory,
      historyProps: preset.historyProps,
      showFeedback: preset.showFeedback,
    },
    presetSlices: {
      root: presetSlices.root,
      layout: presetSlices.layout,
      shell: presetSlices.shell,
      header: presetSlices.header,
      welcome: presetSlices.welcome,
      messageList: presetSlices.messageList,
      sender: presetSlices.sender,
      history: presetSlices.history,
      modelSelector: presetSlices.modelSelector,
    },
  }
}
