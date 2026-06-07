import { h, type VNodeChild } from 'vue'
import Citation from '../../components/citations/Citation.vue'
import Blockquote from '../../components/nodes/Blockquote.vue'
import Heading from '../../components/nodes/Heading.vue'
import Hr from '../../components/nodes/Hr.vue'
import Image from '../../components/nodes/Image.vue'
import Link from '../../components/nodes/Link.vue'
import List from '../../components/nodes/List.vue'
import ListItem from '../../components/nodes/ListItem.vue'
import Paragraph from '../../components/nodes/Paragraph.vue'
import Table from '../../components/nodes/Table.vue'
import Video from '../../components/nodes/Video.vue'
import type { TrMarkdownRenderNode } from '../../index.type'
import { isCitationHref, resolveCitationRenderProps } from '../citations'
import { headingLevelMap, type TrMarkdownRenderHelpers } from './shared'

export const renderBlockNode = (
  node: TrMarkdownRenderNode,
  helpers: TrMarkdownRenderHelpers,
): VNodeChild | undefined => {
  const components = helpers.context.components

  switch (node.type) {
    case 'paragraph_open':
      return h(components.paragraph || Paragraph, helpers.resolveComponentProps(['paragraph'], { node }), () =>
        helpers.renderChildren(node.children),
      )
    case 'heading_open':
      return h(
        components.heading || Heading,
        helpers.resolveComponentProps(['heading'], { level: headingLevelMap[node.tag || 'h1'] || 1 }),
        () => helpers.renderChildren(node.children),
      )
    case 'blockquote_open':
      return h(components.blockquote || Blockquote, helpers.resolveComponentProps(['blockquote']), () =>
        helpers.renderChildren(node.children),
      )
    case 'bullet_list_open':
      return h(components.list || List, helpers.resolveComponentProps(['list'], { ordered: false }), () =>
        helpers.renderChildren(node.children),
      )
    case 'ordered_list_open':
      return h(components.list || List, helpers.resolveComponentProps(['list'], { ordered: true }), () =>
        helpers.renderChildren(node.children),
      )
    case 'list_item_open':
      return h(
        components.listItem || ListItem,
        helpers.resolveComponentProps(['listItem'], {
          task: Boolean(node.attrs?.task),
          checked: Boolean(node.attrs?.checked),
        }),
        () => helpers.renderChildren(node.children),
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
      if (isCitationHref(typeof node.attrs?.href === 'string' ? node.attrs.href : undefined)) {
        const citationProps = resolveCitationRenderProps(helpers.context.citations, {
          href: typeof node.attrs?.href === 'string' ? node.attrs.href : undefined,
        })

        return h(components.citation || Citation, helpers.resolveComponentProps(['citation'], citationProps))
      }

      return h(
        components.link || Link,
        helpers.resolveComponentProps(['link'], {
          href: typeof node.attrs?.href === 'string' ? node.attrs.href : undefined,
          target: helpers.context.link.target,
          rel: helpers.context.link.rel,
        }),
        () => helpers.renderChildren(node.children),
      )
    case 'image':
      return h(
        components.image || Image,
        helpers.resolveComponentProps(['image'], {
          src: typeof node.attrs?.src === 'string' ? node.attrs.src : undefined,
          alt: typeof node.attrs?.alt === 'string' ? node.attrs.alt : '',
          title: typeof node.attrs?.title === 'string' ? node.attrs.title : undefined,
          previewable: helpers.context.imageGalleryIndexMap?.has(node) && Boolean(helpers.context.openImageGallery),
          galleryIndex: helpers.context.imageGalleryIndexMap?.get(node),
          onPreview: () => {
            const index = helpers.context.imageGalleryIndexMap?.get(node)
            if (typeof index === 'number') {
              helpers.context.openImageGallery?.(index)
            }
          },
        }),
      )
    case 'video':
      return h(
        components.video || Video,
        helpers.resolveComponentProps(['video'], {
          src: typeof node.attrs?.src === 'string' ? node.attrs.src : undefined,
          title: typeof node.attrs?.title === 'string' ? node.attrs.title : undefined,
          poster: typeof node.attrs?.poster === 'string' ? node.attrs.poster : undefined,
          preload: typeof node.attrs?.preload === 'string' ? node.attrs.preload : undefined,
          controls: node.attrs?.controls === 'true',
          autoplay: node.attrs?.autoplay === 'true',
          loop: node.attrs?.loop === 'true',
          muted: node.attrs?.muted === 'true',
          playsinline: node.attrs?.playsinline === 'true',
          crossorigin: typeof node.attrs?.crossorigin === 'string' ? node.attrs.crossorigin : undefined,
          controlslist: typeof node.attrs?.controlslist === 'string' ? node.attrs.controlslist : undefined,
          width: typeof node.attrs?.width === 'string' ? node.attrs.width : undefined,
          height: typeof node.attrs?.height === 'string' ? node.attrs.height : undefined,
        }),
      )
    case 'table_open':
      return h(components.table || Table, helpers.resolveComponentProps(['table']), () =>
        helpers.renderChildren(node.children),
      )
    case 'thead_open':
    case 'tbody_open':
    case 'tr_open':
    case 'th_open':
    case 'td_open':
      return h(node.tag || 'div', undefined, helpers.renderChildren(node.children))
    case 'hr':
      return h(components.hr || Hr, helpers.resolveComponentProps(['hr']))
    default:
      return undefined
  }
}
