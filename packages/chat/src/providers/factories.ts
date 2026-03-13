/**
 * Provider 工厂函数
 * 提供内置的 ModelProviderFactory 创建器，简化用户配置
 */

import type { ModelProviderFactory, OpenAIProviderOptions, DeepSeekProviderOptions } from '../types'
import { createOpenAIProvider } from './openai'
import { createDeepSeekProvider } from './deepseek'

/**
 * 创建 provider 匹配函数
 * @param provider - 提供商标识
 * @returns 匹配函数
 */
export function matchProvider(provider: string) {
  return (model: { provider?: string }): boolean => model.provider === provider
}

/**
 * 创建 OpenAI Provider 工厂
 * @param options - OpenAI 配置选项（不包括 model，会从 ModelOption.value 获取）
 * @returns ModelProviderFactory
 */
export function createOpenAIFactory(options: Omit<OpenAIProviderOptions, 'model'>): ModelProviderFactory {
  return {
    match: matchProvider('openai'),
    createProvider: (model) =>
      createOpenAIProvider({
        ...options,
        model: model.value,
      }),
  }
}

/**
 * 创建 DeepSeek Provider 工厂
 * @param options - DeepSeek 配置选项（不包括 model，会从 ModelOption.value 获取）
 * @returns ModelProviderFactory
 */
export function createDeepSeekFactory(options: Omit<DeepSeekProviderOptions, 'model'>): ModelProviderFactory {
  return {
    match: matchProvider('deepseek'),
    createProvider: (model) =>
      createDeepSeekProvider({
        ...options,
        model: model.value,
      }),
  }
}
