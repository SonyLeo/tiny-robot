import type { Component, VNodeChild } from 'vue'

export interface TrMarkdownLinkConfig {
  target?: '_self' | '_blank'
  rel?: string
}

export interface TrMarkdownCitationItem {
  url: string
  title?: string
  alt?: string
  summary?: string
}

export interface TrMarkdownFeatureFlags {
  html?: boolean
  codeBlock?: boolean
  codeHighlight?: boolean
  htmlPreview?: boolean | TrMarkdownHtmlPreviewConfig
  math?: boolean | TrMarkdownMathConfig
  mermaid?: boolean | TrMarkdownMermaidConfig
  footnotes?: boolean | TrMarkdownFootnoteConfig
  alerts?: boolean | TrMarkdownAlertConfig
  imageGallery?: boolean | TrMarkdownImageGalleryConfig
}

export type TrMarkdownCodeBlockMode = 'overlay' | 'full'

export type TrMarkdownCodeHighlightEngine = 'highlightjs' | 'shiki'

export type TrMarkdownHtmlPreviewMode = 'preview' | 'source'

export type TrMarkdownHtmlPreviewStreamingMode = 'auto' | 'live' | 'defer'

export type TrMarkdownMermaidMode = 'preview' | 'source'

export interface TrMarkdownHtmlPreviewConfig {
  enabled?: boolean
  copyable?: boolean
  downloadable?: boolean
  defaultHeight?: number
  defaultMode?: TrMarkdownHtmlPreviewMode
  fileName?: string
  sandbox?: string
  streamingMode?: TrMarkdownHtmlPreviewStreamingMode
}

export interface TrMarkdownMermaidConfig {
  enabled?: boolean
  copyable?: boolean
  defaultMode?: TrMarkdownMermaidMode
}

export interface TrMarkdownMathConfig {
  enabled?: boolean
  copyable?: boolean
}

export interface TrMarkdownFootnoteConfig {
  enabled?: boolean
}

export interface TrMarkdownAlertConfig {
  enabled?: boolean
}

export type TrMarkdownAlertKind = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export interface TrMarkdownImageGalleryConfig {
  enabled?: boolean
  showCaption?: boolean
  closeOnEscape?: boolean
}

export interface TrMarkdownCodeHighlightConfig {
  enabled?: boolean
  engine?: TrMarkdownCodeHighlightEngine
  enableTransformer?: boolean
}

export interface TrMarkdownCodeActionContext {
  code: string
  language?: string
  defaultActions: VNodeChild
  renderDefaultActions: () => VNodeChild
  /**
   * @deprecated Use `defaultActions` or `renderDefaultActions()` instead.
   */
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
  math?: boolean | TrMarkdownMathConfig
  footnotes?: boolean | TrMarkdownFootnoteConfig
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

export interface TrMarkdownAlertRenderContext {
  kind: TrMarkdownAlertKind
  title: string
  node: TrMarkdownRenderNode
  component: Component
  props: Record<string, unknown>
  renderChildren: () => VNodeChild[]
  renderDefault: (overrideProps?: Record<string, unknown>) => VNodeChild
}

export type TrMarkdownAlertRender = (context: TrMarkdownAlertRenderContext) => VNodeChild

export interface TrMarkdownAlertRenderOptions {
  render?: TrMarkdownAlertRender
}

export interface TrMarkdownRenderOptions {
  alerts?: TrMarkdownAlertRenderOptions
}

export interface TrMarkdownParserAdapter {
  name: string
  parse: (source: string, options?: TrMarkdownParserOptions) => Promise<TrMarkdownRenderNode[]>
}

export interface TrMarkdownComponentMap {
  paragraph: Component
  heading: Component
  link: Component
  citation?: Component
  thinkingBlock?: Component
  artifactBlock?: Component
  image: Component
  video?: Component
  inlineCode: Component
  mathInline?: Component
  mathBlock?: Component
  footnoteRef?: Component
  footnoteBlock?: Component
  footnoteItem?: Component
  footnoteBackref?: Component
  alertBlock?: Component
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

export type TrMarkdownComponentPropsMap = Partial<Record<keyof TrMarkdownComponentMap, Record<string, unknown>>>

export interface TrMarkdownProps {
  content?: string
  variant?: 'default' | 'bubble' | 'article'
  citations?: TrMarkdownCitationItem[]
  parser?: TrMarkdownParserAdapter
  parserOptions?: TrMarkdownParserOptions
  renderOptions?: TrMarkdownRenderOptions
  streaming?: boolean | TrMarkdownStreamingConfig
  features?: TrMarkdownFeatureFlags
  code?: TrMarkdownCodeConfig
  link?: TrMarkdownLinkConfig
  components?: Partial<TrMarkdownComponentMap>
  componentProps?: TrMarkdownComponentPropsMap
}
