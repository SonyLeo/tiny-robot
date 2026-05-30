import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const paragraphCase: MarkdownDemoCase = {
  id: 'paragraph',
  title: 'Paragraph',
  description: '通过多段连续文本观察段落间距、行高和长文本阅读节奏。',
  initialContent: `# 长文段落示例

这是第一段文字。在现代网页设计中，文本排版是至关重要的。良好的段落间距和行高能够显著提升阅读体验。当我们使用 \`TrMarkdown\` 展示长内容时，默认样式是否克制、连续阅读是否轻松，会比单个组件细节更快影响整体观感。

这是第二段文字。通过设置合适的段落间距和更稳定的行高，我们可以为文档阅读、AI 回答和方案说明提供清晰的节奏感。这种控制不应该依赖 demo 自己的硬编码补丁，而应尽量回到组件库自己的主题 token 和 typography 变量。

这是第三段文字。暗色模式下的长文尤其容易暴露问题，比如标题亮度正常但正文发灰、段落边界不清晰，或者表格和代码块过于抢眼。这个案例主要用于帮助我们确认基础排版已经收敛到可持续维护的状态。

这是第四段文字。最终我们希望 \`TrMarkdown\` 在文章阅读、对话解释、技术文档和设计说明这些高频场景里，都能保持稳定、自然、不过度设计的排版表现。`,
}
