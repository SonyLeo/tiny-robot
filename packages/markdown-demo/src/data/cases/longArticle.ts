import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const longArticleCase: MarkdownDemoCase = {
  id: 'long-article',
  title: 'Long article',
  description: '长文回归案例用于观察 `article` 变体下的阅读节奏、章节层级、长段落、引用、任务列表和表格混排。',
  deferPreview: true,
  markdownProps: {
    variant: 'article',
  },
  initialContent: `# TrMarkdown Layout Review

Markdown article rendering is where typography mistakes become much more visible than in isolated component screenshots. Once paragraphs, lists, notes and tables are mixed together, spacing rhythm starts to dominate the reading experience.

## Why this case exists

This article-sized case is used to validate that \`TrMarkdown\` can stay readable for documentation, AI answers and technical write-ups without relying on demo-specific patches.

> The goal of this case is not visual exaggeration. It is to make quiet typography problems obvious before they ship into docs and bubble content.

### Current goals

- Keep headings readable without becoming oversized
- Keep paragraph rhythm stable in both light and dark mode
- Keep links, inline code and small semantic nodes from feeling visually detached

### Delivery checklist

- [x] Basic nodes are rendered by component mapping
- [x] Table overflow is wrapped by the markdown module itself
- [ ] Task list spacing is checked in \`article\` mode
- [ ] Bubble variant still feels compact after the same token updates

## Supporting details

When the reader moves through a long document, they should not have to re-learn the spacing rules between every content block. Paragraph spacing, list spacing, blockquote spacing and table spacing should all feel like they belong to the same system.

This is especially important after code block work, because code-focused polishing often accidentally leaves the surrounding prose too loose or too tight.

| Area | What to inspect | Expected result |
| --- | --- | --- |
| Paragraphs | Continuous reading rhythm | Stable and quiet |
| Lists | Marker alignment and spacing | Clear but not exaggerated |
| Task lists | Checkbox alignment | Compact and readable |
| Tables | Header hierarchy and borders | Structured without heaviness |

## Appendix

The final check for this case is simple: if a long answer with headings, a quote, a task list and a small table still reads naturally, the basic markdown layer is close to being sealed.`,
}
