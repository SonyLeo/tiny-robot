import MarkdownStreamingControls from '../../components/MarkdownStreamingControls.vue'
import { trMarkdownStreamingFixtures } from '../../../../components/src/markdown/fixtures/streaming'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

const htmlPreviewDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinyRobot HtmlPreview</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      html,
      body {
        height: 100%;
        margin: 0;
      }

      body {
        display: grid;
        place-items: center;
        padding: 32px;
        box-sizing: border-box;
        background: #101628;
        color: #ffffff;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .panel {
        width: min(100%, 640px);
        min-height: 280px;
        padding: 36px;
        border-radius: 18px;
        background: linear-gradient(180deg, #101628 0%, #0d1322 100%);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
      }

      h1 {
        margin: 0 0 18px;
        font-size: 28px;
        line-height: 1.15;
      }

      p {
        margin: 0 0 14px;
        font-size: 18px;
        line-height: 1.7;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 0.2em 0.6em;
        border-radius: 999px;
        background: #34d3f5;
        color: #0f172a;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <article class="panel">
      <h1>Hello from inside Markdown</h1>
      <p>This block is rendered by <span class="pill">HtmlPreview</span>.</p>
      <p>Scripts run inside an isolated sandbox iframe.</p>
    </article>
  </body>
</html>`

const htmlPreviewFragment = `<div class="panel">
  <h1>Fragment fallback</h1>
  <p>This snippet stays in code view because it is not a full document.</p>
</div>`

const createHtmlFence = (content: string) => `\`\`\`html
${content}
\`\`\``

const getStreamingScenario = (id: string) => {
  const scenario = trMarkdownStreamingFixtures.find((item) => item.id === id)
  if (!scenario) {
    throw new Error(`Missing html preview streaming scenario: ${id}`)
  }

  return scenario
}

const htmlPreviewStreamingControls = {
  content: false,
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

const htmlPreviewStreamingSourceCode = `const markdownProps = {
  streaming: {
    enabled: true,
    active: true,
    showTail: true,
    showCursor: true,
    smoothingChars: 48,
  },
  features: {
    htmlPreview: {
      enabled: true,
      streamingMode: 'auto',
    },
  },
}`

export const htmlPreviewCase: MarkdownDemoCase = {
  id: 'html-preview',
  title: 'HTML preview',
  description:
    '对标 LobeUI 的 HTML preview 案例，验证完整 HTML 文档分流、Preview / Code 切换、复制、下载和 iframe 安全沙箱。',
  deferPreview: true,
  initialContent: createHtmlFence(htmlPreviewDocument),
  markdownProps: {
    features: {
      htmlPreview: {
        enabled: true,
        defaultMode: 'preview',
        copyable: true,
        downloadable: true,
        defaultHeight: 420,
        fileName: 'html-preview.html',
      },
    },
  },
  controls: {
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
  },
  sourceCode: {
    language: 'html',
    code: htmlPreviewDocument,
  },
}

export const htmlPreviewFragmentCase: MarkdownDemoCase = {
  id: 'html-preview-fragment',
  title: 'HTML preview fragment',
  description: '片段不应自动进入 iframe 预览，保持 code 视图更安全也更符合 LobeUI 的判定边界。',
  deferPreview: true,
  initialContent: createHtmlFence(htmlPreviewFragment),
  markdownProps: {
    features: {
      htmlPreview: {
        enabled: true,
      },
    },
  },
  controls: {
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
  },
  sourceCode: {
    language: 'html',
    code: htmlPreviewFragment,
  },
}

export const htmlPreviewStreamingAutoCase: MarkdownDemoCase = {
  id: 'html-preview-streaming-auto',
  title: 'HTML preview streaming auto',
  description:
    '对齐 LobeUI 的 `auto` 模式：无脚本文档在样式头闭合后提前 live mount，带脚本的文档则继续等待 `</html>`。',
  deferPreview: true,
  initialContent: getStreamingScenario('html-preview-auto-noscript').steps[0]?.content || '',
  streamingScenarioIds: ['html-preview-auto-noscript', 'html-preview-auto-script'],
  controlsComponent: MarkdownStreamingControls,
  controls: htmlPreviewStreamingControls,
  markdownProps: {
    streaming: {
      enabled: true,
      active: true,
      showTail: true,
      showCursor: true,
      smoothingChars: 48,
    },
    features: {
      htmlPreview: {
        enabled: true,
        defaultMode: 'preview',
        defaultHeight: 420,
        fileName: 'html-preview-stream-auto.html',
        streamingMode: 'auto',
      },
    },
  },
  sourceCode: {
    language: 'ts',
    code: htmlPreviewStreamingSourceCode,
  },
}

export const htmlPreviewStreamingLiveCase: MarkdownDemoCase = {
  id: 'html-preview-streaming-live',
  title: 'HTML preview streaming live override',
  description:
    '对齐 LobeUI 的 `live` override：即使流式 HTML 里已经出现 `<script>`，在样式头闭合后也会立即进入 iframe 预览。',
  deferPreview: true,
  initialContent: getStreamingScenario('html-preview-auto-script').steps[0]?.content || '',
  streamingScenarioIds: ['html-preview-auto-script'],
  controlsComponent: MarkdownStreamingControls,
  controls: htmlPreviewStreamingControls,
  markdownProps: {
    streaming: {
      enabled: true,
      active: true,
      showTail: true,
      showCursor: true,
      smoothingChars: 48,
    },
    features: {
      htmlPreview: {
        enabled: true,
        defaultMode: 'preview',
        defaultHeight: 420,
        fileName: 'html-preview-stream-live.html',
        streamingMode: 'live',
      },
    },
  },
  sourceCode: {
    language: 'ts',
    code: htmlPreviewStreamingSourceCode.replace("streamingMode: 'auto'", "streamingMode: 'live'"),
  },
}

export const htmlPreviewStreamingDeferCase: MarkdownDemoCase = {
  id: 'html-preview-streaming-defer',
  title: 'HTML preview streaming defer override',
  description:
    '对齐 LobeUI 的 `defer` override：即使当前流式 HTML 不含脚本，也统一等到 `</html>` 到齐后再挂载 iframe。',
  deferPreview: true,
  initialContent: getStreamingScenario('html-preview-auto-noscript').steps[0]?.content || '',
  streamingScenarioIds: ['html-preview-auto-noscript'],
  controlsComponent: MarkdownStreamingControls,
  controls: htmlPreviewStreamingControls,
  markdownProps: {
    streaming: {
      enabled: true,
      active: true,
      showTail: true,
      showCursor: true,
      smoothingChars: 48,
    },
    features: {
      htmlPreview: {
        enabled: true,
        defaultMode: 'preview',
        defaultHeight: 420,
        fileName: 'html-preview-stream-defer.html',
        streamingMode: 'defer',
      },
    },
  },
  sourceCode: {
    language: 'ts',
    code: htmlPreviewStreamingSourceCode.replace("streamingMode: 'auto'", "streamingMode: 'defer'"),
  },
}
