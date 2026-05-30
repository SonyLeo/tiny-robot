import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const taskListsCase: MarkdownDemoCase = {
  id: 'task-lists',
  title: 'Task lists',
  description: '对齐 LobeUI 的 task list 基础能力，验证 `[ ] / [x]` 在默认与嵌套列表中的渲染、对齐和主题表现。',
  initialContent: `**Basic Task Lists**

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

**Nested Task Lists**

- [ ] Frontend Development
  - [x] Setup project structure
  - [ ] Footer component
- [ ] Backend Development
  - [x] Define endpoints
  - [ ] Implement authentication`,
}
