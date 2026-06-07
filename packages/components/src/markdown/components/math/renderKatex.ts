import type { KatexOptions } from 'katex'
import { getKatexErrorMessage } from './utils'

type KatexModule = typeof import('katex')

export interface RenderKatexOptions {
  displayMode: boolean
  formula: string
}

export interface RenderKatexResult {
  errorMessage: string
  html: string
  isError: boolean
}

const KATEX_STYLESHEET_MARKER = 'tr-markdown-katex-stylesheet'

let katexModulePromise: Promise<KatexModule['default']> | null = null
let katexStylesPromise: Promise<void> | null = null

const ensureKatexStyles = async () => {
  if (typeof document === 'undefined') {
    return
  }

  if (!katexStylesPromise) {
    katexStylesPromise = import('katex/dist/katex.min.css?url').then(({ default: stylesheetUrl }) => {
      const existingStylesheet = document.querySelector<HTMLLinkElement>(
        `link[data-tr-markdown="${KATEX_STYLESHEET_MARKER}"]`,
      )

      if (existingStylesheet) {
        return
      }

      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = stylesheetUrl
        link.setAttribute('data-tr-markdown', KATEX_STYLESHEET_MARKER)
        link.onload = () => resolve()
        link.onerror = () => reject(new Error('Failed to load KaTeX stylesheet.'))
        document.head.appendChild(link)
      })
    })
  }

  return katexStylesPromise
}

const getKatex = async () => {
  if (!katexModulePromise) {
    katexModulePromise = import('katex').then((module) => module.default)
  }

  return katexModulePromise
}

const createKatexOptions = (displayMode: boolean): KatexOptions => {
  return {
    displayMode,
    errorColor: '#d03050',
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  }
}

export const renderKatex = async (options: RenderKatexOptions): Promise<RenderKatexResult> => {
  await ensureKatexStyles()
  const katex = await getKatex()
  const renderOptions = createKatexOptions(options.displayMode)
  const html = katex.renderToString(options.formula, renderOptions)
  const isError = html.includes('katex-error')

  if (!isError) {
    return {
      errorMessage: '',
      html,
      isError: false,
    }
  }

  let errorMessage = ''

  try {
    katex.renderToString(options.formula, {
      ...renderOptions,
      throwOnError: true,
    })
  } catch (error) {
    errorMessage = getKatexErrorMessage(error)
  }

  return {
    errorMessage,
    html,
    isError: true,
  }
}
