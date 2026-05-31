import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import { streamingDocumentVariants, streamingFullContent } from '../streamingDocument'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const streamingProfilerCase: MarkdownDemoCase = {
  id: 'streaming-profiler',
  title: 'Streamdown profiler',
  description:
    '公开层把 telemetry 观察面单独提出来，对齐 LobeUI `Streamdown Profiler` 的职责，但仍复用同一篇完整文档，只额外打开 profiler 面板观察 queue、parse 和 timeline。',
  initialContent: streamingFullContent,
  streamingDocumentVariants,
  showStreamingTelemetry: true,
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
      profile: {
        enabled: true,
        label: 'streaming-profiler',
        maxEvents: 64,
      },
    },
  },
}
