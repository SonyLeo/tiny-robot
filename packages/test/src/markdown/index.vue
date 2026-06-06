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

    <section class="markdown-demo__section" data-testid="markdown-html-preview-disabled">
      <h3>HTML Preview Disabled Markdown</h3>
      <TrMarkdown :content="htmlPreviewDisabledContent" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-enabled">
      <h3>HTML Preview Enabled Markdown</h3>
      <TrMarkdown :content="htmlPreviewEnabledContent" :features="htmlPreviewEnabledFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-html-preview-fragment">
      <h3>HTML Preview Fragment Markdown</h3>
      <TrMarkdown :content="htmlPreviewFragmentContent" :features="htmlPreviewFragmentFeatures" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-smoothing">
      <h3>Streaming Smoothing Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingTextScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingTextStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <p data-testid="markdown-stream-smoothing-parse-count">parseCount: {{ streamingParseCount }}</p>
      <TrMarkdown
        :content="streamingTextContent"
        :parser="streamingParser"
        :streaming="streamingSmoothingProps"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-link">
      <h3>Streaming Link Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingLinkScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingLinkStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingLinkContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-image">
      <h3>Streaming Image Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingImageScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingImageStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingImageContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-code">
      <h3>Streaming Code Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingCodeScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingCodeStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingCodeContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-table">
      <h3>Streaming Table Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in streamingTableScenario.steps"
          :key="step.id"
          type="button"
          @click="streamingTableStep = index"
        >
          {{ step.label }}
        </button>
      </div>
      <TrMarkdown :content="streamingTableContent" :streaming="streamingProps" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-large-append">
      <h3>Animated Large Append Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedLargeAppend.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedLargeAppend.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedLargeAppend.finalize">Settle</button>
        <button type="button" @click="animatedLargeAppend.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedLargeAppend.content.value"
        :streaming="animatedLargeAppend.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-paragraph-burst">
      <h3>Animated Paragraph Burst Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedParagraphBurst.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedParagraphBurst.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedParagraphBurst.finalize">Settle</button>
        <button type="button" @click="animatedParagraphBurst.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedParagraphBurst.content.value"
        :streaming="animatedParagraphBurst.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-fast-chunks">
      <h3>Animated Fast Chunks Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedFastChunks.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedFastChunks.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedFastChunks.finalize">Settle</button>
        <button type="button" @click="animatedFastChunks.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedFastChunks.content.value"
        :streaming="animatedFastChunks.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-rewrite-reset">
      <h3>Animated Rewrite Reset Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedRewriteReset.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedRewriteReset.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedRewriteReset.finalize">Settle</button>
        <button type="button" @click="animatedRewriteReset.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedRewriteReset.content.value"
        :streaming="animatedRewriteReset.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-hard-reset">
      <h3>Animated Hard Reset Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHardResetSteps"
          :key="step.id"
          type="button"
          @click="selectAnimatedHardResetStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="finalizeAnimatedHardReset">Settle</button>
        <button type="button" @click="restartAnimatedHardReset">Restart</button>
      </div>
      <TrMarkdown :content="animatedHardResetContent" :streaming="animatedHardResetStreaming" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-heading-list">
      <h3>Animated Heading List Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHeadingList.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedHeadingList.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedHeadingList.finalize">Settle</button>
        <button type="button" @click="animatedHeadingList.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedHeadingList.content.value"
        :streaming="animatedHeadingList.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-quote-paragraph">
      <h3>Animated Quote Paragraph Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedQuoteParagraph.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedQuoteParagraph.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedQuoteParagraph.finalize">Settle</button>
        <button type="button" @click="animatedQuoteParagraph.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedQuoteParagraph.content.value"
        :streaming="animatedQuoteParagraph.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-high-tps">
      <h3>Animated High TPS Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedHighTpsBurst.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedHighTpsBurst.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedHighTpsBurst.finalize">Settle</button>
        <button type="button" @click="animatedHighTpsBurst.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedHighTpsBurst.content.value"
        :streaming="animatedHighTpsBurst.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-settling-append">
      <h3>Animated Settling Append Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedSettlingAppend.scenario.steps"
          :key="step.id"
          type="button"
          @click="animatedSettlingAppend.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedSettlingAppend.finalize">Settle</button>
        <button type="button" @click="animatedSettlingAppend.restart">Restart</button>
      </div>
      <TrMarkdown
        :content="animatedSettlingAppend.content.value"
        :streaming="animatedSettlingAppend.streaming.value"
        variant="default"
      />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-variants">
      <h3>Animated Streaming Variants</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="scenario in animatedVariantMatrix.scenarios"
          :key="scenario.id"
          type="button"
          @click="animatedVariantMatrix.selectScenario(scenario.id)"
        >
          {{ scenario.title }}
        </button>
      </div>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedVariantMatrixSteps"
          :key="step.id"
          type="button"
          @click="animatedVariantMatrix.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedVariantMatrix.finalize">Settle</button>
        <button type="button" @click="animatedVariantMatrix.restart">Restart</button>
      </div>
      <div class="markdown-demo__variant-grid">
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-default">
          <header>
            <strong>default</strong>
            <span>Baseline docs path</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="default"
          />
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-bubble">
          <header>
            <strong>bubble</strong>
            <span>Compact markdown variant</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="bubble"
          />
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-variants-article">
          <header>
            <strong>article</strong>
            <span>Long-form reading variant</span>
          </header>
          <TrMarkdown
            :content="animatedVariantMatrix.content.value"
            :streaming="animatedVariantMatrix.streaming.value"
            variant="article"
          />
        </section>
      </div>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-bubble-integration">
      <h3>Animated Bubble Integration</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="scenario in animatedBubbleStreaming.scenarios"
          :key="scenario.id"
          type="button"
          @click="animatedBubbleStreaming.selectScenario(scenario.id)"
        >
          {{ scenario.title }}
        </button>
      </div>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedBubbleStreamingSteps"
          :key="step.id"
          type="button"
          @click="animatedBubbleStreaming.selectStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="animatedBubbleStreaming.finalize">Settle</button>
        <button type="button" @click="animatedBubbleStreaming.restart">Restart</button>
      </div>
      <div class="markdown-demo__variant-grid markdown-demo__variant-grid--bubble">
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-bubble-fallback">
          <header>
            <strong>fallback renderer</strong>
            <span>String content + fallbackContentRenderer</span>
          </header>
          <TrBubbleProvider :content-attributes="animatedBubbleFallbackAttributes">
            <TrBubble
              :content="animatedBubbleStreaming.content.value"
              role="assistant"
              :fallback-content-renderer="BubbleRenderers.Markdown"
            />
          </TrBubbleProvider>
        </section>
        <section class="markdown-demo__variant-card" data-testid="markdown-stream-animated-bubble-content-type">
          <header>
            <strong>content type</strong>
            <span>`{ type: 'markdown', text }` + provider match</span>
          </header>
          <TrBubbleProvider
            :content-renderer-matches="bubbleMarkdownRendererMatches"
            :content-attributes="animatedBubbleContentTypeAttributes"
          >
            <TrBubbleList
              :messages="animatedBubbleMessages"
              :role-configs="bubbleRoleConfigs"
              content-render-mode="split"
            />
          </TrBubbleProvider>
        </section>
      </div>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-stream-animated-skip-matrix">
      <h3>Animated Skip Matrix Markdown</h3>
      <div class="markdown-demo__actions">
        <button
          v-for="(step, index) in animatedSkipMatrixSteps"
          :key="step.id"
          type="button"
          @click="selectAnimatedSkipMatrixStep(index)"
        >
          {{ step.label }}
        </button>
        <button type="button" @click="finalizeAnimatedSkipMatrix">Settle</button>
        <button type="button" @click="restartAnimatedSkipMatrix">Restart</button>
      </div>
      <TrMarkdown :content="animatedSkipMatrixContent" :streaming="animatedSkipMatrixStreaming" variant="default" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble">
      <h3>Bubble Markdown</h3>
      <TrBubble :content="content" :fallback-content-renderer="BubbleRenderers.Markdown" />
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble-fallback">
      <h3>Bubble Markdown Fallback</h3>
      <TrBubbleProvider :content-attributes="bubbleFallbackAttributes">
        <TrBubble :content="bubbleFallbackContent" :fallback-content-renderer="BubbleRenderers.Markdown" />
      </TrBubbleProvider>
    </section>

    <section class="markdown-demo__section" data-testid="markdown-bubble-content-type">
      <h3>Bubble Markdown Content Type</h3>
      <TrBubbleProvider
        :content-renderer-matches="bubbleMarkdownRendererMatches"
        :content-attributes="bubbleContentTypeAttributes"
      >
        <TrBubbleList :messages="bubbleMessages" :role-configs="bubbleRoleConfigs" content-render-mode="split" />
      </TrBubbleProvider>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, markRaw, ref } from 'vue'
import {
  BubbleRendererMatchPriority,
  BubbleRenderers,
  TrBubble,
  TrBubbleList,
  TrBubbleProvider,
  TrMarkdown,
  markdownItAdapter,
  type TrMarkdownCodeActionContext,
  type TrMarkdownCodeConfig,
  type BubbleContentAttributesConfig,
  type BubbleContentRendererMatch,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { trMarkdownStreamingFixtures } from '../../../components/src/markdown/fixtures/streaming'

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

const snippetCodeConfig: TrMarkdownCodeConfig = {
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

const fullCodeConfig: TrMarkdownCodeConfig = {
  blockMode: 'full',
  highlight: {
    engine: 'shiki',
    enableTransformer: true,
  },
  actionsRender: ({ code, language, originalNode }: TrMarkdownCodeActionContext) => [
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

const htmlPreviewDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TinyRobot HTML Preview Test</title>
    <style>
      html,
      body {
        margin: 0;
      }

      body {
        min-height: 220px;
        padding: 32px;
        box-sizing: border-box;
        background: #101628;
        color: #ffffff;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }

      .pill {
        display: inline-flex;
        padding: 0.2em 0.6em;
        border-radius: 999px;
        background: #34d3f5;
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Hello from inside Markdown</h1>
      <p>This block is rendered by <span class="pill">HtmlPreview</span>.</p>
      <p>Scripts run inside an isolated sandbox iframe.</p>
    </main>
  </body>
</html>`

const htmlPreviewFragment = `<section>
  <h1>Fragment fallback</h1>
  <p>This stays as code because it is not a full HTML document.</p>
</section>`

const htmlPreviewDisabledContent = `\`\`\`html
${htmlPreviewDocument}
\`\`\``

const htmlPreviewEnabledContent = `\`\`\`html
${htmlPreviewDocument}
\`\`\``

const htmlPreviewFragmentContent = `\`\`\`html
${htmlPreviewFragment}
\`\`\``

const htmlPreviewEnabledFeatures = {
  htmlPreview: {
    enabled: true,
    defaultHeight: 260,
    fileName: 'tiny-robot-html-preview.html',
  },
}

const htmlPreviewFragmentFeatures = {
  htmlPreview: {
    enabled: true,
  },
}

const bubbleFallbackContent = `## Bubble Fallback

This fallback path still renders [links](https://example.com) through \`TrMarkdown\`.

- [x] Fallback renderer is active
- [ ] Provider attributes should still reach markdown

\`\`\`ts
console.log('bubble fallback')
\`\`\``

const bubbleMarkdownRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (_, content) => content.type === 'markdown',
    renderer: markRaw(BubbleRenderers.Markdown),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]

const bubbleRoleConfigs: Record<string, BubbleRoleConfig> = {
  user: {
    placement: 'end',
  },
}

const bubbleMessages: BubbleMessage[] = [
  {
    role: 'user',
    content: 'Please render the reply with explicit markdown content items.',
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'markdown',
        text: `## Bubble Content Type

This branch uses [content attributes](https://example.com/content-type) with \`TrMarkdown\`.

- [x] Explicit \`{ type: 'markdown', text }\` content item
- [x] Bubble renderer match routes markdown items only

\`\`\`ts
console.log('bubble content type')
\`\`\``,
      },
      {
        type: 'text',
        text: 'This trailing text item intentionally remains on the default text renderer.',
      },
    ],
  },
]

const bubbleMarkdownLink = {
  target: '_self' as const,
  rel: 'nofollow noopener',
}

const bubbleMarkdownCode = {
  copyable: false,
  showLanguage: false,
}

const bubbleMarkdownStyle = {
  '--tr-markdown-font-size': '15px',
  '--tr-markdown-line-height': '1.7',
  '--tr-markdown-spacing-scale': '1.6',
}

const bubbleFallbackAttributes: BubbleContentAttributesConfig = () => ({
  link: bubbleMarkdownLink,
  code: bubbleMarkdownCode,
  style: bubbleMarkdownStyle,
  'data-bubble-markdown-mode': 'fallback',
})

const bubbleContentTypeAttributes: BubbleContentAttributesConfig = (_, content) => {
  if (content.type !== 'markdown') {
    return undefined
  }

  return {
    link: bubbleMarkdownLink,
    code: bubbleMarkdownCode,
    style: bubbleMarkdownStyle,
    'data-bubble-markdown-mode': 'content-type',
  }
}

const getStreamingScenario = (id: string) => {
  const scenario = trMarkdownStreamingFixtures.find((item) => item.id === id)
  if (!scenario) {
    throw new Error(`Missing streaming scenario: ${id}`)
  }

  return scenario
}

const streamingLinkScenario = getStreamingScenario('incomplete-link')
const streamingImageScenario = getStreamingScenario('incomplete-image')
const streamingCodeScenario = getStreamingScenario('incomplete-code-fence')
const streamingTableScenario = getStreamingScenario('incomplete-table')
const streamingTextScenario = getStreamingScenario('text-tail')

const streamingLinkStep = ref(0)
const streamingImageStep = ref(0)
const streamingCodeStep = ref(0)
const streamingTableStep = ref(0)
const streamingTextStep = ref(0)
const streamingParseCount = ref(0)

const streamingLinkContent = computed(() => streamingLinkScenario.steps[streamingLinkStep.value].content)
const streamingImageContent = computed(() => streamingImageScenario.steps[streamingImageStep.value].content)
const streamingCodeContent = computed(() => streamingCodeScenario.steps[streamingCodeStep.value].content)
const streamingTableContent = computed(() => streamingTableScenario.steps[streamingTableStep.value].content)
const streamingTextContent = computed(() => streamingTextScenario.steps[streamingTextStep.value].content)

const streamingProps = {
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 48,
} as const

const streamingSmoothingProps = {
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 120,
} as const

const animatedStreamingBase = {
  enabled: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 64,
  mode: 'animated',
  preset: 'balanced',
  profile: {
    enabled: true,
    label: 'tiny-robot-test',
    maxEvents: 64,
  },
} as const

const createAnimatedStreamingHarness = (scenarioId: string) => {
  const scenario = getStreamingScenario(scenarioId)
  const step = ref(0)
  const active = ref(true)

  return {
    scenario,
    step,
    active,
    content: computed(() => scenario.steps[step.value]?.content || ''),
    streaming: computed(() => ({
      ...animatedStreamingBase,
      active: active.value,
    })),
    selectStep(index: number) {
      step.value = index
      active.value = true
    },
    finalize() {
      active.value = false
    },
    restart() {
      step.value = 0
      active.value = true
    },
  }
}

const createAnimatedStreamingMatrixHarness = (scenarioIds: readonly string[]) => {
  const scenarios = scenarioIds.map((id) => getStreamingScenario(id))
  const scenarioId = ref(scenarios[0]?.id || '')
  const step = ref(0)
  const active = ref(true)
  const activeScenario = computed(() => scenarios.find((scenario) => scenario.id === scenarioId.value) || scenarios[0])

  return {
    scenarios,
    activeScenario,
    step,
    active,
    content: computed(() => activeScenario.value?.steps[step.value]?.content || ''),
    streaming: computed(() => ({
      ...animatedStreamingBase,
      active: active.value,
    })),
    selectScenario(nextScenarioId: string) {
      scenarioId.value = nextScenarioId
      step.value = 0
      active.value = true
    },
    selectStep(index: number) {
      step.value = index
      active.value = true
    },
    finalize() {
      active.value = false
    },
    restart() {
      step.value = 0
      active.value = true
    },
  }
}

const animatedLargeAppend = createAnimatedStreamingHarness('large-append')
const animatedParagraphBurst = createAnimatedStreamingHarness('paragraph-burst')
const animatedFastChunks = createAnimatedStreamingHarness('fast-chunks')
const animatedRewriteReset = createAnimatedStreamingHarness('rewrite-reset')
const animatedHeadingList = createAnimatedStreamingHarness('heading-list')
const animatedHighTpsBurst = createAnimatedStreamingHarness('high-tps-burst')
const animatedQuoteParagraph = createAnimatedStreamingHarness('quote-paragraph')
const animatedSettlingAppend = createAnimatedStreamingHarness('settling-append')
const animatedVariantMatrix = createAnimatedStreamingMatrixHarness([
  'high-tps-burst',
  'settling-append',
  'rewrite-reset',
])
const animatedBubbleStreaming = createAnimatedStreamingMatrixHarness([
  'high-tps-burst',
  'settling-append',
  'rewrite-reset',
])
const animatedVariantMatrixSteps = computed(() => animatedVariantMatrix.activeScenario.value?.steps || [])
const animatedBubbleStreamingSteps = computed(() => animatedBubbleStreaming.activeScenario.value?.steps || [])

const animatedBubbleFallbackAttributes: BubbleContentAttributesConfig = () => ({
  link: bubbleMarkdownLink,
  code: bubbleMarkdownCode,
  style: bubbleMarkdownStyle,
  streaming: animatedBubbleStreaming.streaming.value,
  'data-bubble-markdown-mode': 'animated-fallback',
})

const animatedBubbleContentTypeAttributes: BubbleContentAttributesConfig = (_, content) => {
  if (content.type !== 'markdown') {
    return undefined
  }

  return {
    link: bubbleMarkdownLink,
    code: bubbleMarkdownCode,
    style: bubbleMarkdownStyle,
    streaming: animatedBubbleStreaming.streaming.value,
    'data-bubble-markdown-mode': 'animated-content-type',
  }
}

const animatedBubbleMessages = computed<BubbleMessage[]>(() => [
  {
    role: 'user',
    content: 'Please keep streaming markdown inside the assistant bubble.',
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'markdown',
        text: animatedBubbleStreaming.content.value,
      },
      {
        type: 'text',
        text: 'This trailing text item intentionally remains on the default text renderer.',
      },
    ],
  },
])

const animatedSkipMatrixSteps = [
  {
    id: 'skip-matrix-1',
    label: 'Heading only',
    content: '## Skip matrix repro\n',
  },
  {
    id: 'skip-matrix-2',
    label: 'Append mixed content',
    content: `## Skip matrix repro

Animated paragraph text should reveal progressively while code, table and image stay on their own non-character-animation paths.

![TinyRobot logo](https://img.example.com/tiny-robot.png)

| Name | Type |
| --- | --- |
| retryCount | number |

\`\`\`ts
const skip = true
console.log(skip)
\`\`\`
`,
  },
] as const

const animatedHardResetSteps = [
  {
    id: 'hard-reset-1',
    label: 'Paragraph',
    content: `## Hard reset repro

This paragraph is intentionally replaced by a list so the block structure changes.
`,
  },
  {
    id: 'hard-reset-2',
    label: 'List rewrite',
    content: `## Hard reset repro

- The paragraph became a list item
- Scheduler should hard reset this structure change
`,
  },
] as const

const animatedSkipMatrixStep = ref(0)
const animatedSkipMatrixActive = ref(true)
const animatedSkipMatrixContent = computed(() => animatedSkipMatrixSteps[animatedSkipMatrixStep.value]?.content || '')
const animatedSkipMatrixStreaming = computed(() => ({
  ...animatedStreamingBase,
  active: animatedSkipMatrixActive.value,
}))
const animatedHardResetStep = ref(0)
const animatedHardResetActive = ref(true)
const animatedHardResetContent = computed(() => animatedHardResetSteps[animatedHardResetStep.value]?.content || '')
const animatedHardResetStreaming = computed(() => ({
  ...animatedStreamingBase,
  active: animatedHardResetActive.value,
}))

const selectAnimatedSkipMatrixStep = (index: number) => {
  animatedSkipMatrixStep.value = index
  animatedSkipMatrixActive.value = true
}

const finalizeAnimatedSkipMatrix = () => {
  animatedSkipMatrixActive.value = false
}

const restartAnimatedSkipMatrix = () => {
  animatedSkipMatrixStep.value = 0
  animatedSkipMatrixActive.value = true
}

const selectAnimatedHardResetStep = (index: number) => {
  animatedHardResetStep.value = index
  animatedHardResetActive.value = true
}

const finalizeAnimatedHardReset = () => {
  animatedHardResetActive.value = false
}

const restartAnimatedHardReset = () => {
  animatedHardResetStep.value = 0
  animatedHardResetActive.value = true
}

const streamingParser = markRaw({
  name: 'streaming-test-parser',
  async parse(source: string, options: Parameters<typeof markdownItAdapter.parse>[1]) {
    streamingParseCount.value += 1
    return markdownItAdapter.parse(source, options)
  },
})
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

.markdown-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.markdown-demo__variant-grid {
  display: grid;
  gap: 12px;
}

.markdown-demo__variant-grid--bubble {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.markdown-demo__variant-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #fff;
}

.markdown-demo__variant-card header {
  display: grid;
  gap: 4px;
}

.markdown-demo__variant-card strong,
.markdown-demo__variant-card span {
  margin: 0;
}

.markdown-demo__variant-card strong {
  font-size: 13px;
  text-transform: uppercase;
}

.markdown-demo__variant-card span {
  font-size: 12px;
  color: #666;
}
</style>
