import { h, type VNodeChild } from 'vue'
import StreamAnimatedText from '../../components/stream/StreamAnimatedText.vue'
import { countTextGraphemes } from '../../stream/grapheme'
import type { TrMarkdownRenderNode } from '../../index.type'
import type { TrMarkdownRenderHelpers } from './shared'

export const renderTextNode = (
  node: TrMarkdownRenderNode,
  helpers: TrMarkdownRenderHelpers,
): VNodeChild | undefined => {
  switch (node.type) {
    case 'text':
      if (helpers.animation && helpers.cursor && node.text) {
        const startOffset = helpers.cursor.value
        helpers.cursor.value += countTextGraphemes(node.text)

        return h(StreamAnimatedText, {
          text: node.text,
          startOffset,
          controller: helpers.animation.controller,
        })
      }

      return h('span', { class: 'tr-markdown__text' }, node.text || '')
    case 'softbreak':
    case 'hardbreak':
      return h('br')
    case 'strong':
      return h('strong', helpers.renderChildren(node.children))
    case 'emphasis':
      return h('em', helpers.renderChildren(node.children))
    case 'delete':
      return h('s', helpers.renderChildren(node.children))
    case 'underline':
      return h('ins', { class: 'tr-markdown__underline' }, helpers.renderChildren(node.children))
    case 'subscript':
      return h('sub', { class: 'tr-markdown__subscript' }, helpers.renderChildren(node.children))
    case 'superscript':
      return h('sup', { class: 'tr-markdown__superscript' }, helpers.renderChildren(node.children))
    case 'keyboard':
      return h('kbd', { class: 'tr-markdown__kbd' }, helpers.renderChildren(node.children))
    case 'html':
      return h('span', node.text || '')
    default:
      return undefined
  }
}
