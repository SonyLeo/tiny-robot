import { shallowRef, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { toValue } from 'vue'
import type { TrMarkdownRenderNode } from '../index.type'
import { countTextGraphemes } from './grapheme'
import type { TrMarkdownStreamProfiler } from './streamProfiler'
import type { TrMarkdownStreamBlockDiffResult, TrMarkdownStreamBlock } from './streamingAnimation.type'

const textAnimationNodeTypes = new Set([
  'paragraph_open',
  'heading_open',
  'blockquote_open',
  'bullet_list_open',
  'ordered_list_open',
])
const nonAnimatedNodeTypes = new Set([
  'inline-code',
  'task-checkbox',
  'code-block',
  'image',
  'html',
  'table_open',
  'hr',
])

const getNodeFingerprint = (node: TrMarkdownRenderNode) => {
  return `${node.type}:${node.tag || 'node'}`
}

const getNodePositionKey = (node: TrMarkdownRenderNode, index: number) => {
  const sourceStart = node.position?.charStart

  if (typeof sourceStart === 'number') {
    return `${sourceStart}:${getNodeFingerprint(node)}`
  }

  return `${getNodeFingerprint(node)}:${index}`
}

const getFallbackSnippet = (text: string) => {
  return text.replace(/\s+/g, ' ').trim().slice(0, 48) || 'empty'
}

const collectAnimatableText = (node: TrMarkdownRenderNode | undefined): string => {
  if (!node) {
    return ''
  }

  if (node.type === 'text') {
    return node.text || ''
  }

  if (node.type === 'softbreak' || node.type === 'hardbreak') {
    return ''
  }

  if (nonAnimatedNodeTypes.has(node.type)) {
    return ''
  }

  return (node.children || []).map((child) => collectAnimatableText(child)).join('')
}

const collectNodeText = (node: TrMarkdownRenderNode | undefined): string => {
  if (!node) {
    return ''
  }

  if (node.type === 'text' || node.type === 'inline-code' || node.type === 'code-block' || node.type === 'html') {
    return node.text || ''
  }

  if (node.type === 'softbreak' || node.type === 'hardbreak') {
    return ''
  }

  return (node.children || []).map((child) => collectNodeText(child)).join('')
}

const collectSkippedText = (node: TrMarkdownRenderNode | undefined): string => {
  if (!node) {
    return ''
  }

  if (nonAnimatedNodeTypes.has(node.type)) {
    return collectNodeText(node)
  }

  return (node.children || []).map((child) => collectSkippedText(child)).join('')
}

const collectSkippedNodeCount = (node: TrMarkdownRenderNode | undefined): number => {
  if (!node) {
    return 0
  }

  const selfSkipped = nonAnimatedNodeTypes.has(node.type) ? 1 : 0

  return selfSkipped + (node.children || []).reduce((count, child) => count + collectSkippedNodeCount(child), 0)
}

const collectSkippedBuckets = (
  node: TrMarkdownRenderNode | undefined,
  buckets = new Map<string, { charCount: number; nodeCount: number }>(),
) => {
  if (!node) {
    return buckets
  }

  if (nonAnimatedNodeTypes.has(node.type)) {
    const bucket = buckets.get(node.type) || { charCount: 0, nodeCount: 0 }
    bucket.charCount += countTextGraphemes(collectNodeText(node))
    bucket.nodeCount += 1
    buckets.set(node.type, bucket)
  }

  for (const child of node.children || []) {
    collectSkippedBuckets(child, buckets)
  }

  return buckets
}

const resolveBlocks = (nodes: TrMarkdownRenderNode[]): TrMarkdownStreamBlock[] => {
  return nodes.map((node, index) => {
    const animationText = collectAnimatableText(node)
    const skippedText = collectSkippedText(node)
    const baseKey = getNodePositionKey(node, index)
    const key =
      typeof node.position?.charStart === 'number'
        ? baseKey
        : `${baseKey}:${getFallbackSnippet(animationText || node.text || '')}`
    const buckets = [...collectSkippedBuckets(node).entries()].map(([type, bucket]) => ({
      type,
      charCount: bucket.charCount,
      nodeCount: bucket.nodeCount,
    }))

    return {
      key,
      node,
      animationEligible: textAnimationNodeTypes.has(node.type) && animationText.length > 0,
      animationText,
      skippedCharCount: countTextGraphemes(skippedText),
      skippedNodeCount: collectSkippedNodeCount(node),
      skippedBuckets: buckets,
      sourceStart: node.position?.charStart,
      sourceEnd: node.position?.charEnd,
    }
  })
}

const resolveUpdateKind = (
  previousContent: string,
  nextContent: string,
): TrMarkdownStreamBlockDiffResult['updateKind'] => {
  if (!previousContent) {
    return 'init'
  }

  if (nextContent.startsWith(previousContent)) {
    return 'append'
  }

  return 'rewrite'
}

const resolveHardReset = (
  previousBlocks: TrMarkdownStreamBlock[],
  nextBlocks: TrMarkdownStreamBlock[],
  updateKind: TrMarkdownStreamBlockDiffResult['updateKind'],
) => {
  if (updateKind !== 'rewrite') {
    return false
  }

  if (previousBlocks.length !== nextBlocks.length) {
    return true
  }

  return nextBlocks.some((block, index) => {
    const previousBlock = previousBlocks[index]

    if (!previousBlock) {
      return true
    }

    return block.node.type !== previousBlock.node.type || block.node.tag !== previousBlock.node.tag
  })
}

export const useStreamBlockDiff = (
  nodes: MaybeRefOrGetter<TrMarkdownRenderNode[]>,
  stableContent: MaybeRefOrGetter<string>,
  profiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>,
): ShallowRef<TrMarkdownStreamBlockDiffResult> => {
  const result = shallowRef<TrMarkdownStreamBlockDiffResult>({
    blocks: [],
    updateKind: 'init',
    hardReset: false,
    skippedCharCount: 0,
    skippedNodeCount: 0,
    skippedBuckets: [],
    rewriteCount: 0,
    resetRevision: 0,
  })

  let previousContent = ''

  watch(
    [() => toValue(nodes), () => toValue(stableContent)],
    ([nextNodes, nextContent]) => {
      const start = typeof performance === 'undefined' ? Date.now() : performance.now()
      const updateKind = resolveUpdateKind(previousContent, nextContent)
      const nextBlocks = resolveBlocks(nextNodes)
      const hardReset = resolveHardReset(result.value.blocks, nextBlocks, updateKind)
      const rewriteCount = result.value.rewriteCount + (updateKind === 'rewrite' ? 1 : 0)
      const resetRevision = result.value.resetRevision + (hardReset ? 1 : 0)
      const skippedBuckets = nextBlocks.flatMap((block) => block.skippedBuckets)

      result.value = {
        blocks: nextBlocks,
        updateKind,
        hardReset,
        skippedCharCount: nextBlocks.reduce((count, block) => count + block.skippedCharCount, 0),
        skippedNodeCount: nextBlocks.reduce((count, block) => count + block.skippedNodeCount, 0),
        skippedBuckets,
        rewriteCount,
        resetRevision,
      }

      toValue(profiler)?.recordCalculation({
        durationMs: (typeof performance === 'undefined' ? Date.now() : performance.now()) - start,
        itemCount: nextBlocks.length,
        name: 'block-diff',
        textLength: nextContent.length,
      })

      previousContent = nextContent
    },
    {
      immediate: true,
    },
  )

  return result
}
