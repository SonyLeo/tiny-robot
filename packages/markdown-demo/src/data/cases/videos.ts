import type { MarkdownDemoCase } from '../../types/markdownDemo'

const videoMarkdown = `A standalone \`<video />\` tag should render as a first-party media node instead of falling back to escaped raw HTML.

<video src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" poster="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" controls preload="metadata" />

This path is intentionally narrow: TinyRobot currently treats block-level video embeds as a stable media primitive without opening general raw HTML rendering.`

const videoControls = {
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

export const videosCase: MarkdownDemoCase = {
  id: 'videos',
  title: 'Videos',
  description:
    '对齐 LobeUI 的 media 视频案例，当前支持独立 `<video ... />` block 走第一方节点渲染，保留 controls、poster 和 preload 等基础媒体属性。',
  initialContent: videoMarkdown,
  controls: videoControls,
  sourceCode: {
    language: 'md',
    code: videoMarkdown,
  },
}
