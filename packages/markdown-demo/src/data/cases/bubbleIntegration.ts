import BubbleMarkdownPreview from '../../components/BubbleMarkdownPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const bubbleIntegrationCase: MarkdownDemoCase = {
  id: 'bubble-integration',
  title: 'Bubble integration',
  description:
    "对齐 `BubbleRenderers.Markdown` 的两条正式接入方式：fallback renderer 路径，以及 `{ type: 'markdown', text }` + provider match 的显式内容类型路径。",
  previewComponent: BubbleMarkdownPreview,
  markdownProps: {
    variant: 'bubble',
    code: {
      copyable: false,
      showLanguage: false,
      blockMode: 'overlay',
    },
  },
  controls: {
    variant: false,
  },
  initialContent: `## Bubble Markdown

This bubble keeps [links](https://example.com) inside the same typography system and still supports \`inline code\`.

- Compact list item
- Another compact list item

- [x] Bubble renderer now consumes \`TrMarkdown\`
- [ ] Provider attributes should still be able to tune markdown output

\`\`\`ts
console.log('bubble markdown')
\`\`\``,
  sourceCode: {
    language: 'ts',
    code: `const contentRendererMatches = [
  {
    find: (_, content) => content.type === 'markdown',
    renderer: BubbleRenderers.Markdown,
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]

const contentAttributes = (_, content) =>
  content.type === 'markdown'
    ? {
        code: { copyable: false, showLanguage: false },
        style: {
          '--tr-markdown-font-size': '15px',
          '--tr-markdown-line-height': '1.7',
        },
      }
    : undefined`,
  },
}
