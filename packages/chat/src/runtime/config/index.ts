export { loadChatConfig } from './configLoader'
export { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from './configProjection'
export {
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  createChatCliCapabilitySurface,
} from './chatCli'
export { CHAT_CAPABILITY_MANIFEST, createChatCapabilityManifest } from './capabilities'
export { CHAT_FEATURE_REGISTRY, isChatFeatureExplicitlyDisabled, resolveChatFeatures } from './registry'

export type {
  ChatCliCapabilitySurface,
  ChatCliConsumableFeatureKey,
  ChatCliConsumablePresetPropKey,
  ChatCliConsumablePresetSliceKey,
} from './chatCli'
export type { ChatCapabilityManifest, ChatCapabilityCatalogEntry, ChatCapabilityPresetEntry } from './capabilities'
export type {
  ChatAttachmentsFeatureConfig,
  ChatAttachmentsFeatureResolution,
  BuiltInChatFeatureKey,
  ChatFeatureConfigMap,
  ChatFeatureInput,
  ChatMcpFeatureConfig,
  ChatMcpFeatureResolution,
  ChatFeaturePresetProps,
  ChatFeedbackFeatureConfig,
  ChatFeedbackFeatureResolution,
  ChatHistoryFeatureConfig,
  ChatHistoryFeatureOptions,
  ChatHistoryFeatureResolution,
  ChatSenderActionsFeatureConfig,
  ChatSenderActionsFeatureResolution,
  ChatWelcomePromptsFeatureConfig,
  ChatWelcomePromptsFeatureOptions,
  ChatWelcomePromptsFeatureResolution,
  ResolvedChatFeatures,
} from './featureTypes'

export type {
  ChatAdapter,
  ChatPresetAppearanceSlice,
  ChatConfig,
  ChatConfigDefaults,
  ChatConfigRuntime,
  ChatLayoutConfig,
  ChatLayoutPlacementsConfig,
  ChatConfigModel,
  ChatConfigProvider,
  ChatConfigUI,
  ChatPresetProps,
  ChatPresetHeaderSlice,
  ChatPresetHistorySlice,
  ChatPresetLayoutSlice,
  ChatPresetMessageListSlice,
  ChatPresetModelSelectorSlice,
  ChatPresetRootSlice,
  ChatPresetShellSlice,
  ChatPresetSenderSlice,
  ChatPresetSlices,
  ChatPresetWelcomeSlice,
  OpenAICompatibleProviderConfig,
} from './types'
