import { ref, watch } from 'vue'
import { useTheme } from '../../../theme-provider'
import type { TrMarkdownCodeHighlightEngine } from '../../index.type'
import { highlightCode } from '../../utils/highlight'

export interface UseCodeHighlightOptions {
  getCode: () => string
  getDisplay: () => 'block' | 'inline'
  getLanguage?: () => string | undefined
  getHighlight?: () => boolean
  getEngine?: () => TrMarkdownCodeHighlightEngine
  getEnableTransformer?: () => boolean
}

export const useCodeHighlight = (options: UseCodeHighlightOptions) => {
  const { resolvedColorMode } = useTheme()
  const highlightedHtml = ref<string | null>(null)

  const renderHighlighted = async () => {
    const code = options.getCode()
    const highlightEnabled = options.getHighlight ? options.getHighlight() : true

    if (!highlightEnabled || !code.trim()) {
      highlightedHtml.value = null
      return
    }

    highlightedHtml.value = await highlightCode(code, {
      colorMode: resolvedColorMode?.value || 'light',
      display: options.getDisplay(),
      enableTransformer: Boolean(options.getEnableTransformer?.()),
      engine: options.getEngine?.() || 'highlightjs',
      language: options.getLanguage?.(),
    })
  }

  watch(
    () => [
      options.getCode(),
      options.getDisplay(),
      options.getLanguage?.(),
      options.getHighlight?.(),
      options.getEngine?.() || 'highlightjs',
      options.getEnableTransformer?.(),
      (options.getEngine?.() || 'highlightjs') === 'shiki' ? resolvedColorMode?.value : 'static',
    ],
    renderHighlighted,
    { immediate: true },
  )

  return {
    highlightedHtml,
  }
}
