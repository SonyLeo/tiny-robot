import type { MarkdownDemoCase } from '../../types/markdownDemo'

const singleFootnoteMarkdown = `TinyRobot keeps a note handy.[^1]

[^1]: Footnotes should feel first-party, readable, and easy to jump back from.`

const repeatedFootnoteMarkdown = `Same footnote.[^a] Again.[^a]

[^a]: Shared note with [link](https://example.com) and \`code\` inside the same footnote body.`

const inlineFootnoteMarkdown = `Inline footnote syntax also works.^[Inline note body with **emphasis** and an easy return path.]`

const footnoteBaseControls = {
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

const footnoteFeatureConfig = {
  footnotes: {
    enabled: true,
  },
}

export const singleFootnoteCase: MarkdownDemoCase = {
  id: 'footnotes-single',
  title: 'Single footnote',
  description: '先覆盖最基础的脚注引用与回跳闭环，确保 ref、列表和 backref 都走第一方节点渲染。',
  deferPreview: true,
  initialContent: singleFootnoteMarkdown,
  markdownProps: {
    features: footnoteFeatureConfig,
  },
  controls: footnoteBaseControls,
  sourceCode: {
    language: 'md',
    code: singleFootnoteMarkdown,
  },
}

export const repeatedFootnoteCase: MarkdownDemoCase = {
  id: 'footnotes-repeated',
  title: 'Repeated footnote',
  description:
    '验证同一脚注被多次引用时的编号与 backref 锚点稳定，同时确保脚注正文里的 link / code 继续复用现有节点系统。',
  deferPreview: true,
  initialContent: repeatedFootnoteMarkdown,
  markdownProps: {
    features: footnoteFeatureConfig,
  },
  controls: footnoteBaseControls,
  sourceCode: {
    language: 'md',
    code: repeatedFootnoteMarkdown,
  },
}

export const inlineFootnoteCase: MarkdownDemoCase = {
  id: 'footnotes-inline',
  title: 'Inline footnote',
  description: '补一条 `^[...]` 行内脚注路径，避免只覆盖定义式脚注而漏掉 markdown-it-footnote 的另一条主语法。',
  deferPreview: true,
  initialContent: inlineFootnoteMarkdown,
  markdownProps: {
    features: footnoteFeatureConfig,
  },
  controls: footnoteBaseControls,
  sourceCode: {
    language: 'md',
    code: inlineFootnoteMarkdown,
  },
}
