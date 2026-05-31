import type { Ref } from 'vue'
import type { TrMarkdownRenderNode } from '../index.type'
import type { TrMarkdownStreamProfiler } from './streamProfiler'

export type TrMarkdownStreamBlockState = 'revealed' | 'animating' | 'streaming' | 'queued'
export type TrMarkdownStreamBlockUpdateKind = 'init' | 'append' | 'rewrite'
export type TrMarkdownStreamSchedulerPhase = 'idle' | 'streaming' | 'settling' | 'finalized'
export type TrMarkdownStreamTokenPatchSegmentKind = 'equal' | 'insert' | 'delete' | 'replace'
export type TrMarkdownStreamTokenScheduleAction = 'idle' | 'append' | 'patch' | 'reset'
export type TrMarkdownStreamTokenScheduleSegmentAction = 'preserve' | 'reveal' | 'drop'

export interface TrMarkdownStreamSkippedBucket {
  charCount: number
  nodeCount: number
  type: string
}

export interface TrMarkdownStreamBlock {
  key: string
  node: TrMarkdownRenderNode
  animationEligible: boolean
  animationText: string
  skippedCharCount: number
  skippedNodeCount: number
  skippedBuckets: TrMarkdownStreamSkippedBucket[]
  sourceStart?: number
  sourceEnd?: number
}

export interface TrMarkdownStreamBlockDiffResult {
  blocks: TrMarkdownStreamBlock[]
  updateKind: TrMarkdownStreamBlockUpdateKind
  hardReset: boolean
  skippedCharCount: number
  skippedNodeCount: number
  skippedBuckets: TrMarkdownStreamSkippedBucket[]
  rewriteCount: number
  resetRevision: number
}

export interface TrMarkdownStreamTokenPatchSegment {
  kind: TrMarkdownStreamTokenPatchSegmentKind
  previousStart: number
  previousEnd: number
  nextStart: number
  nextEnd: number
  previousText: string
  nextText: string
}

export interface TrMarkdownStreamTokenPatch {
  previousText: string
  nextText: string
  previousTokens: string[]
  nextTokens: string[]
  commonPrefixLength: number
  commonSuffixLength: number
  preservedGraphemeCount: number
  segments: TrMarkdownStreamTokenPatchSegment[]
}

export interface TrMarkdownStreamTokenScheduleSegment extends TrMarkdownStreamTokenPatchSegment {
  action: TrMarkdownStreamTokenScheduleSegmentAction
}

export interface TrMarkdownStreamTokenSchedule {
  action: TrMarkdownStreamTokenScheduleAction
  births: number[]
  deletedCount: number
  insertedCount: number
  patch?: TrMarkdownStreamTokenPatch
  preservedCount: number
  replacedCount: number
  reset: boolean
  revisionChanged: boolean
  segments: TrMarkdownStreamTokenScheduleSegment[]
}

export interface TrMarkdownStreamSchedulerSnapshot {
  activeIndex: number
  animatingIndex: number
  streamingIndex: number
  queueLength: number
  blockCount: number
  charDelay: number
  fadeDuration: number
  settleHoldMs: number
}

export interface TrMarkdownStreamTextAnimationController {
  blockKey?: string
  nowMs: Readonly<Ref<number>>
  fadeDuration: Readonly<Ref<number>>
  profiler?: TrMarkdownStreamProfiler
  revision: Readonly<Ref<number>>
  exhausted: Readonly<Ref<boolean>>
  getBirthAt: (index: number) => number | undefined
}

export interface TrMarkdownNodeAnimationMeta {
  blockKey: string
  state: Extract<TrMarkdownStreamBlockState, 'animating' | 'streaming'>
  controller: TrMarkdownStreamTextAnimationController
}
