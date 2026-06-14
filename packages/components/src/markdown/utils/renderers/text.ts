import { h, type VNodeChild } from 'vue'
import StreamAnimatedText from '../../components/stream/StreamAnimatedText.vue'
import { countTextGraphemes } from '../../stream/grapheme'
import { sanitizeMarkdownHtml, sanitizeMarkdownHtmlElement } from '../html'
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
    case 'html-inline': {
      const resolvedElement = sanitizeMarkdownHtmlElement(node.tag || '', node.attrs)

      if (!resolvedElement) {
        return undefined
      }

      return h(
        resolvedElement.tag,
        {
          ...resolvedElement.attrs,
          class: ['tr-markdown__html-inline', resolvedElement.attrs?.class],
        },
        helpers.renderChildren(node.children),
      )
    }
    case 'html-inline-raw':
      return h('span', {
        class: 'tr-markdown__html-inline-raw',
        innerHTML: sanitizeMarkdownHtml(node.text || ''),
      })
    case 'html-block':
      return h('div', {
        class: 'tr-markdown__html',
        innerHTML: sanitizeMarkdownHtml(node.text || ''),
      })
    default:
      return undefined
  }
}
