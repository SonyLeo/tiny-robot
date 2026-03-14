import type { Component } from 'vue'
import {
  OpenaiIcon,
  ClaudeIcon,
  DeepseekIcon,
  GeminiIcon,
  BailianIcon,
  ModelscopeIcon,
  OpenrouterIcon,
  OllamaIcon,
} from '../components/icons'
import type { ModelOption } from '../types'

/**
 * Default provider icon registry used by chat-level model selectors.
 * Custom apps can override the icon per model via `ModelOption.icon`.
 */
export const PROVIDER_ICON_MAP: Record<string, Component> = {
  openai: OpenaiIcon,
  claude: ClaudeIcon,
  deepseek: DeepseekIcon,
  gemini: GeminiIcon,
  bailian: BailianIcon,
  modelscope: ModelscopeIcon,
  openrouter: OpenrouterIcon,
  ollama: OllamaIcon,
}

export type KnownProvider = keyof typeof PROVIDER_ICON_MAP

export const KNOWN_PROVIDERS = Object.keys(PROVIDER_ICON_MAP) as KnownProvider[]

export function getProviderIcon(model: ModelOption | string): Component | null {
  if (!model) {
    return null
  }

  if (typeof model === 'object' && model !== null) {
    if (model.icon) {
      return model.icon
    }

    return model.provider ? (PROVIDER_ICON_MAP[model.provider.toLowerCase()] ?? null) : null
  }

  return PROVIDER_ICON_MAP[model.toLowerCase()] ?? null
}
