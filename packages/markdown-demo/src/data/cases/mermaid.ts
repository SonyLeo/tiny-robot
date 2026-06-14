import type { MarkdownDemoCase } from '../../types/markdownDemo'

const mermaidFlowchart = `flowchart TD
  User[User prompt] --> Planner{Freeze plan}
  Planner --> Implement[Implement Mermaid block]
  Implement --> Verify[Verify demo and tests]
  Verify --> Ship[Ship markdown update]
`

const mermaidSequence = `sequenceDiagram
  participant User
  participant TinyRobot
  User->>TinyRobot: Continue the Mermaid milestone
  TinyRobot-->>User: Preview the rendered diagram
  TinyRobot-->>User: Toggle back to source when needed
`

const mermaidInvalid = `flowchart TD
  Start -->
`

const createMermaidFence = (content: string) => `\`\`\`mermaid
${content}
\`\`\``

const mermaidBaseControls = {
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

const mermaidFeatureConfig = {
  mermaid: {
    enabled: true,
    defaultMode: 'preview' as const,
  },
}

export const mermaidFlowchartCase: MarkdownDemoCase = {
  id: 'mermaid-flowchart',
  title: 'Mermaid flowchart',
  description: '对齐 LobeUI 的图表场景，验证 `mermaid` fenced block 的动态加载、主题联动与 preview/source 切换。',
  deferPreview: true,
  initialContent: createMermaidFence(mermaidFlowchart),
  markdownProps: {
    features: mermaidFeatureConfig,
  },
  controls: mermaidBaseControls,
  sourceCode: {
    language: 'mermaid',
    code: mermaidFlowchart,
  },
}

export const mermaidSequenceCase: MarkdownDemoCase = {
  id: 'mermaid-sequence',
  title: 'Mermaid sequence diagram',
  description: '补齐第二类公开 Mermaid case，确保不仅 flowchart，sequence 也能稳定渲染。',
  deferPreview: true,
  initialContent: createMermaidFence(mermaidSequence),
  markdownProps: {
    features: mermaidFeatureConfig,
  },
  controls: mermaidBaseControls,
  sourceCode: {
    language: 'mermaid',
    code: mermaidSequence,
  },
}

export const mermaidInvalidCase: MarkdownDemoCase = {
  id: 'mermaid-invalid',
  title: 'Mermaid invalid syntax',
  description: '错误语法不应让整个 markdown 渲染失控；预览区展示错误提示，源码仍可回看和复制。',
  deferPreview: true,
  initialContent: createMermaidFence(mermaidInvalid),
  markdownProps: {
    features: mermaidFeatureConfig,
  },
  controls: mermaidBaseControls,
  sourceCode: {
    language: 'mermaid',
    code: mermaidInvalid,
  },
}
