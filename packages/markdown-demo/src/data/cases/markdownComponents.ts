import MarkdownComponentsPreview from '../../components/MarkdownComponentsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const markdownComponentsCase: MarkdownDemoCase = {
  id: 'markdown-components',
  title: 'Markdown components',
  description:
    '对齐 LobeUI 的 custom components 方向，用最小可运行案例展示 `components` 覆写如何接管 heading / link / inline code。',
  previewComponent: MarkdownComponentsPreview,
  controls: {
    variant: false,
  },
  initialContent: `# Custom heading

Use a [custom link](https://docs.opentiny.design/tiny-robot/) and a custom \`inline token\` inside the same markdown document.

## Why it matters

- The parser stays stable
- The renderer remains first-party
- Consumers still replace presentation with Vue components`,
  sourceCode: {
    language: 'ts',
    code: `const components = {
  heading: DemoHeading,
  link: DemoLink,
  inlineCode: DemoInlineCode,
}`,
  },
}
