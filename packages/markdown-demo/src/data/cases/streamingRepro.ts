import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const streamingReproCase: MarkdownDemoCase = {
  id: 'streaming-repro',
  title: 'Character animation loss repro',
  description:
    '公开诊断案例对齐 LobeUI `streamingAnimationRepro`：聚焦 large append、multi-paragraph burst、smoother paragraph、fast chunks、高吞吐和慢速 baseline，专门观察字符 reveal 是否丢帧。',
  initialContent: '## Large append repro\n',
  streamingScenarioIds: [
    'large-append',
    'block-burst-sync',
    'block-burst-via-smoother',
    'fast-small-chunks',
    'ultra-fast-250tps',
    'slow-20tps',
  ],
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
        label: 'streaming-repro',
        maxEvents: 64,
      },
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
