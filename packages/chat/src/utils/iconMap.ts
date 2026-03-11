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
} from '../components/icons'

/**
 * 提供商图标映射表
 * key: 模型名称中的关键字
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
}

/**
 * 根据模型名称获取对应的图标组件
 * @param model - 模型名称
 * @returns 图标组件，如果未找到则返回 null
 */
export function getProviderIcon(model: string): Component | null {
  if (!model) return null

  const lowerModel = model.toLowerCase()

  for (const [key, icon] of Object.entries(PROVIDER_ICON_MAP)) {
    if (lowerModel.includes(key)) {
      return icon
    }
  }

  return null
}
