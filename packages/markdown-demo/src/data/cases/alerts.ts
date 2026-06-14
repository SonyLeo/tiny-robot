import type { MarkdownDemoCase } from '../../types/markdownDemo'

const alertsMatrixMarkdown = `> [!NOTE]
> TinyRobot now treats GitHub alerts as first-party callouts.
>
> Regular **markdown** content, [links](https://example.com), and \`code\` still render inside the body.

> [!TIP]
> Keep alert detection inside render so the parser stays lightweight.

> [!IMPORTANT]
> Public docs, demo cases, and Playwright coverage should move together.

> [!WARNING]
> Only GitHub's five official alert kinds are upgraded.

> [!CAUTION]
> Normal blockquotes must not be upgraded accidentally.`

const alertsComparisonMarkdown = `> Plain blockquotes should stay on the default quote path.

> [!TIP] Same-line alerts should also work without leaking the marker into the body.

> [!WARNING]
> The marker should disappear from the first paragraph.
>
> A follow-up paragraph should stay inside the same alert block.`

const alertsBaseControls = {
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

const alertFeatureConfig = {
  alerts: {
    enabled: true,
  },
}

export const alertsMatrixCase: MarkdownDemoCase = {
  id: 'alerts-matrix',
  title: 'GitHub alert matrix',
  description:
    '对齐 LobeUI 的 GitHub alerts 文档区，先把 NOTE / TIP / IMPORTANT / WARNING / CAUTION 五类官方语法一次性公开展示出来。',
  deferPreview: true,
  initialContent: alertsMatrixMarkdown,
  markdownProps: {
    features: alertFeatureConfig,
  },
  controls: alertsBaseControls,
  sourceCode: {
    language: 'md',
    code: alertsMatrixMarkdown,
  },
}

export const alertsComparisonCase: MarkdownDemoCase = {
  id: 'alerts-comparison',
  title: 'Alert vs blockquote',
  description:
    '补一条普通 blockquote 对照案例，同时覆盖 same-line alert 与多段 warning，确保只有 GitHub alert marker 才会升级为 AlertBlock。',
  deferPreview: true,
  initialContent: alertsComparisonMarkdown,
  markdownProps: {
    features: alertFeatureConfig,
  },
  controls: alertsBaseControls,
  sourceCode: {
    language: 'md',
    code: alertsComparisonMarkdown,
  },
}
