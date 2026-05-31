import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import MarkdownVariantsPreview from '../../components/MarkdownVariantsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const streamingVariantsCase: MarkdownDemoCase = {
  id: 'streaming-variants',
  title: 'Animated streaming variants',
  description:
    '把 `default / bubble / article` 三条 `TrMarkdown` 视觉路径放到同一套 animated streaming fixture 下回归，优先覆盖 `high TPS / settling append / rewrite-reset` 三个高风险场景。',
  previewComponent: MarkdownVariantsPreview,
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
  initialContent: '## High TPS burst repro\n\n',
}
