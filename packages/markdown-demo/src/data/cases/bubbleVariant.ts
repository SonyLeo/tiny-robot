import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const bubbleVariantCase: MarkdownDemoCase = {
  id: 'bubble-variant',
  title: 'Bubble variant',
  description: '用于回归 `bubble` 变体的紧凑排版节奏，确认列表、task list、链接和内联代码在对话语境中不过度膨胀。',
  markdownProps: {
    variant: 'bubble',
  },
  initialContent: `这里是一个更接近对话消息的 markdown 片段，包含 [文档链接](https://docs.opentiny.design/tiny-robot/)、\`inline code\` 和一个紧凑列表。

- 第一条建议先确认 \`TrThemeProvider\` 已接入
- 第二条建议检查表格和引用是否受同一套 token 控制
- [x] 当前 code 模块专项已经收敛
- [ ] 接下来补齐基础 markdown 封口`,
}
