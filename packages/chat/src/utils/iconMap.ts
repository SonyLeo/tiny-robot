/**
 * 图标映射工具
 * 用于管理模型提供商与图标组件的映射关系
 */

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
 * 提供商图标映射表
 * key: 提供商标识
 * value: 对应的图标组件
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

/**
 * 已知的提供商标识类型
 * 从 PROVIDER_ICON_MAP 的 key 派生，提供类型提示
 */
export type KnownProvider = keyof typeof PROVIDER_ICON_MAP

/**
 * 已知提供商列表
 */
export const KNOWN_PROVIDERS = Object.keys(PROVIDER_ICON_MAP) as KnownProvider[]

/**
 * 根据 ModelOption 获取对应的图标组件
 * @param model - ModelOption 对象或模型名称字符串
 * @returns 图标组件，如果未找到则返回 null
 */
export function getProviderIcon(model: ModelOption | string): Component | null {
  if (!model) return null

  // 如果是 ModelOption 对象，使用 provider 字段
  if (typeof model === 'object' && model !== null) {
    return model.provider ? (PROVIDER_ICON_MAP[model.provider.toLowerCase()] ?? null) : null
  }

  // 如果是字符串，直接查表
  return PROVIDER_ICON_MAP[model.toLowerCase()] ?? null
}
