import { h, type VNodeChild } from 'vue'
import type { TrMarkdownContext } from '../context'
import type { TrMarkdownRenderNode } from '../index.type'
import type { TrMarkdownNodeAnimationMeta } from '../stream/streamingAnimation.type'
import { renderBlockNode } from './renderers/blocks'
import { renderCodeNode } from './renderers/code'
import { renderExtensionNode } from './renderers/extensions'
import { renderTextNode } from './renderers/text'
import { resolveComponentProps, type TextAnimationCursor, type TrMarkdownRenderHelpers } from './renderers/shared'

const createChildren = (
  nodes: TrMarkdownRenderNode[] | undefined,
  context: TrMarkdownContext,
  animation?: TrMarkdownNodeAnimationMeta,
  cursor?: TextAnimationCursor,
): VNodeChild[] => {
  return (nodes || []).map((node) => renderNode(node, context, animation, cursor))
}

export const renderNode = (
  node: TrMarkdownRenderNode,
  context: TrMarkdownContext,
  animation?: TrMarkdownNodeAnimationMeta,
  cursor = animation ? { value: 0 } : undefined,
): VNodeChild => {
  const renderChildren = (children: TrMarkdownRenderNode[] | undefined) =>
    createChildren(children, context, animation, cursor)
  const helpers: TrMarkdownRenderHelpers = {
    animation,
    context,
    cursor,
    renderChildren,
    resolveComponentProps: (keys, baseProps) => resolveComponentProps(context, keys, baseProps),
  }

  return (
    renderTextNode(node, helpers) ??
    renderExtensionNode(node, helpers) ??
    renderCodeNode(node, helpers) ??
    renderBlockNode(node, helpers) ??
    h(node.tag || 'div', undefined, renderChildren(node.children))
  )
}
