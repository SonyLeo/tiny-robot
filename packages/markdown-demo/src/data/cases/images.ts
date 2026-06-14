import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const imagesCase: MarkdownDemoCase = {
  id: 'images',
  title: 'Images',
  description: '对齐 LobeUI 的 media 基础案例，验证图片节点在默认主题下的尺寸约束、圆角、阴影和段落混排节奏。',
  initialContent: `![TinyRobot workflow](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80)

这张图片用于确认 \`img\` 节点是否走正式的第一方渲染链路，而不是退回成裸 HTML。`,
}

const imageGalleryMarkdown = `![Desk setup](https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80 "Desk setup")

这组图片用于对齐 LobeUI 的动态预览路径。开启 \`features.imageGallery\` 后，图片会升级为 markdown 自己持有的 gallery trigger，而不是依赖外部附件预览链路。

![Ops wall](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80 "Ops wall")

![Team board](https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80 "Team board")`

const imageGalleryControls = {
  content: true,
  variant: false,
  fontSize: false,
  headerMultiple: false,
  lineHeight: false,
  marginMultiple: false,
  copyable: false,
  showLanguage: false,
  inlineColorPreview: false,
  blockMode: false,
  highlightEngine: false,
  enableTransformer: false,
  defaultExpand: false,
} as const

export const imageGalleryCase: MarkdownDemoCase = {
  id: 'image-gallery',
  title: 'Image gallery',
  description:
    '对齐 LobeUI 的多图预览体验：默认图片节点保持轻量，显式开启 `features.imageGallery` 后支持点击放大、多图切换、caption 和键盘关闭。',
  deferPreview: true,
  initialContent: imageGalleryMarkdown,
  markdownProps: {
    features: {
      imageGallery: {
        enabled: true,
        showCaption: true,
        closeOnEscape: true,
      },
    },
  },
  controls: imageGalleryControls,
  sourceCode: {
    language: 'md',
    code: imageGalleryMarkdown,
  },
}
