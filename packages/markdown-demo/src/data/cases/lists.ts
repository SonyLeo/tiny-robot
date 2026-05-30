import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const listsCase: MarkdownDemoCase = {
  id: 'lists',
  title: 'Lists',
  description: '列表案例用于观察无序 / 有序 / 嵌套列表的层级缩进、项目间距和正文混排节奏。',
  initialContent: `- Unordered item one
- Unordered item two
  - Nested item
  - Nested item with \`inline code\`

1. Ordered item one
2. Ordered item two
3. Ordered item three`,
}
