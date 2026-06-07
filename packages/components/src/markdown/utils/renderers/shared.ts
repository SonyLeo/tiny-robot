import { mergeProps, type VNodeChild } from 'vue'
import type { TrMarkdownContext } from '../../context'
import type { TrMarkdownComponentMap, TrMarkdownRenderNode } from '../../index.type'
import type { TrMarkdownNodeAnimationMeta } from '../../stream/streamingAnimation.type'

export const headingLevelMap: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
}

export type TextAnimationCursor = {
  value: number
}

export type TrMarkdownComponentKey = keyof TrMarkdownComponentMap

export interface TrMarkdownRenderHelpers {
  animation?: TrMarkdownNodeAnimationMeta
  context: TrMarkdownContext
  cursor?: TextAnimationCursor
  renderChildren: (nodes: TrMarkdownRenderNode[] | undefined) => VNodeChild[]
  resolveComponentProps: (
    keys: readonly TrMarkdownComponentKey[],
    baseProps?: Record<string, unknown>,
  ) => Record<string, unknown>
}

export const resolveComponentProps = (
  context: TrMarkdownContext,
  keys: readonly TrMarkdownComponentKey[],
  baseProps: Record<string, unknown> = {},
) => {
  return keys.reduce<Record<string, unknown>>((resolvedProps, key) => {
    const overrideProps = context.componentProps[key]
    return overrideProps ? mergeProps(resolvedProps, overrideProps) : resolvedProps
  }, baseProps)
}
