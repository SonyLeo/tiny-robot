import type { ChatAdapter } from '@/runtime/config'
import type { ModelOption, TrChatPresetOverrides } from '@/types'
import type { ChatScaffoldCallbacks, TrChatRuntimeInput } from '@/types/scaffold'
import type { Slot, Slots } from 'vue'

export interface ResolveScaffoldInitialModelValueOptions {
  models: ModelOption[]
  defaultModel?: string
  selectedModel?: string
}

export function resolveScaffoldInitialModelValue(options: ResolveScaffoldInitialModelValueOptions): string {
  const { models, defaultModel, selectedModel } = options
  if (!models.length) {
    return ''
  }

  if (selectedModel && models.some((model) => model.value === selectedModel)) {
    return selectedModel
  }

  return defaultModel ?? models[0]?.value ?? ''
}

export function findScaffoldModelByValue(models: ModelOption[], modelValue: string): ModelOption | undefined {
  return models.find((item) => item.value === modelValue)
}

export interface CreateScaffoldResponseProviderOptions {
  adapter: Pick<ChatAdapter, 'createResponseProvider'>
  models: ModelOption[]
  defaultModel?: string
  modelValue?: string
  componentName?: string
}

export function createScaffoldResponseProvider(options: CreateScaffoldResponseProviderOptions) {
  const { adapter, models, defaultModel, modelValue, componentName = 'TrChatScaffold' } = options
  const targetValue = modelValue ?? defaultModel
  const model = models.find((item) => item.value === targetValue) ?? models[0]

  if (!model) {
    throw new Error(`[${componentName}] No models available to create response provider`)
  }

  return adapter.createResponseProvider(model.value)
}

export function shouldManageScaffoldResponseProvider(runtime?: Pick<TrChatRuntimeInput, 'chatKit'>) {
  return !runtime?.chatKit
}

export interface CreateScaffoldPresetOverridesOptions {
  presetOverrides?: Partial<TrChatPresetOverrides>
  models: ModelOption[]
  currentModel?: string
  defaultModel?: string
  runtime?: Pick<TrChatRuntimeInput, 'mcpManager'>
  callbacks?: Pick<ChatScaffoldCallbacks, 'onMessageAction' | 'onModelChange'>
}

export function createScaffoldPresetOverrides(
  options: CreateScaffoldPresetOverridesOptions,
): Partial<TrChatPresetOverrides> & { models: ModelOption[]; defaultModel?: string } {
  const { presetOverrides, models, currentModel, defaultModel, runtime, callbacks } = options

  const overrides = {
    ...presetOverrides,
    models,
    defaultModel: currentModel || defaultModel,
  } as Partial<TrChatPresetOverrides> & {
    models: ModelOption[]
    defaultModel?: string
  }

  if (runtime?.mcpManager !== undefined) {
    overrides.mcpManager = runtime.mcpManager
  }

  if (callbacks?.onMessageAction !== undefined) {
    overrides.onMessageAction = callbacks.onMessageAction
  }

  if (callbacks?.onModelChange !== undefined) {
    overrides.onModelChange = callbacks.onModelChange
  }

  return overrides
}

export function collectScaffoldNamedSlots(slots: Slots): Record<string, Slot> {
  return Object.fromEntries(
    Object.entries(slots).filter(([name]) => name !== 'default' && slots[name] !== undefined),
  ) as Record<string, Slot>
}
