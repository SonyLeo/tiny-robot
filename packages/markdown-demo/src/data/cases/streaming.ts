import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import { streamingDocumentVariants, streamingFullContent } from '../streamingDocument'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const streamingCase: MarkdownDemoCase = {
  id: 'streaming-markdown',
  title: 'Streamdown',
  description:
    '公开层的 `Streamdown` 案例对齐 LobeUI：用一篇完整、连贯、可阅读的 Markdown 回答做主内容，右侧控制只切换语言和播放，不再轮播小 fixture。',
  initialContent: streamingFullContent,
  streamingDocumentVariants,
  showStreamingTelemetry: false,
  controlsComponent: MarkdownStreamingControls,
  controls: {
    content: false,
    blockMode: false,
    copyable: false,
    defaultExpand: false,
    enableTransformer: false,
    highlightEngine: false,
    inlineColorPreview: false,
    showLanguage: false,
  },
  markdownProps: {
    streaming: {
      enabled: true,
      active: true,
      showTail: true,
      showCursor: true,
      smoothingChars: 64,
      mode: 'animated',
      preset: 'balanced',
    },
  },
  sourceCode: {
    language: 'ts',
    code: `const markdownProps = {
  streaming: {
    enabled: true,
    active: true,
    showTail: true,
    showCursor: true,
    smoothingChars: 64,
    mode: 'animated',
    preset: 'balanced',
  },
}`,
  },
}
