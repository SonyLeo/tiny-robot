import type { MarkdownDemoCase } from '../../types/markdownDemo'

const inlineMathMarkdown = `Einstein's mass-energy equivalence is written as $E = mc^2$ and remains readable inline with normal prose.`

const blockMathMarkdown = `$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$`

const invalidMathMarkdown = `$$
\\frac{1}{
$$`

const mathBaseControls = {
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

const mathFeatureConfig = {
  math: {
    enabled: true,
    copyable: true,
  },
}

export const inlineMathCase: MarkdownDemoCase = {
  id: 'math-inline',
  title: 'Inline formula',
  description: '先覆盖最常见的行内公式路径，验证 `$...$` 语法、按需加载 KaTeX 与正常正文混排。 ',
  deferPreview: true,
  initialContent: inlineMathMarkdown,
  markdownProps: {
    features: mathFeatureConfig,
  },
  controls: mathBaseControls,
  sourceCode: {
    language: 'tex',
    code: 'E = mc^2',
  },
}

export const blockMathCase: MarkdownDemoCase = {
  id: 'math-block',
  title: 'Block formula',
  description: '补齐 display math 主路径，验证 `$$...$$` 块级公式的排版、居中与复制入口。 ',
  deferPreview: true,
  initialContent: blockMathMarkdown,
  markdownProps: {
    features: mathFeatureConfig,
  },
  controls: mathBaseControls,
  sourceCode: {
    language: 'tex',
    code: '\\int_0^1 x^2\\,dx = \\frac{1}{3}',
  },
}

export const invalidMathCase: MarkdownDemoCase = {
  id: 'math-invalid',
  title: 'Invalid formula',
  description: '非法公式不应破坏整段 markdown；KaTeX 会降级为错误 fallback，同时保留源码可见。 ',
  deferPreview: true,
  initialContent: invalidMathMarkdown,
  markdownProps: {
    features: mathFeatureConfig,
  },
  controls: mathBaseControls,
  sourceCode: {
    language: 'tex',
    code: '\\frac{1}{',
  },
}
