import { h, VNode } from 'vue'
import type { TrMarkdownContext } from '../context'
import type { TrMarkdownRenderNode } from '../index.type'
import CodeFenceResolver from '../components/code-block/CodeFenceResolver.vue'
import Blockquote from '../components/nodes/Blockquote.vue'
import Heading from '../components/nodes/Heading.vue'
import Hr from '../components/nodes/Hr.vue'
import Image from '../components/nodes/Image.vue'
import InlineCode from '../components/nodes/InlineCode.vue'
import Link from '../components/nodes/Link.vue'
import List from '../components/nodes/List.vue'
import ListItem from '../components/nodes/ListItem.vue'
import Paragraph from '../components/nodes/Paragraph.vue'
import Table from '../components/nodes/Table.vue'
import type { TrMarkdownCodeConfig } from '../index.type'

const headingLevelMap: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
}

const createChildren = (nodes: TrMarkdownRenderNode[] | undefined, context: TrMarkdownContext): VNode[] => {
  return (nodes || []).map((node) => renderNode(node, context))
}

export const renderNode = (node: TrMarkdownRenderNode, context: TrMarkdownContext): VNode => {
  const components = context.components
  const codeConfig = context.code as Required<TrMarkdownCodeConfig>
  const highlightConfig = codeConfig.highlight || {}

  switch (node.type) {
    case 'text':
      return h('span', { class: 'tr-markdown__text' }, node.text || '')
    case 'softbreak':
    case 'hardbreak':
      return h('br')
    case 'paragraph_open':
      return h(components.paragraph || Paragraph, { node }, () => createChildren(node.children, context))
    case 'heading_open':
      return h(components.heading || Heading, { level: headingLevelMap[node.tag || 'h1'] || 1 }, () =>
        createChildren(node.children, context),
      )
    case 'blockquote_open':
      return h(components.blockquote || Blockquote, () => createChildren(node.children, context))
    case 'bullet_list_open':
      return h(components.list || List, { ordered: false }, () => createChildren(node.children, context))
    case 'ordered_list_open':
      return h(components.list || List, { ordered: true }, () => createChildren(node.children, context))
    case 'list_item_open':
      return h(
        components.listItem || ListItem,
        {
          task: Boolean(node.attrs?.task),
          checked: Boolean(node.attrs?.checked),
        },
        () => createChildren(node.children, context),
      )
    case 'task-checkbox':
      return h('input', {
        class: 'tr-markdown__task-checkbox',
        type: 'checkbox',
        checked: Boolean(node.attrs?.checked),
        disabled: true,
        tabindex: -1,
        'aria-hidden': 'true',
      })
    case 'link':
      return h(
        components.link || Link,
        {
          href: typeof node.attrs?.href === 'string' ? node.attrs.href : undefined,
          target: context.link.target,
          rel: context.link.rel,
        },
        () => createChildren(node.children, context),
      )
    case 'image':
      return h(components.image || Image, {
        src: typeof node.attrs?.src === 'string' ? node.attrs.src : undefined,
        alt: typeof node.attrs?.alt === 'string' ? node.attrs.alt : '',
      })
    case 'inline-code':
      return h(components.codeInline || components.inlineCode || InlineCode, {
        code: node.text || '',
        colorPreview: Boolean(codeConfig.inlineColorPreview),
      })
    case 'code-block':
      return h(components.codeFenceResolver || CodeFenceResolver, {
        code: node.text || '',
        language: typeof node.attrs?.language === 'string' ? node.attrs.language : '',
        copyable: codeConfig.copyable !== false,
        showLanguage: codeConfig.showLanguage !== false,
        blockMode: codeConfig.blockMode || 'overlay',
        defaultExpand: codeConfig.defaultExpand !== false,
        highlight: highlightConfig.enabled !== false,
        highlightEngine: highlightConfig.engine || 'highlightjs',
        enableTransformer: Boolean(highlightConfig.enableTransformer),
        actionsRender: codeConfig.actionsRender,
      })
    case 'table_open':
      return h(components.table || Table, () => createChildren(node.children, context))
    case 'thead_open':
    case 'tbody_open':
    case 'tr_open':
    case 'th_open':
    case 'td_open':
      return h(node.tag || 'div', undefined, createChildren(node.children, context))
    case 'hr':
      return h(components.hr || Hr)
    case 'strong':
      return h('strong', createChildren(node.children, context))
    case 'emphasis':
      return h('em', createChildren(node.children, context))
    case 'delete':
      return h('s', createChildren(node.children, context))
    case 'underline':
      return h('ins', { class: 'tr-markdown__underline' }, createChildren(node.children, context))
    case 'subscript':
      return h('sub', { class: 'tr-markdown__subscript' }, createChildren(node.children, context))
    case 'superscript':
      return h('sup', { class: 'tr-markdown__superscript' }, createChildren(node.children, context))
    case 'keyboard':
      return h('kbd', { class: 'tr-markdown__kbd' }, createChildren(node.children, context))
    case 'html':
      return h('span', node.text || '')
    default:
      return h(node.tag || 'div', () => createChildren(node.children, context))
  }
}
