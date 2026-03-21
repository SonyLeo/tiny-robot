import type { Component } from 'vue'
import type { ResponseProvider } from './core'

export interface OpenAIProviderOptions {
  apiKey: string
  model?: string
  baseURL?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface DeepSeekProviderOptions {
  apiKey: string
  model?: string
  systemPrompt?: string
  temperature?: number
}

export interface ModelOption {
  value: string
  label?: string
  provider?: string
  icon?: Component
  disabled?: boolean
}

export interface ModelProviderFactory {
  match: (model: ModelOption) => boolean
  createProvider: (model: ModelOption) => ResponseProvider
}

export type ProviderFactoryCreator<T extends Record<string, unknown>> = (options: T) => ModelProviderFactory
