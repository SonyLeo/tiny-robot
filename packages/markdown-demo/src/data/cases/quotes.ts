import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const quotesCase: MarkdownDemoCase = {
  id: 'quotes',
  title: 'Quoting text',
  description: '引用案例主要观察左侧强调线、文字灰度和多段引用在默认排版下的层次。',
  initialContent: `> Quoted text is rendered with a vertical line on the left and displayed using secondary type color.
>
> 这个案例会同时暴露 blockquote 的上下间距、内部段落收口，以及在 dark mode 下的对比度是否稳定。`,
}
