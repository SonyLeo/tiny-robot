import type { MermaidConfig, RenderResult } from 'mermaid'
import { getMermaidTheme } from './utils'

type MermaidModule = typeof import('mermaid')

export interface RenderMermaidOptions {
  code: string
  colorMode: 'light' | 'dark'
  id: string
}

let mermaidModulePromise: Promise<MermaidModule['default']> | null = null

const getMermaid = async () => {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then((module) => module.default)
  }

  return mermaidModulePromise
}

const createMermaidConfig = (colorMode: 'light' | 'dark'): MermaidConfig => {
  return {
    darkMode: colorMode === 'dark',
    securityLevel: 'strict',
    startOnLoad: false,
    theme: getMermaidTheme(colorMode),
  }
}

export const renderMermaid = async (options: RenderMermaidOptions): Promise<RenderResult> => {
  const mermaid = await getMermaid()
  mermaid.initialize(createMermaidConfig(options.colorMode))
  await mermaid.parse(options.code, { suppressErrors: false })
  return mermaid.render(options.id, options.code)
}
