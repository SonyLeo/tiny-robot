import type { Component, VNodeChild } from 'vue'

export interface TrMarkdownLinkConfig {
  target?: '_self' | '_blank'
  rel?: string
}

export interface TrMarkdownFeatureFlags {
  html?: boolean
  codeBlock?: boolean
  codeHighlight?: boolean
}

export type TrMarkdownCodeBlockMode = 'overlay' | 'full'

export type TrMarkdownCodeHighlightEngine = 'highlightjs' | 'shiki'

export interface TrMarkdownCodeHighlightConfig {
  enabled?: boolean
  engine?: TrMarkdownCodeHighlightEngine
  enableTransformer?: boolean
}

export interface TrMarkdownCodeActionContext {
  code: string
  language?: string
  originalNode: VNodeChild
}

export type TrMarkdownCodeActionsRender = (context: TrMarkdownCodeActionContext) => VNodeChild

export interface TrMarkdownCodeConfig {
  copyable?: boolean
  showLanguage?: boolean
  inlineColorPreview?: boolean
  blockMode?: TrMarkdownCodeBlockMode
  defaultExpand?: boolean
  highlight?: TrMarkdownCodeHighlightConfig
  actionsRender?: TrMarkdownCodeActionsRender
}

export interface TrMarkdownParserOptions {
  html?: boolean
  linkify?: boolean
  typographer?: boolean
  breaks?: boolean
}

export type TrMarkdownStreamTailKind = 'text' | 'link' | 'code' | 'table' | 'image'
export type TrMarkdownStreamingMode = 'basic' | 'animated'
export type TrMarkdownStreamingPreset = 'balanced' | 'realtime' | 'silky'

export interface TrMarkdownStreamingProfilerConfig {
  enabled?: boolean
  label?: string
  maxEvents?: number
}

export interface TrMarkdownStreamingConfig {
  enabled?: boolean
  active?: boolean
  showTail?: boolean
  showCursor?: boolean
  smoothingChars?: number
  mode?: TrMarkdownStreamingMode
  preset?: TrMarkdownStreamingPreset
  profile?: boolean | TrMarkdownStreamingProfilerConfig
}

export interface TrMarkdownRenderNodePosition {
  lineStart: number
  lineEnd: number
  charStart: number
  charEnd: number
}

export interface TrMarkdownRenderNode {
  type: string
  tag?: string
  text?: string
  attrs?: Record<string, unknown>
  children?: TrMarkdownRenderNode[]
  position?: TrMarkdownRenderNodePosition
}

export interface TrMarkdownParserAdapter {
  name: string
  parse: (source: string, options?: TrMarkdownParserOptions) => Promise<TrMarkdownRenderNode[]>
}

export interface TrMarkdownComponentMap {
  paragraph: Component
  heading: Component
  link: Component
  image: Component
  inlineCode: Component
  codeInline?: Component
  codeFenceResolver?: Component
  codeBlock: Component
  codeBlockSingleLine?: Component
  blockquote: Component
  list: Component
  listItem: Component
  table: Component
  hr: Component
}

export interface TrMarkdownProps {
  content?: string
  variant?: 'default' | 'bubble' | 'article'
  parser?: TrMarkdownParserAdapter
  parserOptions?: TrMarkdownParserOptions
  streaming?: boolean | TrMarkdownStreamingConfig
  features?: TrMarkdownFeatureFlags
  code?: TrMarkdownCodeConfig
  link?: TrMarkdownLinkConfig
  components?: Partial<TrMarkdownComponentMap>
}
