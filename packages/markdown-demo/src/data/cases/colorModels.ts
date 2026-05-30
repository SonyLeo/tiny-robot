import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const colorModelsCase: MarkdownDemoCase = {
  id: 'color-models',
  title: 'Color models',
  description:
    '对标 LobeUI 的颜色 inline code 案例，验证 HEX / RGB / HSL 是否会显示颜色预览，同时保留普通 inline code 的样式一致性。',
  initialContent: `The brand primary color is \`#1677ff\`, the success accent is \`rgb(82, 196, 26)\`, and the warning tone is \`hsl(37, 100%, 55%)\`.

Fallback examples like \`rgba(22, 119, 255, 0.5)\` or \`var(--tr-color-primary)\` 仍然应该保持普通 inline code，而不是误判成颜色预览。`,
  controls: {
    inlineColorPreview: true,
  },
}
