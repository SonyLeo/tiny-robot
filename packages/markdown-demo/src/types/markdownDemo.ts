import type { TrMarkdownProps } from '@opentiny/tiny-robot'
import type { Component, VNodeChild } from 'vue'
import type { TrMarkdownStreamingFixtureScenario } from '../../../components/src/markdown/fixtures/streaming'

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
  content?: boolean
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

export interface MarkdownStreamingDocumentVariant {
  id: string
  label: string
  content: string
  streamingScenarios?: TrMarkdownStreamingFixtureScenario[]
}

export interface MarkdownStreamingTelemetry {
  state: 'idle' | 'streaming' | 'settling' | 'finalized'
  schedulerPhase: 'idle' | 'streaming' | 'settling' | 'finalized'
  updateKind: 'init' | 'append' | 'rewrite'
  hardReset: boolean
  skippedCharCount: number
  skippedNodeCount: number
  skippedBuckets: string
  queueLength: number
  blockCount: number
  activeIndex: number
  animatingIndex: number
  streamingIndex: number
  charDelay: number
  fadeDuration: number
  settleHoldMs: number
  activeBlockCount: number
  revealedCount: number
  pendingCount: number
  liveCharCount: number
  rewriteCount: number
  resetCount: number
  parseCount: number
  profilerEnabled: boolean
  profilerEventCount: number
  profilerLastEvent: string
  profilerTimeline: string[]
  profilerInputCount: number
  profilerInputAppendChars: number
  profilerInputRewriteCount: number
  profilerParseCount: number
  profilerParseAvgMs: number
  profilerBlockDiffCount: number
  profilerBlockDiffAvgMs: number
  profilerQueueTransitionCount: number
  profilerSettleCount: number
  profilerFinalizeCount: number
  profilerAnimationFrameCount: number
  profilerRevealFrameCount: number
  profilerSkippedFrameCount: number
  profilerSlowFrameCount: number
  profilerFrameAvgMs: number
  profilerFrameLastMs: number
  profilerFrameMaxMs: number
  profilerFrameIntervalAvgMs: number
  profilerFpsSampleCount: number
  profilerFpsCurrent: number
  profilerFpsAvg: number
  profilerFpsMin: number
  profilerFpsMax: number
  profilerFpsIndex: number
  profilerMaxBacklog: number
  profilerLastBacklog: number
  profilerRootCommitCount: number
  profilerRootCommitAvgMs: number
  profilerRootCommitLastMs: number
  profilerRootCommitMaxMs: number
  profilerRootCommitLastPhase: string
  profilerRootCommitLastBlockCount: number
  profilerRootCommitLastTextLength: number
  profilerRootCommitMountCount: number
  profilerRootCommitUpdateCount: number
  profilerBlockCommitCount: number
  profilerBlockCommitAvgMs: number
  profilerBlockCommitLastMs: number
  profilerBlockCommitMaxMs: number
  profilerBlockCommitLastState: string
  profilerTrackedBlockCount: number
  profilerBlockCommitMountCount: number
  profilerBlockCommitUpdateCount: number
  profilerTokenScheduleCount: number
  profilerTokenScheduleAvgMs: number
  profilerTokenPreservedCount: number
  profilerTokenInsertedCount: number
  profilerTokenDeletedCount: number
  profilerTokenReplacedCount: number
}

export interface MarkdownDemoCase {
  id: string
  title: string
  description: string
  initialContent: string
  deferPreview?: boolean
  streamingDocumentVariants?: MarkdownStreamingDocumentVariant[]
  streamingScenarios?: TrMarkdownStreamingFixtureScenario[]
  streamingScenarioIds?: string[]
  showStreamingTelemetry?: boolean
  markdownProps?: Omit<TrMarkdownProps, 'content'>
  controls?: MarkdownDemoVisibleControls
  controlsComponent?: Component
  previewComponent?: Component
  sourceCode?: MarkdownDemoSourceCode
}

export interface MarkdownDemoSection {
  id: string
  title: string
  description: string
  cases: MarkdownDemoCase[]
}

export interface MarkdownDemoApiRow {
  name: string
  description: string
  type: string
  defaultValue: string
}

export interface MarkdownDemoControls {
  content: string
  variant: NonNullable<TrMarkdownProps['variant']>
  streamingActive: boolean
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

export interface MarkdownDemoPreviewProps {
  controls: MarkdownDemoControls
  markdownProps: Omit<TrMarkdownProps, 'content'>
  markdownStyle: Record<string, string>
}

export interface MarkdownDemoControlPanelProps extends MarkdownDemoPreviewProps {
  demoCase: MarkdownDemoCase
  setContent: (content: string) => void
  setStreamingActive: (active: boolean) => void
  streamingTelemetry?: MarkdownStreamingTelemetry
}

export type { TrMarkdownProps }
