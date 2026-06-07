declare module 'markdown-it-footnote' {
  import type MarkdownIt from 'markdown-it'

  const footnotePlugin: (markdown: MarkdownIt) => void

  export default footnotePlugin
}
