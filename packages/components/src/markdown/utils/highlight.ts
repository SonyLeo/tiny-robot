import type { TrMarkdownCodeHighlightEngine } from '../index.type'
import { getCodeLanguageMeta, normalizeCodeLanguage } from './code'

type HighlightCoreModule = typeof import('highlight.js/lib/core')
type ShikiTransformersModule = typeof import('@shikijs/transformers')
type ShikiTheme = 'github-dark' | 'github-light'
type ShikiCodeToHtml = (
  code: string,
  options: {
    lang: string
    theme: ShikiTheme
    transformers?: unknown[]
  },
) => Promise<string>

export interface HighlightCodeOptions {
  language?: string
  engine?: TrMarkdownCodeHighlightEngine
  enableTransformer?: boolean
  display?: 'block' | 'inline'
  colorMode?: 'light' | 'dark'
}

let highlightCorePromise: Promise<HighlightCoreModule> | null = null
let shikiCodeToHtmlPromise: Promise<ShikiCodeToHtml> | null = null
let shikiTransformersPromise: Promise<ShikiTransformersModule> | null = null

const highlightCache = new Map<string, Promise<string | null>>()
const MAX_HIGHLIGHT_CACHE_SIZE = 200

const shikiLanguageModules = {
  bash: () => import('@shikijs/langs/bash'),
  css: () => import('@shikijs/langs/css'),
  diff: () => import('@shikijs/langs/diff'),
  html: () => import('@shikijs/langs/html'),
  javascript: () => import('@shikijs/langs/javascript'),
  json: () => import('@shikijs/langs/json'),
  jsx: () => import('@shikijs/langs/jsx'),
  markdown: () => import('@shikijs/langs/markdown'),
  tsx: () => import('@shikijs/langs/tsx'),
  typescript: () => import('@shikijs/langs/typescript'),
  xml: () => import('@shikijs/langs/xml'),
} as const

const shikiThemeModules = {
  'github-dark': () => import('@shikijs/themes/github-dark'),
  'github-light': () => import('@shikijs/themes/github-light'),
} as const

const supportedShikiLanguages = new Set<string>(Object.keys(shikiLanguageModules))

const languageModules = {
  bash: () => import('highlight.js/lib/languages/bash'),
  css: () => import('highlight.js/lib/languages/css'),
  diff: () => import('highlight.js/lib/languages/diff'),
  html: () => import('highlight.js/lib/languages/xml'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  js: () => import('highlight.js/lib/languages/javascript'),
  json: () => import('highlight.js/lib/languages/json'),
  jsx: () => import('highlight.js/lib/languages/javascript'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  md: () => import('highlight.js/lib/languages/markdown'),
  sh: () => import('highlight.js/lib/languages/bash'),
  shell: () => import('highlight.js/lib/languages/bash'),
  ts: () => import('highlight.js/lib/languages/typescript'),
  tsx: () => import('highlight.js/lib/languages/typescript'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  xml: () => import('highlight.js/lib/languages/xml'),
} as const

const ensureHighlightCacheSize = () => {
  while (highlightCache.size > MAX_HIGHLIGHT_CACHE_SIZE) {
    const firstKey = highlightCache.keys().next().value
    if (!firstKey) break
    highlightCache.delete(firstKey)
  }
}

const readHighlightCache = (key: string, factory: () => Promise<string | null>) => {
  const cached = highlightCache.get(key)
  if (cached) return cached

  const promise = factory()
  highlightCache.set(key, promise)
  ensureHighlightCacheSize()
  return promise
}

const getHighlightCore = async () => {
  if (!highlightCorePromise) {
    highlightCorePromise = import('highlight.js/lib/core')
  }

  return highlightCorePromise
}

const getShikiCodeToHtml = async () => {
  if (!shikiCodeToHtmlPromise) {
    shikiCodeToHtmlPromise = (async () => {
      const shiki = await import('shiki/core')
      const { createJavaScriptRegexEngine } = await import('shiki/engine/javascript')

      const createHighlighter = shiki.createdBundledHighlighter({
        langs: shikiLanguageModules,
        themes: shikiThemeModules,
        engine: createJavaScriptRegexEngine,
      })

      const { codeToHtml } = shiki.createSingletonShorthands(createHighlighter)
      return codeToHtml as ShikiCodeToHtml
    })()
  }

  return shikiCodeToHtmlPromise
}

const ensureHighlightJsLanguage = async (language?: string) => {
  const normalized = normalizeCodeLanguage(language)
  if (!normalized) return 'plaintext'

  const loader = languageModules[normalized as keyof typeof languageModules]
  if (!loader) return 'plaintext'

  const hljs = await getHighlightCore()
  if (!hljs.default.getLanguage(normalized)) {
    const mod = await loader()
    hljs.default.registerLanguage(normalized, mod.default)
  }

  return normalized
}

const highlightWithHighlightJs = async (code: string, options: HighlightCodeOptions) => {
  const lang = await ensureHighlightJsLanguage(options.language)
  if (lang === 'plaintext') {
    return null
  }

  const hljs = await getHighlightCore()
  const { value } = hljs.default.highlight(code, {
    language: lang,
    ignoreIllegals: true,
  })

  if (options.display === 'inline') {
    return `<code class="hljs language-${lang}">${value}</code>`
  }

  return `<code class="hljs language-${lang}">${value}</code>`
}

const highlightWithShiki = async (code: string, options: HighlightCodeOptions) => {
  const { shiki: shikiLanguage } = getCodeLanguageMeta(options.language)
  const normalizedLanguage = shikiLanguage && supportedShikiLanguages.has(shikiLanguage) ? shikiLanguage : 'text'
  const theme: ShikiTheme = options.colorMode === 'dark' ? 'github-dark' : 'github-light'
  const codeToHtml = await getShikiCodeToHtml()
  const transformerOptions = {
    matchAlgorithm: 'v3' as const,
  }

  const transformers = options.enableTransformer
    ? await getShikiTransformers().then((module) => [
        module.transformerNotationDiff(transformerOptions),
        module.transformerNotationHighlight(transformerOptions),
        module.transformerNotationFocus(transformerOptions),
        module.transformerNotationWordHighlight(transformerOptions),
        module.transformerNotationErrorLevel(transformerOptions),
      ])
    : undefined

  return codeToHtml(code, {
    lang: normalizedLanguage,
    theme,
    transformers,
  })
}

export const highlightCode = async (code: string, options: HighlightCodeOptions = {}) => {
  const {
    colorMode = 'light',
    display = 'block',
    enableTransformer = false,
    engine = 'highlightjs',
    language,
  } = options

  const cacheKey = [
    engine,
    display,
    engine === 'shiki' && display === 'block' ? colorMode : 'static',
    enableTransformer ? '1' : '0',
    normalizeCodeLanguage(language),
    code,
  ].join('::')

  return readHighlightCache(cacheKey, async () => {
    try {
      if (engine === 'shiki' && display === 'block') {
        return await highlightWithShiki(code, {
          colorMode,
          display,
          enableTransformer,
          engine,
          language,
        })
      }

      return await highlightWithHighlightJs(code, {
        colorMode,
        display,
        enableTransformer,
        engine,
        language,
      })
    } catch {
      return null
    }
  })
}

const getShikiTransformers = async () => {
  if (!shikiTransformersPromise) {
    shikiTransformersPromise = import('@shikijs/transformers')
  }

  return shikiTransformersPromise
}
