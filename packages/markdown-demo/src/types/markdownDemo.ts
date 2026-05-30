import type { TrMarkdownProps } from '../../../components/src/markdown'
import type { VNodeChild } from 'vue'

type MarkdownCodeConfig = NonNullable<TrMarkdownProps['code']>
type TrMarkdownCodeBlockMode = NonNullable<MarkdownCodeConfig['blockMode']>
type TrMarkdownCodeHighlightEngine = NonNullable<NonNullable<MarkdownCodeConfig['highlight']>['engine']>

export interface TrMarkdownCodeActionContext {
  code: string
  language?: string
  originalNode: VNodeChild
}

export type TrMarkdownCodeActionsRender = (context: TrMarkdownCodeActionContext) => VNodeChild

export interface MarkdownDemoVisibleControls {
  variant?: boolean
  fontSize?: boolean
  headerMultiple?: boolean
  lineHeight?: boolean
  marginMultiple?: boolean
  copyable?: boolean
  showLanguage?: boolean
  inlineColorPreview?: boolean
  blockMode?: boolean
  highlightEngine?: boolean
  enableTransformer?: boolean
  defaultExpand?: boolean
}

export interface MarkdownDemoSourceCode {
  code: string
  language?: string
}

export interface MarkdownDemoCase {
  id: string
  title: string
  description: string
  initialContent: string
  deferPreview?: boolean
  markdownProps?: Omit<TrMarkdownProps, 'content'>
  controls?: MarkdownDemoVisibleControls
  sourceCode?: MarkdownDemoSourceCode
}

export interface MarkdownDemoSection {
  id: string
  title: string
  description: string
  cases: MarkdownDemoCase[]
}

export interface MarkdownDemoControls {
  content: string
  variant: NonNullable<TrMarkdownProps['variant']>
  fontSize: number
  headerMultiple: number
  lineHeight: number
  marginMultiple: number
  copyable: boolean
  showLanguage: boolean
  inlineColorPreview: boolean
  blockMode: TrMarkdownCodeBlockMode
  highlightEngine: TrMarkdownCodeHighlightEngine
  enableTransformer: boolean
  defaultExpand: boolean
}

export type { TrMarkdownProps }
