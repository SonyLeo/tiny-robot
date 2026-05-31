import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const imagesCase: MarkdownDemoCase = {
  id: 'images',
  title: 'Images',
  description: '对齐 LobeUI 的 media 基础案例，验证图片节点在默认主题下的尺寸约束、圆角、阴影和段落混排节奏。',
  initialContent: `![TinyRobot workflow](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80)

这张图片用于确认 \`img\` 节点是否走正式的第一方渲染链路，而不是退回成裸 HTML。`,
}
