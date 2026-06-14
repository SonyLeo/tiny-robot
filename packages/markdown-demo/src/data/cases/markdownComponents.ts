import MarkdownComponentsPreview from '../../components/MarkdownComponentsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const markdownComponentsCase: MarkdownDemoCase = {
  id: 'markdown-components',
  title: 'Markdown components',
  description:
    '对齐 LobeUI 的 custom components 方向，用最小可运行案例展示 `components + componentProps` 如何同时驱动覆写节点和默认节点。',
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
}

const componentProps = {
  heading: { badge: 'M5.7' },
  link: { iconLabel: 'DOCS', tone: 'brand' },
  inlineCode: { label: 'TOKEN', tone: 'brand' },
  paragraph: {
    class: 'demo-markdown-paragraph',
    'data-component-props-paragraph': 'true',
  },
}`,
  },
}
