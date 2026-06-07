export interface TrMarkdownStreamingFixtureStep {
  id: string
  label: string
  content: string
}

export interface TrMarkdownStreamingFixtureScenario {
  id: string
  group: 'basic' | 'code' | 'stress'
  title: string
  description: string
  steps: TrMarkdownStreamingFixtureStep[]
}

const burstParagraphA =
  'Streaming burst scenario appends a long paragraph in one go so we can inspect how the stable head and pending tail split behave without introducing per-character animation.'

const burstParagraphB =
  'The second paragraph lands as another chunk and should keep the earlier section readable instead of forcing a malformed intermediate markdown block.'

const burstParagraphC =
  'The final paragraph closes the scenario and lets the renderer settle back to the normal static path once a terminating newline arrives.\n'

const headingListParagraph =
  'The opening heading lands first, and the list arrives later as a distinct block so we can observe whether the queue reveals mixed text structures in a stable order.'

const quoteParagraphIntro =
  'The quoted summary should reveal first, then the following paragraph should continue as a separate text block without remounting the completed quote.'

const fastChunkParagraphA =
  'Fast chunk A lands as a compact paragraph so we can see whether the current animating block is promoted cleanly when the next block arrives almost immediately.'

const fastChunkParagraphB =
  'Fast chunk B follows with another short paragraph and should leave the earlier copy fully revealed instead of replaying its fade.'

const fastChunkParagraphC =
  'Fast chunk C closes the short-burst sequence and gives the scheduler one more handoff before finalize.'

const settlingAppendIntro =
  'The first paragraph is intentionally complete enough to settle, so the next append can test whether finalize is canceled and the queue resumes streaming without leaving ghost chars behind.'

const blockBurstSyncParagraphA =
  'The first paragraph arrives together with the heading so we can inspect whether the scheduler keeps the block boundary stable when a whole paragraph lands in one shot.'

const blockBurstSyncParagraphB =
  'The second paragraph should arrive as part of the same burst and still remain readable without forcing the previous block to replay its animation timeline.'

const blockBurstViaSmootherParagraphA =
  'The first paragraph is short enough to be paced by the smoother, so the queue should keep it readable even as the next block begins to form.'

const blockBurstViaSmootherParagraphB =
  'The second paragraph is also below the large-append threshold, which means this path should stay in the normal smoother lane rather than jumping to syncImmediate.'

const fastSmallChunksParagraphA =
  'Fast small chunk A is intentionally compact so the smoother can keep up while the block boundary keeps moving.'

const fastSmallChunksParagraphB = 'Fast small chunk B follows quickly and should not replay the already settled text.'

const fastSmallChunksParagraphC =
  'Fast small chunk C closes the short burst and gives the scheduler a final handoff before finalize.'

const ultraFastParagraphA =
  'Ultra fast paragraph A keeps the burst under the large-append threshold but still drives the queue hard.'

const ultraFastParagraphB =
  'Ultra fast paragraph B immediately follows to test whether the animator can stay ahead of the backlog.'

const ultraFastParagraphC =
  'Ultra fast paragraph C closes the sequence and checks that the backlog can settle cleanly afterward.'

const slowBaselineParagraph =
  'This slow baseline keeps the stream pressure low and gives the scheduler enough time to reveal each block without a backlog spike.'

const htmlPreviewStreamStyleOpen = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Streaming HTML Preview</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
      }

      body {
        padding: 28px;
        box-sizing: border-box;
        background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .card {
        max-width: 620px;
        padding: 24px;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.82);
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.32);
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0.25em 0.7em;
        border-radius: 999px;
        background: rgba(52, 211, 153, 0.18);
        color: #a7f3d0;
        font-size: 13px;
        font-weight: 600;
      }`

const htmlPreviewStreamNoScriptOpen = `${htmlPreviewStreamStyleOpen}
`

const htmlPreviewStreamNoScriptLive = `${htmlPreviewStreamStyleOpen}
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Streaming HTML preview</h1>
      <p>The preview can mount before the closing html tag arrives.</p>
      <p class="status">auto / no script</p>
`

const htmlPreviewStreamNoScriptClosed = `${htmlPreviewStreamNoScriptLive}    </main>
  </body>
</html>
`

const htmlPreviewStreamScriptLive = `${htmlPreviewStreamStyleOpen}
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Streaming HTML preview</h1>
      <p>Script-bearing documents should wait in auto mode.</p>
      <p class="status">script payload attached</p>
    </main>
    <script>
      document.body.dataset.previewBoot = 'ready'
    </script>
`

const htmlPreviewStreamScriptClosed = `${htmlPreviewStreamScriptLive}</body>
</html>
`

const createOpenHtmlPreviewFence = (content: string) => `\`\`\`html
${content}`

const createClosedHtmlPreviewFence = (content: string) => `\`\`\`html
${content}\`\`\`
`

export const trMarkdownStreamingFixtures: TrMarkdownStreamingFixtureScenario[] = [
  {
    id: 'text-tail',
    group: 'basic',
    title: 'Text tail smoothing',
    description: '验证普通文本逐步追加时，前序稳定内容不反复重解析，尾部以 loading tail 的形式平滑展示。',
    steps: [
      {
        id: 'text-tail-1',
        label: 'Chunk 1',
        content: 'Streaming markdown keeps earlier content stable',
      },
      {
        id: 'text-tail-2',
        label: 'Chunk 2',
        content: 'Streaming markdown keeps earlier content stable while the pending tail continues to grow',
      },
      {
        id: 'text-tail-3',
        label: 'Chunk 3',
        content:
          'Streaming markdown keeps earlier content stable while the pending tail continues to grow, and the final sentence lands without reflow.\n',
      },
    ],
  },
  {
    id: 'incomplete-link',
    group: 'basic',
    title: 'Incomplete link hold',
    description: '验证链接未闭合时不提前渲染为 anchor，闭合后再回到正式 markdown 节点。',
    steps: [
      {
        id: 'incomplete-link-1',
        label: 'Open label',
        content: '## Streaming link\n\nOpen the [TinyRobot',
      },
      {
        id: 'incomplete-link-2',
        label: 'Open target',
        content: '## Streaming link\n\nOpen the [TinyRobot docs](https://docs.',
      },
      {
        id: 'incomplete-link-3',
        label: 'Close link',
        content:
          '## Streaming link\n\nOpen the [TinyRobot docs](https://docs.opentiny.design/tiny-robot/) for the full guide.\n',
      },
    ],
  },
  {
    id: 'incomplete-image',
    group: 'basic',
    title: 'Incomplete image hold',
    description:
      '验证图片语法未闭合时进入 image tail，闭合后再交回正式 image 节点，避免半成品 `![alt](...)` 直接混进排版。',
    steps: [
      {
        id: 'incomplete-image-1',
        label: 'Open alt',
        content: '## Streaming image\n\n![TinyRobot',
      },
      {
        id: 'incomplete-image-2',
        label: 'Open target',
        content: '## Streaming image\n\n![TinyRobot logo](https://docs.opentiny.design',
      },
      {
        id: 'incomplete-image-3',
        label: 'Close image',
        content:
          '## Streaming image\n\n![TinyRobot logo](https://docs.opentiny.design/images/logo-opentiny-next-text.svg)\n',
      },
    ],
  },
  {
    id: 'incomplete-code-fence',
    group: 'code',
    title: 'Incomplete code fence hold',
    description: '验证 fenced code 未闭合时进入 code tail，闭合后再交给正式 code block 渲染。',
    steps: [
      {
        id: 'incomplete-code-fence-1',
        label: 'Open fence',
        content: "## Streaming code\n\n```ts\nconst status = 'streaming'",
      },
      {
        id: 'incomplete-code-fence-2',
        label: 'Append lines',
        content:
          "## Streaming code\n\n```ts\nconst status = 'streaming'\nfunction flushTail() {\n  return status.toUpperCase()\n}",
      },
      {
        id: 'incomplete-code-fence-3',
        label: 'Close fence',
        content:
          "## Streaming code\n\n```ts\nconst status = 'streaming'\nfunction flushTail() {\n  return status.toUpperCase()\n}\n```\n",
      },
    ],
  },
  {
    id: 'html-preview-auto-noscript',
    group: 'code',
    title: 'HTML preview auto, no script',
    description:
      '对齐 LobeUI 的无脚本 streaming HTML preview：在 `auto` 模式下，样式头部闭合后即可提前挂载 iframe，不必等待 `</html>`。',
    steps: [
      {
        id: 'html-preview-auto-noscript-1',
        label: 'Open fence',
        content: createOpenHtmlPreviewFence(htmlPreviewStreamNoScriptOpen),
      },
      {
        id: 'html-preview-auto-noscript-2',
        label: 'Close head',
        content: createOpenHtmlPreviewFence(htmlPreviewStreamNoScriptLive),
      },
      {
        id: 'html-preview-auto-noscript-3',
        label: 'Close document',
        content: createClosedHtmlPreviewFence(htmlPreviewStreamNoScriptClosed),
      },
    ],
  },
  {
    id: 'html-preview-auto-script',
    group: 'code',
    title: 'HTML preview auto, script locked',
    description:
      '对齐 LobeUI 的脚本锁定路径：`auto` 模式下只要流式文档里出现脚本，就延后到 `</html>` 完整闭合后再挂载 iframe。',
    steps: [
      {
        id: 'html-preview-auto-script-1',
        label: 'Open fence',
        content: createOpenHtmlPreviewFence(htmlPreviewStreamNoScriptOpen),
      },
      {
        id: 'html-preview-auto-script-2',
        label: 'Attach script',
        content: createOpenHtmlPreviewFence(htmlPreviewStreamScriptLive),
      },
      {
        id: 'html-preview-auto-script-3',
        label: 'Close document',
        content: createClosedHtmlPreviewFence(htmlPreviewStreamScriptClosed),
      },
    ],
  },
  {
    id: 'incomplete-table',
    group: 'code',
    title: 'Incomplete table hold',
    description: '验证表格头、分隔线和数据行逐步到达时，不提前渲染半成品 table。',
    steps: [
      {
        id: 'incomplete-table-1',
        label: 'Header only',
        content: '## Streaming table\n\n| Name | Type |\n| --- | --- |',
      },
      {
        id: 'incomplete-table-2',
        label: 'Append row',
        content: '## Streaming table\n\n| Name | Type |\n| --- | --- |\n| status | string |',
      },
      {
        id: 'incomplete-table-3',
        label: 'Flush table',
        content: '## Streaming table\n\n| Name | Type |\n| --- | --- |\n| status | string |\n| retryCount | number |\n',
      },
    ],
  },
  {
    id: 'large-append',
    group: 'stress',
    title: 'Large append stress',
    description:
      '对标 LobeUI `streamingAnimationRepro` 的 single large append 思路，一次性追加较长正文，观察当前非字符动画路径的稳定性。',
    steps: [
      {
        id: 'large-append-1',
        label: 'Heading only',
        content: '## Large append repro\n',
      },
      {
        id: 'large-append-2',
        label: 'Append payload',
        content: `## Large append repro

${burstParagraphA}

${burstParagraphB}

${burstParagraphC}`,
      },
    ],
  },
  {
    id: 'paragraph-burst',
    group: 'stress',
    title: 'Paragraph burst stress',
    description:
      '对标 LobeUI paragraphs-via-smoother 的逐段追加场景，观察段落级 chunk 到达时 stableContent / tailContent 的切换是否平稳。',
    steps: [
      {
        id: 'paragraph-burst-1',
        label: 'Heading',
        content: '## Paragraph burst repro\n\n',
      },
      {
        id: 'paragraph-burst-2',
        label: 'Paragraph 1',
        content: `## Paragraph burst repro

${burstParagraphA}`,
      },
      {
        id: 'paragraph-burst-3',
        label: 'Paragraph 2',
        content: `## Paragraph burst repro

${burstParagraphA}

${burstParagraphB}`,
      },
      {
        id: 'paragraph-burst-4',
        label: 'Paragraph 3',
        content: `## Paragraph burst repro

${burstParagraphA}

${burstParagraphB}

${burstParagraphC}`,
      },
    ],
  },
  {
    id: 'fast-chunks',
    group: 'stress',
    title: 'Fast chunks animated',
    description:
      '补齐 P1 的短突发 chunk 案例：连续追加多个短段落，重点观察 previous tail promotion 和 animating/streaming handoff 是否稳定。',
    steps: [
      {
        id: 'fast-chunks-1',
        label: 'Heading only',
        content: '## Fast chunks repro\n\n',
      },
      {
        id: 'fast-chunks-2',
        label: 'Chunk A',
        content: `## Fast chunks repro

${fastChunkParagraphA}
`,
      },
      {
        id: 'fast-chunks-3',
        label: 'Chunk B',
        content: `## Fast chunks repro

${fastChunkParagraphA}

${fastChunkParagraphB}
`,
      },
      {
        id: 'fast-chunks-4',
        label: 'Chunk C',
        content: `## Fast chunks repro

${fastChunkParagraphA}

${fastChunkParagraphB}

${fastChunkParagraphC}
`,
      },
    ],
  },
  {
    id: 'heading-list',
    group: 'stress',
    title: 'Heading + list animated',
    description:
      '补齐 M4.5 第一阶段缺失案例：heading 先进入，再接 bullet list，观察 mixed text blocks 的 reveal queue 是否稳定。',
    steps: [
      {
        id: 'heading-list-1',
        label: 'Heading',
        content: '## Heading and list repro\n\n',
      },
      {
        id: 'heading-list-2',
        label: 'Paragraph',
        content: `## Heading and list repro

${headingListParagraph}
`,
      },
      {
        id: 'heading-list-3',
        label: 'List payload',
        content: `## Heading and list repro

${headingListParagraph}

- Inspect queue ordering
- Keep completed heading stable
- Let the final list item settle back to plain DOM
`,
      },
    ],
  },
  {
    id: 'high-tps-burst',
    group: 'stress',
    title: 'High TPS burst animated',
    description:
      '补齐 P1 的高吞吐场景：短时间内追加多个 heading/list/paragraph block，观察 queueLength、activeIndex 与 charDelay 是否按预期收敛。',
    steps: [
      {
        id: 'high-tps-burst-1',
        label: 'Heading',
        content: '## High TPS burst repro\n\n',
      },
      {
        id: 'high-tps-burst-2',
        label: 'Paragraph',
        content: `## High TPS burst repro

${headingListParagraph}
`,
      },
      {
        id: 'high-tps-burst-3',
        label: 'List burst',
        content: `## High TPS burst repro

${headingListParagraph}

- chunk one
- chunk two
- chunk three
`,
      },
      {
        id: 'high-tps-burst-4',
        label: 'Follow-up paragraph',
        content: `## High TPS burst repro

${headingListParagraph}

- chunk one
- chunk two
- chunk three

${fastChunkParagraphB}
`,
      },
    ],
  },
  {
    id: 'quote-paragraph',
    group: 'stress',
    title: 'Quote + paragraph animated',
    description: '补齐 M4.5 第一阶段缺失案例：blockquote 与后续 paragraph 作为两个连续文本 block 进入 reveal queue。',
    steps: [
      {
        id: 'quote-paragraph-1',
        label: 'Quote start',
        content: '## Quote and paragraph repro\n\n> Streaming quote arrives first',
      },
      {
        id: 'quote-paragraph-2',
        label: 'Close quote',
        content: `## Quote and paragraph repro

> Streaming quote arrives first and should settle as its own block.
`,
      },
      {
        id: 'quote-paragraph-3',
        label: 'Paragraph payload',
        content: `## Quote and paragraph repro

> Streaming quote arrives first and should settle as its own block.

${quoteParagraphIntro}
`,
      },
    ],
  },
  {
    id: 'settling-append',
    group: 'stress',
    title: 'Append during settling',
    description:
      '补齐 P1 的 finalize 中断案例：最后一个 block 进入 settling 之后再追加新内容，验证 finalize timer 会被撤销并恢复到 streaming 队列。',
    steps: [
      {
        id: 'settling-append-1',
        label: 'Heading',
        content: '## Settling append repro\n\n',
      },
      {
        id: 'settling-append-2',
        label: 'Settling candidate',
        content: `## Settling append repro

${settlingAppendIntro}
`,
      },
      {
        id: 'settling-append-3',
        label: 'Resume append',
        content: `## Settling append repro

${settlingAppendIntro}

${fastChunkParagraphC}
`,
      },
    ],
  },
  {
    id: 'rewrite-reset',
    group: 'stress',
    title: 'Rewrite reset stress',
    description:
      '验证内容不再是前缀追加时，旧 reveal timeline 会被中止并重建，避免把改写后的段落误判成原段落的续写动画。',
    steps: [
      {
        id: 'rewrite-reset-1',
        label: 'Draft A',
        content: `## Rewrite reset repro

The assistant starts with a draft sentence that is still subject to change.`,
      },
      {
        id: 'rewrite-reset-2',
        label: 'Append tail',
        content: `## Rewrite reset repro

The assistant starts with a draft sentence that is still subject to change, and then continues to extend the same paragraph with a longer explanation.`,
      },
      {
        id: 'rewrite-reset-3',
        label: 'Rewrite',
        content: `## Rewrite reset repro

The upstream model rewrote the previous sentence instead of appending to it, so the animation timeline should restart cleanly.`,
      },
      {
        id: 'rewrite-reset-4',
        label: 'Finalize',
        content: `## Rewrite reset repro

The upstream model rewrote the previous sentence instead of appending to it, so the animation timeline should restart cleanly.

Once the final version settles, the renderer should fall back to the regular static DOM again.
`,
      },
    ],
  },
  {
    id: 'block-burst-sync',
    group: 'stress',
    title: 'Multi-paragraph in one shot',
    description:
      '对标 LobeUI 的 multi-paragraph in one shot 场景：一次性追加完整段落，观察新 block 是否被稳定播出而不是重挂载整篇文档。',
    steps: [
      {
        id: 'block-burst-sync-1',
        label: 'Heading only',
        content: '## Multi-paragraph burst repro\n\n',
      },
      {
        id: 'block-burst-sync-2',
        label: 'Burst payload',
        content: `## Multi-paragraph burst repro

${blockBurstSyncParagraphA}

${blockBurstSyncParagraphB}
`,
      },
    ],
  },
  {
    id: 'slow-baseline',
    group: 'stress',
    title: 'Slow baseline',
    description:
      '对标 LobeUI 的 slow 20 TPS baseline 场景：低压力流式输入，用来确认没有任何额外抖动或 finalize 误触发。',
    steps: [
      {
        id: 'slow-baseline-1',
        label: 'Heading only',
        content: '## Slow baseline repro\n\n',
      },
      {
        id: 'slow-baseline-2',
        label: 'Paragraph 1',
        content: `## Slow baseline repro

${slowBaselineParagraph}
`,
      },
      {
        id: 'slow-baseline-3',
        label: 'Paragraph 2',
        content: `## Slow baseline repro

${slowBaselineParagraph}

${slowBaselineParagraph}
`,
      },
    ],
  },
  {
    id: 'block-burst-via-smoother',
    group: 'stress',
    title: 'Paragraphs via smoother',
    description:
      '对标 LobeUI 的 paragraphs-via-smoother 场景：每段都低于 large-append 阈值，重点看 smoother lane 是否稳定，而不是切进 syncImmediate。',
    steps: [
      {
        id: 'block-burst-via-smoother-1',
        label: 'Heading only',
        content: '## Paragraphs via smoother repro\n\n',
      },
      {
        id: 'block-burst-via-smoother-2',
        label: 'Paragraph 1',
        content: `## Paragraphs via smoother repro

${blockBurstViaSmootherParagraphA}
`,
      },
      {
        id: 'block-burst-via-smoother-3',
        label: 'Paragraph 2',
        content: `## Paragraphs via smoother repro

${blockBurstViaSmootherParagraphA}

${blockBurstViaSmootherParagraphB}
`,
      },
    ],
  },
  {
    id: 'fast-small-chunks',
    group: 'stress',
    title: 'Fast small chunks',
    description:
      '对标 LobeUI 的 fast small chunks 场景：小块但高频，重点观察 backlog 压力下是否仍能保持每个块的 reveal 顺序。',
    steps: [
      {
        id: 'fast-small-chunks-1',
        label: 'Heading only',
        content: '## Fast small chunks repro\n\n',
      },
      {
        id: 'fast-small-chunks-2',
        label: 'Chunk A',
        content: `## Fast small chunks repro

${fastSmallChunksParagraphA}
`,
      },
      {
        id: 'fast-small-chunks-3',
        label: 'Chunk B',
        content: `## Fast small chunks repro

${fastSmallChunksParagraphA}

${fastSmallChunksParagraphB}
`,
      },
      {
        id: 'fast-small-chunks-4',
        label: 'Chunk C',
        content: `## Fast small chunks repro

${fastSmallChunksParagraphA}

${fastSmallChunksParagraphB}

${fastSmallChunksParagraphC}
`,
      },
    ],
  },
  {
    id: 'ultra-fast-250tps',
    group: 'stress',
    title: 'Ultra fast stream',
    description:
      '对标 LobeUI 的 ultra fast stream 场景：持续高压输入下，确认 reveal queue 还能稳定收敛而不是一直堆积。',
    steps: [
      {
        id: 'ultra-fast-250tps-1',
        label: 'Heading only',
        content: '## Ultra fast stream repro\n\n',
      },
      {
        id: 'ultra-fast-250tps-2',
        label: 'Chunk A',
        content: `## Ultra fast stream repro

${ultraFastParagraphA}
`,
      },
      {
        id: 'ultra-fast-250tps-3',
        label: 'Chunk B',
        content: `## Ultra fast stream repro

${ultraFastParagraphA}

${ultraFastParagraphB}
`,
      },
      {
        id: 'ultra-fast-250tps-4',
        label: 'Chunk C',
        content: `## Ultra fast stream repro

${ultraFastParagraphA}

${ultraFastParagraphB}

${ultraFastParagraphC}
`,
      },
    ],
  },
  {
    id: 'slow-20tps',
    group: 'stress',
    title: 'Slow 20 TPS baseline',
    description: '对标 LobeUI 的 slow 20 TPS baseline：低压输入、稳定节奏，用来确认基础 reveal 路径没有额外抖动。',
    steps: [
      {
        id: 'slow-20tps-1',
        label: 'Heading only',
        content: '## Slow 20 TPS repro\n\n',
      },
      {
        id: 'slow-20tps-2',
        label: 'Paragraph 1',
        content: `## Slow 20 TPS repro

${slowBaselineParagraph}
`,
      },
      {
        id: 'slow-20tps-3',
        label: 'Paragraph 2',
        content: `## Slow 20 TPS repro

${slowBaselineParagraph}

${slowBaselineParagraph}
`,
      },
    ],
  },
]
