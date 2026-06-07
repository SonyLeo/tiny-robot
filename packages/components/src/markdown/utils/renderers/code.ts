import { h, type VNodeChild } from 'vue'
import CodeFenceResolver from '../../components/code-block/CodeFenceResolver.vue'
import InlineCode from '../../components/nodes/InlineCode.vue'
import type { TrMarkdownCodeConfig, TrMarkdownRenderNode } from '../../index.type'
import type { TrMarkdownRenderHelpers } from './shared'

export const renderCodeNode = (
  node: TrMarkdownRenderNode,
  helpers: TrMarkdownRenderHelpers,
): VNodeChild | undefined => {
  const components = helpers.context.components
  const codeConfig = helpers.context.code as Required<TrMarkdownCodeConfig>
  const highlightConfig = codeConfig.highlight || {}

  switch (node.type) {
    case 'inline-code':
      return h(
        components.codeInline || components.inlineCode || InlineCode,
        helpers.resolveComponentProps(['inlineCode', 'codeInline'], {
          code: node.text || '',
          colorPreview: Boolean(codeConfig.inlineColorPreview),
        }),
      )
    case 'code-block':
      return h(
        components.codeFenceResolver || CodeFenceResolver,
        helpers.resolveComponentProps(['codeFenceResolver'], {
          code: node.text || '',
          language: typeof node.attrs?.language === 'string' ? node.attrs.language : '',
          copyable: codeConfig.copyable !== false,
          showLanguage: codeConfig.showLanguage !== false,
          blockMode: codeConfig.blockMode || 'overlay',
          defaultExpand: codeConfig.defaultExpand !== false,
          highlight: highlightConfig.enabled !== false,
          highlightEngine: highlightConfig.engine || 'highlightjs',
          htmlPreview: helpers.context.features.htmlPreview,
          mermaid: helpers.context.features.mermaid,
          enableTransformer: Boolean(highlightConfig.enableTransformer),
          actionsRender: codeConfig.actionsRender,
        }),
      )
    default:
      return undefined
  }
}
