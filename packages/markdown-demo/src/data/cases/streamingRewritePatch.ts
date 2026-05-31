import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const streamingRewritePatchCase: MarkdownDemoCase = {
  id: 'streaming-rewrite-patch',
  title: 'Streaming rewrite patch',
  description:
    '专门验证 token patch：尾部追加应维持 append，段落内部改写应尽量复用未变字符，结构变更才回退 hard reset。',
  initialContent:
    '## Rewrite patch repro\n\nThe assistant starts with a draft sentence that is still subject to change.',
  streamingScenarioIds: ['rewrite-reset'],
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
        label: 'streaming-rewrite-patch',
        maxEvents: 64,
      },
    },
  },
}
