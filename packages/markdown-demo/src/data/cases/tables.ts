import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const tablesCase: MarkdownDemoCase = {
  id: 'tables',
  title: 'Tables',
  description: '表格案例用于观察结构渲染是否完整，以及浅色 / 暗色主题下的边界和表头层次。',
  initialContent: `| Name | Type | Description |
| --- | --- | --- |
| id | number | Unique identifier |
| name | string | Display name |
| active | boolean | Whether the item is active |
| createdAt | string | ISO date time string |`,
}
