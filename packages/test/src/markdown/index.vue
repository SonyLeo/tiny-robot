<template>
  <div class="markdown-demo">
    <h2>Markdown Demo</h2>

    <section class="markdown-demo__section" data-testid="markdown-static">
      <h3>Static Markdown</h3>
      <TrMarkdown :content="content" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-article">
      <h3>Article Markdown</h3>
      <TrMarkdown :content="articleContent" variant="article" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-colors">
      <h3>Color Preview Markdown</h3>
      <TrMarkdown :content="colorContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-snippet">
      <h3>Snippet Markdown</h3>
      <TrMarkdown :content="snippetContent" :code="snippetCodeConfig" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-code-full">
      <h3>Full Code Markdown</h3>
      <TrMarkdown :content="fullCodeContent" :code="fullCodeConfig" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble">
      <h3>Bubble Markdown</h3>
      <TrBubble :content="content" :fallback-content-renderer="BubbleRenderers.Markdown" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { BubbleRenderers, TrBubble, TrMarkdown } from '@opentiny/tiny-robot'

const content = `# Markdown Title

Paragraph with [link](https://example.com) and \`inline code\`.

Second paragraph to observe spacing rhythm and text density in a more article-like block.

This sentence is followed by a forced break.<br />
The next sentence should render on a new line but stay in the same paragraph.

> This is a blockquote used to validate left border, padding and secondary text treatment.

- list item one
- list item two
- list item three

- [ ] task list item
- [x] task list item done

This is a <ins>underlined</ins> text with H<sub>2</sub>O and E = mc<sup>2</sup>.

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to focus the command input.

\`\`\`ts
const message = 'hello markdown'
console.log(message)
\nfunction greet(name: string) {\n  return \`Hello, \${name}\`\n}\n
\`\`\`

\`\`\`js
console.log('short')
\`\`\`

| Name | Type | Description |
| --- | --- | --- |
| id | number | Unique identifier |
| name | string | Display name |
| active | boolean | Whether the item is active |

---
`

const articleContent = `# Long Article Regression

Markdown article rendering should stay readable when headings, paragraphs, quotes, task lists and tables appear in one continuous document.

## Reading rhythm

The first thing this case checks is whether long-form content still feels calm after the recent markdown and code-block changes.

> Quiet typography matters more than isolated visual flourishes when the content becomes long.

### Implementation checklist

- [x] Component mapping is active
- [x] Theme tokens control the main surfaces
- [ ] Bubble rhythm is checked after task list support lands

| Topic | Expectation |
| --- | --- |
| Paragraphs | Stable spacing |
| Task lists | Clear alignment |
| Tables | Readable hierarchy |

## Appendix

If this section remains readable at the bottom of a longer article, the basic markdown layer is in much better shape.`

const colorContent = `The primary token is \`#1677ff\`, the success tone is \`rgb(82, 196, 26)\`, and the warning tone is \`hsl(37, 100%, 55%)\`.`

const snippetContent = `\`\`\`bash
pnpm install
\`\`\``

const snippetCodeConfig = {
  highlight: {
    engine: 'shiki',
  },
}

const fullCodeContent = `\`\`\`ts
export function greetUser(name: string) {
  console.log('hewwo ' + name) // [!code --]
  console.log('Hello ' + name) // [!code ++]
  return \`Welcome, \${name}!\`
}
\`\`\`

\`\`\`tsx
export default ({ children, className }: MarkdownProps) => {
  const { styles } = useStyles()

  return (
    <ReactMarkdown
      className={cx(styles.container, className)}
      components={{ pre: CodeBlock, code: Code }}
    >
      {children}
    </ReactMarkdown>
  )
}
\`\`\``

const fullCodeConfig = {
  blockMode: 'full',
  highlight: {
    engine: 'shiki',
    enableTransformer: true,
  },
  actionsRender: ({ code, language, originalNode }) => [
    originalNode,
    h(
      'button',
      {
        type: 'button',
        class: 'tr-markdown__code-action-button',
        title: 'Custom action',
        'aria-label': 'Custom action',
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          console.info('[tiny-robot-test] custom action', {
            language,
            preview: code.slice(0, 48),
          })
        },
      },
      'AI',
    ),
  ],
}
</script>

<style scoped>
.markdown-demo {
  display: grid;
  gap: 24px;
}

.markdown-demo__section {
  display: grid;
  gap: 12px;
}
</style>
