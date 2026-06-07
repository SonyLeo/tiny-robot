import type { TrMarkdownImageGalleryConfig, TrMarkdownRenderNode } from '../index.type'

export interface ResolvedTrMarkdownImageGalleryConfig {
  enabled: boolean
  showCaption: boolean
  closeOnEscape: boolean
}

export interface TrMarkdownImageGalleryItem {
  id: string
  src: string
  alt: string
  title?: string
}

export interface TrMarkdownImageGalleryCollection {
  items: TrMarkdownImageGalleryItem[]
  indexMap: WeakMap<TrMarkdownRenderNode, number>
}

export const resolveImageGalleryConfig = (
  config?: boolean | TrMarkdownImageGalleryConfig,
): ResolvedTrMarkdownImageGalleryConfig => {
  if (!config) {
    return {
      enabled: false,
      showCaption: true,
      closeOnEscape: true,
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    enabled: options.enabled !== false,
    showCaption: options.showCaption !== false,
    closeOnEscape: options.closeOnEscape !== false,
  }
}

const visitRenderNodes = (nodes: TrMarkdownRenderNode[] | undefined, visitor: (node: TrMarkdownRenderNode) => void) => {
  for (const node of nodes || []) {
    visitor(node)

    if (node.children?.length) {
      visitRenderNodes(node.children, visitor)
    }
  }
}

export const collectImageGalleryItems = (nodes: TrMarkdownRenderNode[]): TrMarkdownImageGalleryCollection => {
  const items: TrMarkdownImageGalleryItem[] = []
  const indexMap = new WeakMap<TrMarkdownRenderNode, number>()

  visitRenderNodes(nodes, (node) => {
    if (node.type !== 'image') {
      return
    }

    const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''
    if (!src) {
      return
    }

    const index = items.length
    const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
    const title = typeof node.attrs?.title === 'string' ? node.attrs.title : undefined

    items.push({
      id: `${index}:${src}`,
      src,
      alt,
      title,
    })
    indexMap.set(node, index)
  })

  return {
    items,
    indexMap,
  }
}

export const resolveImageGalleryCaption = (item: TrMarkdownImageGalleryItem | undefined, showCaption: boolean) => {
  if (!item || !showCaption) {
    return ''
  }

  return item.title || item.alt || ''
}
