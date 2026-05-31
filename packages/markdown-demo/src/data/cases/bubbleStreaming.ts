import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import BubbleMarkdownPreview from '../../components/BubbleMarkdownPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const bubbleStreamingCase: MarkdownDemoCase = {
  id: 'bubble-streaming',
  title: 'Bubble animated streaming',
  description:
    '沿 Bubble 的两条正式接入路径回归 animated streaming：同一套 fixture 同时验证 fallback renderer 与显式 markdown content type 的行为。',
  previewComponent: BubbleMarkdownPreview,
  controlsComponent: MarkdownStreamingControls,
  showStreamingTelemetry: false,
  streamingScenarioIds: ['high-tps-burst', 'settling-append', 'rewrite-reset'],
  controls: {
    content: false,
    variant: false,
    blockMode: false,
    copyable: false,
    defaultExpand: false,
    enableTransformer: false,
    highlightEngine: false,
    inlineColorPreview: false,
    showLanguage: false,
  },
  markdownProps: {
    variant: 'bubble',
    streaming: {
      enabled: true,
      active: true,
      showTail: true,
      showCursor: true,
      smoothingChars: 64,
      mode: 'animated',
      preset: 'balanced',
    },
    code: {
      copyable: false,
      showLanguage: false,
      blockMode: 'overlay',
    },
  },
  initialContent: '## High TPS burst repro\n\n',
}
