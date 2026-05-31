import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type {
  TrMarkdownStreamTailKind,
  TrMarkdownStreamingConfig,
  TrMarkdownStreamingMode,
  TrMarkdownStreamingProfilerConfig,
  TrMarkdownStreamingPreset,
} from '../index.type'
import { resolveIncompleteMarkdown } from './useIncompleteMarkdown'
import { splitMarkdownTail } from './useMarkdownSmoother'

export interface TrMarkdownResolvedStreamingConfig {
  enabled: boolean
  active: boolean
  showTail: boolean
  showCursor: boolean
  smoothingChars: number
  mode: TrMarkdownStreamingMode
  preset: TrMarkdownStreamingPreset
  profile?: boolean | TrMarkdownStreamingProfilerConfig
}

export interface TrMarkdownStreamState {
  stableContent: string
  tailContent: string
  tailKind: TrMarkdownStreamTailKind
  showCursor: boolean
  active: boolean
}

export const resolveStreamingConfig = (
  value: boolean | TrMarkdownStreamingConfig | undefined,
): TrMarkdownResolvedStreamingConfig => {
  if (typeof value === 'boolean') {
    return {
      enabled: value,
      active: value,
      showTail: true,
      showCursor: true,
      smoothingChars: 32,
      mode: 'basic',
      preset: 'balanced',
      profile: false,
    }
  }

  return {
    enabled: value ? value.enabled !== false : false,
    active: value?.active !== false,
    showTail: value?.showTail !== false,
    showCursor: value?.showCursor !== false,
    smoothingChars: Math.max(8, value?.smoothingChars ?? 32),
    mode: value?.mode || 'basic',
    preset: value?.preset || 'balanced',
    profile: value?.profile,
  }
}

export const resolveMarkdownStreamState = (
  content: string,
  config: TrMarkdownResolvedStreamingConfig,
): TrMarkdownStreamState => {
  if (!config.enabled || !config.active) {
    return {
      stableContent: content,
      tailContent: '',
      tailKind: 'text',
      showCursor: false,
      active: false,
    }
  }

  const incompleteState = resolveIncompleteMarkdown(content)
  if (incompleteState) {
    return {
      stableContent: content.slice(0, incompleteState.holdIndex),
      tailContent: config.showTail ? content.slice(incompleteState.holdIndex) : '',
      tailKind: incompleteState.kind,
      showCursor: config.showTail && config.showCursor,
      active: true,
    }
  }

  if (!config.showTail) {
    return {
      stableContent: content,
      tailContent: '',
      tailKind: 'text',
      showCursor: false,
      active: true,
    }
  }

  const smoothState = splitMarkdownTail(content, config.smoothingChars)
  return {
    stableContent: smoothState.stableContent,
    tailContent: smoothState.tailContent,
    tailKind: 'text',
    showCursor: config.showCursor && smoothState.tailContent.length > 0,
    active: true,
  }
}

export const useMarkdownStreamState = (
  content: MaybeRefOrGetter<string>,
  config: MaybeRefOrGetter<TrMarkdownResolvedStreamingConfig>,
): ComputedRef<TrMarkdownStreamState> => {
  return computed(() => resolveMarkdownStreamState(toValue(content), toValue(config)))
}
