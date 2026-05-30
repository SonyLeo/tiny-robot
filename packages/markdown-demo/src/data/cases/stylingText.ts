import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const stylingTextCase: MarkdownDemoCase = {
  id: 'styling-text',
  title: 'Styling text',
  description: '这个案例覆盖粗体、斜体、删除线、下划线、下标、上标和键盘按键标签，用来验证内联语义节点的正式渲染链路。',
  initialContent: `You can indicate emphasis with bold, italic, strikethrough, subscript, or superscript text in comment fields and \`.md\` files.

| Style | Syntax | Example | Output |
| --- | --- | --- | --- |
| Bold | \`** **\` or \`__ __\` | \`**This is bold text**\` | **This is bold text** |
| Italic | \`* *\` or \`_ _\` | \`_This text is italicized_\` | _This text is italicized_ |
| Strikethrough | \`~~ ~~\` | \`~~This was mistaken text~~\` | ~~This was mistaken text~~ |
| Bold and nested italic | \`** **\` and \`_ _\` | \`**This text is _extremely_ important**\` | **This text is _extremely_ important** |
| All bold and italic | \`*** ***\` | \`***All this text is important***\` | ***All this text is important*** |
| Underline | \`<ins> </ins>\` | \`This is a <ins>underline</ins> text\` | This is a <ins>underline</ins> text |
| Subscript | \`<sub> </sub>\` | \`This is a <sub>subscript</sub> text\` | This is a <sub>subscript</sub> text |
| Superscript | \`<sup> </sup>\` | \`This is a <sup>superscript</sup> text\` | This is a <sup>superscript</sup> text |
| Keyboard | \`<kbd> </kbd>\` | \`Press <kbd>mod+c</kbd>\` | Press <kbd>mod+c</kbd> |`,
}
