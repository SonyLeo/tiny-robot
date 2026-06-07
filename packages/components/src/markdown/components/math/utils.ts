import type { TrMarkdownMathConfig } from '../../index.type'

export interface ResolvedTrMarkdownMathConfig {
  copyable?: boolean
  enabled: boolean
}

export const resolveMathConfig = (config?: boolean | TrMarkdownMathConfig): ResolvedTrMarkdownMathConfig => {
  if (!config) {
    return {
      enabled: false,
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    copyable: options.copyable,
    enabled: options.enabled !== false,
  }
}

export const getKatexErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Failed to render math formula.'
}
