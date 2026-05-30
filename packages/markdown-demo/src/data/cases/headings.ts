import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const headingsCase: MarkdownDemoCase = {
  id: 'headings',
  title: 'Headings',
  description: '通过在文本前添加 1 到 6 个 `#` 符号创建标题。这个案例主要观察标题层级、字重和与正文之间的节奏关系。',
  initialContent: `# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5`,
}
