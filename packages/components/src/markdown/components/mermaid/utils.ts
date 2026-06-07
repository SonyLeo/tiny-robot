import type { TrMarkdownMermaidConfig, TrMarkdownMermaidMode } from '../../index.type'

export interface ResolvedTrMarkdownMermaidConfig {
  copyable?: boolean
  defaultMode: TrMarkdownMermaidMode
  enabled: boolean
}

export const resolveMermaidConfig = (config?: boolean | TrMarkdownMermaidConfig): ResolvedTrMarkdownMermaidConfig => {
  if (!config) {
    return {
      defaultMode: 'preview',
      enabled: false,
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    copyable: options.copyable,
    defaultMode: options.defaultMode ?? 'preview',
    enabled: options.enabled !== false,
  }
}

export const getMermaidTheme = (colorMode: 'light' | 'dark') => {
  return colorMode === 'dark' ? 'dark' : 'default'
}

export const getMermaidErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Failed to render Mermaid diagram.'
}
