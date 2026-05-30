import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const inlineCodeCase: MarkdownDemoCase = {
  id: 'inline-code',
  title: 'Inline code',
  description: '对标 LobeUI 的 inline code 文档案例，观察正文、列表和表格里的内联代码是否都走统一的正式渲染链路。',
  sourceCode: {
    language: 'javascript',
    code: `function greetUser(name) {
  console.log(\`Hello, \${name}!\`)
}`,
  },
  initialContent: `Use \`backticks\` to create inline code within text.

**Code in Lists**

- Use \`npm start\` to run the development server
- Use \`npm test\` to run tests

**Code in Tables**

| Command | Description |
| --- | --- |
| \`git status\` | Check repository status |
| \`git add .\` | Stage all changes |`,
}
