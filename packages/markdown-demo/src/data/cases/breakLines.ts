import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const breakLinesCase: MarkdownDemoCase = {
  id: 'break-lines',
  title: 'Break lines',
  description: '对齐 LobeUI 的基础案例，验证显式 `<br>` 与普通段落在同一套 typography 下的换行节奏。',
  initialContent: `这是一段用于观察显式换行的文本。<br />
第二行会紧接着上一行出现，而不会被解析成新的段落。<br />
第三行用于确认浅色 / 暗色模式下换行后文本密度是否自然。

下一段仍然应该作为新的段落开始，而不是继续跟在上面的强制换行后面。`,
}
