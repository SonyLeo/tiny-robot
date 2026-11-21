import { onUnmounted, ref, watch } from 'vue'
import { useTheme } from '../../../theme-provider'
import type { TrMarkdownCodeHighlightEngine } from '../../index.type'
import { highlightCode } from '../../utils/highlight'
import { createHighlightRequestGuard } from './highlightRequestGuard'

export interface UseCodeHighlightOptions {
  getCode: () => string
  getColorMode?: () => 'light' | 'dark'
  getDisplay: () => 'block' | 'inline'
  highlightCode?: typeof highlightCode
  getLanguage?: () => string | undefined
  getHighlight?: () => boolean
  getEngine?: () => TrMarkdownCodeHighlightEngine
  getEnableTransformer?: () => boolean
}

export const useCodeHighlight = (options: UseCodeHighlightOptions) => {
  const { resolvedColorMode } = useTheme()
  const highlightedHtml = ref<string | null>(null)
  const requestGuard = createHighlightRequestGuard()
  let mounted = true
  let previousCode: string | undefined

  const renderHighlighted = async () => {
    const version = requestGuard.begin()
    const code = options.getCode()
    const highlightEnabled = options.getHighlight ? options.getHighlight() : true

    if (!highlightEnabled || !code.trim()) {
      highlightedHtml.value = null
      previousCode = code
      return
    }

    if (previousCode !== undefined && previousCode !== code) {
      highlightedHtml.value = null
    }
    previousCode = code

    // Keep the prior rendering visible while the latest request is pending.
    try {
      const result = await (options.highlightCode || highlightCode)(code, {
        colorMode: options.getColorMode?.() || resolvedColorMode?.value || 'light',
        display: options.getDisplay(),
        enableTransformer: Boolean(options.getEnableTransformer?.()),
        engine: options.getEngine?.() || 'highlightjs',
        language: options.getLanguage?.(),
      })

      if (mounted && requestGuard.isCurrent(version)) {
        highlightedHtml.value = result
      }
    } catch {
      if (mounted && requestGuard.isCurrent(version)) {
        highlightedHtml.value = null
      }
    }
  }

  watch(
    () => [
      options.getCode(),
      options.getDisplay(),
      options.getLanguage?.(),
      options.getHighlight?.(),
      options.getEngine?.() || 'highlightjs',
      options.getEnableTransformer?.(),
      (options.getEngine?.() || 'highlightjs') === 'shiki'
        ? options.getColorMode?.() || resolvedColorMode?.value
        : 'static',
    ],
    renderHighlighted,
    { immediate: true },
  )

  onUnmounted(() => {
    mounted = false
    requestGuard.invalidate()
  })

  return {
    highlightedHtml,
  }
}
