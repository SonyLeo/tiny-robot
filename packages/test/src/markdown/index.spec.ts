import { expect, test, type Locator } from '@playwright/test'

const readJsonDataset = async <T>(root: Locator, key: string) => {
  const raw = await root.getAttribute(key)
  return raw ? (JSON.parse(raw) as T) : null
}

const readStreamSnapshot = (root: Locator) => readJsonDataset<StreamSnapshot>(root, 'data-stream-snapshot')
const readStreamProfilerDebug = (root: Locator) =>
  readJsonDataset<StreamProfilerDebug>(root, 'data-stream-profiler-debug')

type StreamSnapshot = {
  active: boolean
  activeBlockCount: number
  activeIndex: number
  animatingIndex: number
  blockCount: number
  hardReset: boolean
  mode: string
  parseCount: number
  pendingCount: number
  phase: string
  profilerEnabled: boolean
  profilerEventCount: number
  queueLength: number
  resetCount: number
  rewriteCount: number
  schedulerPhase: string
  skippedBuckets: Array<{ type: string }>
  skippedCharCount: number
  skippedNodeCount: number
  streamingIndex: number
  tailKind: string
  updateKind: string
}

type StreamProfilerDebug = {
  blockCommitCount: number
  finalizeCount: number
  fpsSampleCount: number
  inputRewriteCount: number
  rootCommitCount: number
  tokenPreservedCount: number
  tokenScheduleCount: number
}

test.describe('markdown component', () => {
  test.describe.configure({ mode: 'serial' })

  test('renders markdown structure, color preview, and bubble integration paths', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()
    const staticMarkdown = page.getByTestId('markdown-static')
    const articleMarkdown = page.getByTestId('markdown-article')
    const bubbleMarkdown = page.getByTestId('markdown-bubble').locator('[data-type="markdown"]')
    const bubbleFallbackSection = page.getByTestId('markdown-bubble-fallback')
    const bubbleContentTypeSection = page.getByTestId('markdown-bubble-content-type')

    await expect(page.getByRole('heading', { name: 'Markdown Demo' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Markdown Title' })).toHaveCount(2)
    await expect(staticMarkdown.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(staticMarkdown.locator('.tr-markdown__table')).toHaveCount(1)
    await expect(staticMarkdown.locator('.tr-markdown__table').first()).toContainText('Unique identifier')
    await expect(staticMarkdown.locator('.tr-markdown__link').first()).toHaveAttribute('target', '_blank')
    await expect(staticMarkdown.locator('.tr-markdown__link').first()).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(staticMarkdown.locator('br')).toHaveCount(1)
    await expect(staticMarkdown.locator('.tr-markdown__task-checkbox')).toHaveCount(2)
    await expect(staticMarkdown.locator('.tr-markdown__task-checkbox').nth(1)).toBeChecked()
    await expect(staticMarkdown.locator('.tr-markdown__underline')).toHaveCount(1)
    await expect(staticMarkdown.locator('.tr-markdown__subscript')).toContainText('2')
    await expect(staticMarkdown.locator('.tr-markdown__superscript')).toContainText('2')
    await expect(staticMarkdown.locator('.tr-markdown__kbd').first()).toContainText('Ctrl')
    await expect(page.getByTestId('markdown-colors').locator('.tr-markdown__inline-code--color-preview')).toHaveCount(3)
    await expect(articleMarkdown.locator('.tr-markdown--article')).toBeVisible()
    await expect(articleMarkdown.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(articleMarkdown.locator('.tr-markdown__table')).toHaveCount(1)
    await expect(articleMarkdown).toContainText('Long Article Regression')
    await expect(articleMarkdown).toContainText('Appendix')
    await expect(bubbleMarkdown).toBeVisible()
    await expect(bubbleMarkdown.locator('.tr-markdown__task-checkbox')).toHaveCount(2)
    await expect(
      bubbleFallbackSection.locator('[data-bubble-markdown-mode="fallback"] .tr-markdown__link'),
    ).toHaveAttribute('target', '_self')
    await expect(bubbleFallbackSection.locator('.tr-markdown__copy-button')).toHaveCount(0)
    await expect(
      bubbleContentTypeSection.locator('[data-bubble-markdown-mode="content-type"] .tr-markdown__link'),
    ).toHaveAttribute('target', '_self')
    await expect(bubbleContentTypeSection.locator('.tr-markdown__copy-button')).toHaveCount(0)
    await expect(bubbleContentTypeSection.locator('.tr-bubble__text').last()).toContainText(
      'This trailing text item intentionally remains on the default text renderer.',
    )
  })

  test('shows snippet copy interaction and copied feedback', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const snippetSection = page.getByTestId('markdown-snippet')
    const snippet = snippetSection.locator('.tr-markdown__code-snippet-wrap').first()
    const copyButton = snippet.locator('.tr-markdown__copy-button').first()

    await expect(snippet).toBeVisible()
    await snippet.locator('.shiki').waitFor({ state: 'visible', timeout: 15000 })
    await expect(copyButton).toBeVisible()
    await copyButton.click()
    await expect(copyButton).toHaveAttribute('title', 'Copied')
  })

  test('renders full code mode, shiki output, and custom actions', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const fullSection = page.getByTestId('markdown-code-full')
    const fullBlocks = fullSection.locator('.tr-markdown__code-block-wrap--full')
    const firstBlock = fullBlocks.first()
    const expandButton = firstBlock.locator('.tr-markdown__code-expand').first()
    const toolbar = firstBlock.locator('.tr-markdown__code-toolbar').first()

    await expect(fullBlocks).toHaveCount(2)
    await firstBlock.locator('.shiki').waitFor({ state: 'visible', timeout: 15000 })
    await expect(firstBlock.locator('.shiki .line.diff.add')).toHaveCount(1)
    await expect(firstBlock.locator('.tr-markdown__code-language')).toBeVisible()
    await expect(toolbar).toHaveCSS('opacity', '0')
    await firstBlock.hover()
    await expect(toolbar).toHaveCSS('opacity', '1')
    await expect(fullSection.getByRole('button', { name: 'Custom action' }).first()).toBeVisible()
    await expect(expandButton).toHaveAttribute('title', 'Collapse code block')
    await expandButton.click()
    await expect(expandButton).toHaveAttribute('title', 'Expand code block')
    await expect(firstBlock.locator('.tr-markdown__code-full-body')).toHaveClass(
      /tr-markdown__code-full-body--collapsed/,
    )
  })

  test('renders html preview only when enabled for a full html document', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-html-preview-disabled')
    const enabledSection = page.getByTestId('markdown-html-preview-enabled')
    const fragmentSection = page.getByTestId('markdown-html-preview-fragment')

    await expect(disabledSection.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)
    await expect(disabledSection.locator('[data-code-type="html-preview"]')).toHaveCount(0)

    const previewBlock = enabledSection.locator('[data-code-type="html-preview"]').first()
    const toolbar = previewBlock.locator('.tr-markdown__html-preview-toolbar')

    await expect(previewBlock).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-modals',
    )
    await expect(toolbar).toHaveCSS('opacity', '0')
    await previewBlock.hover()
    await expect(toolbar).toHaveCSS('opacity', '1')
    await expect(toolbar.getByRole('button', { name: 'Preview' })).toHaveClass(
      /tr-markdown__html-preview-segment--active/,
    )
    const sourceButton = toolbar.getByRole('button', { name: 'Code', exact: true })
    const previewButton = toolbar.getByRole('button', { name: 'Preview', exact: true })

    await sourceButton.click()
    await expect(sourceButton).toHaveClass(/tr-markdown__html-preview-segment--active/)
    await expect(previewBlock.locator('.tr-markdown__code-highlight--block')).toContainText(
      'Hello from inside Markdown',
    )
    await previewButton.click()
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
    await expect(previewBlock.getByRole('button', { name: 'Copy HTML code' })).toBeVisible()
    await previewBlock.getByRole('button', { name: 'Copy HTML code' }).click()
    await expect(previewBlock.getByRole('button', { name: 'Copy HTML code' })).toHaveAttribute('title', 'Copied')
    await expect(previewBlock.getByRole('button', { name: 'Download HTML' })).toBeVisible()

    await expect(fragmentSection.locator('[data-code-type="html-preview"]')).toHaveCount(0)
    await expect(fragmentSection.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)
  })

  test('matches html preview streaming auto/live/defer behavior', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const autoNoScriptSection = page.getByTestId('markdown-html-preview-stream-auto-noscript')
    const autoScriptSection = page.getByTestId('markdown-html-preview-stream-auto-script')
    const liveScriptSection = page.getByTestId('markdown-html-preview-stream-live-script')
    const deferNoScriptSection = page.getByTestId('markdown-html-preview-stream-defer-noscript')

    const autoNoScriptBlock = autoNoScriptSection.locator('[data-code-type="html-preview"]').first()
    const autoScriptBlock = autoScriptSection.locator('[data-code-type="html-preview"]').first()
    const liveScriptBlock = liveScriptSection.locator('[data-code-type="html-preview"]').first()
    const deferNoScriptBlock = deferNoScriptSection.locator('[data-code-type="html-preview"]').first()

    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'auto')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'head')
    await expect(autoNoScriptBlock.locator('.tr-markdown__html-preview-loading')).toHaveCount(1)
    await expect(autoNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await autoNoScriptSection.getByRole('button', { name: 'Close head' }).click()
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'true')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-stable', 'true')
    await expect(autoNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    await autoNoScriptSection.getByRole('button', { name: 'Close document' }).click()
    await expect(autoNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'auto')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'head')
    await expect(autoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await autoScriptSection.getByRole('button', { name: 'Attach script' }).click()
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-script-locked', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'script')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'false')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-stable', 'false')
    await expect(autoScriptBlock.locator('.tr-markdown__html-preview-loading-badge')).toContainText(
      'Waiting for closing </html> before booting scripts',
    )
    await expect(autoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await autoScriptSection.getByRole('button', { name: 'Close document' }).click()
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-stable', 'true')
    await expect(autoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'live')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'head')
    await expect(liveScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await liveScriptSection.getByRole('button', { name: 'Attach script' }).click()
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-script-locked', 'true')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'true')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-stable', 'true')
    await expect(liveScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'defer')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'head')
    await expect(deferNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await deferNoScriptSection.getByRole('button', { name: 'Close head' }).click()
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-script-locked', 'false')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'defer')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'false')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-stable', 'false')
    await expect(deferNoScriptBlock.locator('.tr-markdown__html-preview-loading-badge')).toContainText(
      'Deferred until closing </html>',
    )
    await expect(deferNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await deferNoScriptSection.getByRole('button', { name: 'Close document' }).click()
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-stable', 'true')
    await expect(deferNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
  })

  test('renders generic raw HTML only when the public html feature is enabled', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-html-raw-disabled')
    const enabledSection = page.getByTestId('markdown-html-raw-enabled')

    await expect(disabledSection.locator('[data-raw-html-chip="inline"]')).toHaveCount(0)
    await expect(disabledSection.locator('[data-raw-html-block="true"]')).toHaveCount(0)
    await expect(disabledSection).toContainText(
      '<span class="raw-html-chip" data-raw-html-chip="inline">inline html</span>',
    )

    await expect(enabledSection.locator('[data-raw-html-chip="inline"]')).toHaveCount(1)
    await expect(enabledSection.locator('[data-raw-html-block="true"]')).toHaveCount(1)
    await expect(enabledSection.locator('[data-raw-html-block="true"]')).toContainText(
      'Generic raw HTML now has a dedicated render path.',
    )
  })

  test('keeps html preview source fidelity for source view and exported text surfaces', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const section = page.getByTestId('markdown-html-preview-fidelity')
    const previewBlock = section.locator('[data-code-type="html-preview"]').first()
    const sourceBlock = previewBlock.locator('.tr-markdown__html-preview-source')

    await expect(previewBlock).toHaveCount(1)
    await expect(sourceBlock).toContainText(
      '<pre id="fidelity-target">  leading and trailing whitespace preserved  </pre>',
    )
    await expect(sourceBlock).toContainText('<title> Fidelity </title>')
  })

  test('updates injected markdown context consumers after prop changes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const section = page.getByTestId('markdown-context-reactive')
    const probe = section.locator('.markdown-demo__context-probe').first()

    await expect(probe).toHaveAttribute('data-context-variant', 'default')
    await expect(probe).toHaveAttribute('data-context-link-target', '_blank')
    await expect(probe).toHaveAttribute('data-context-link-rel', 'noopener noreferrer')
    await expect(probe).toHaveAttribute('data-context-html-enabled', 'false')
    await expect(probe).toHaveAttribute('data-context-copyable', 'true')
    await expect(probe).toHaveAttribute('data-context-streaming-active', 'false')

    await section.getByRole('button', { name: 'Article' }).click()

    await expect(probe).toHaveAttribute('data-context-variant', 'article')
    await expect(probe).toHaveAttribute('data-context-link-target', '_self')
    await expect(probe).toHaveAttribute('data-context-link-rel', 'nofollow')
    await expect(probe).toHaveAttribute('data-context-html-enabled', 'true')
    await expect(probe).toHaveAttribute('data-context-copyable', 'false')
    await expect(probe).toHaveAttribute('data-context-streaming-active', 'true')
    await expect(probe).toHaveAttribute('data-context-streaming-enabled', 'true')
  })

  test('renders math only when enabled and keeps fallback visible for invalid formulas', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-math-disabled')
    const inlineSection = page.getByTestId('markdown-math-inline')
    const blockSection = page.getByTestId('markdown-math-block')
    const invalidSection = page.getByTestId('markdown-math-invalid')

    await expect(disabledSection.locator('.katex')).toHaveCount(0)
    await expect(disabledSection).toContainText('$E = mc^2$')

    const inlineMath = inlineSection.locator('[data-math-display="inline"]').first()
    const blockMath = blockSection.locator('[data-code-type="math"]').first()
    const invalidMath = invalidSection.locator('[data-code-type="math"]').first()

    await expect(inlineMath).toHaveAttribute('data-math-state', 'ready', { timeout: 20000 })
    await expect(inlineMath).toHaveAttribute('data-math-error', 'false')
    await expect(inlineMath.locator('.katex')).toHaveCount(1)

    await expect(blockMath).toHaveAttribute('data-math-state', 'ready', { timeout: 20000 })
    await expect(blockMath).toHaveAttribute('data-math-error', 'false')
    await expect(blockMath.locator('.katex-display')).toHaveCount(1)

    await expect(invalidMath).toHaveAttribute('data-math-state', 'error', { timeout: 20000 })
    await expect(invalidMath).toHaveAttribute('data-math-error', 'true')
    await expect(invalidMath.locator('.katex-error')).toHaveCount(1)
    await expect(invalidMath.locator('.tr-markdown__math-error-badge')).toContainText('KaTeX fallback rendered')
    await expect(invalidMath.locator('.tr-markdown__math-source')).toContainText('\\frac{1}{')
  })

  test('renders mermaid blocks only when enabled and preserves source fallback on errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-mermaid-disabled')
    const flowchartSection = page.getByTestId('markdown-mermaid-flowchart')
    const sequenceSection = page.getByTestId('markdown-mermaid-sequence')
    const invalidSection = page.getByTestId('markdown-mermaid-invalid')

    await expect(disabledSection.locator('[data-code-type="mermaid"]')).toHaveCount(0)
    await expect(disabledSection.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)

    const flowchartBlock = flowchartSection.locator('[data-code-type="mermaid"]').first()
    const sequenceBlock = sequenceSection.locator('[data-code-type="mermaid"]').first()
    const invalidBlock = invalidSection.locator('[data-code-type="mermaid"]').first()

    await expect(flowchartBlock).toHaveAttribute('data-mermaid-mode', 'preview')
    await expect(flowchartBlock).toHaveAttribute('data-mermaid-state', 'ready', { timeout: 20000 })
    await expect(flowchartBlock.locator('.tr-markdown__mermaid-preview svg')).toHaveCount(1)
    await expect(flowchartBlock.getByRole('button', { name: 'Copy code' })).toBeVisible()

    const flowchartSourceButton = flowchartBlock.getByRole('button', { name: 'Code', exact: true })
    const flowchartPreviewButton = flowchartBlock.getByRole('button', { name: 'Preview', exact: true })

    await flowchartSourceButton.click()
    await expect(flowchartBlock).toHaveAttribute('data-mermaid-mode', 'source')
    await expect(flowchartSourceButton).toHaveClass(/tr-markdown__mermaid-segment--active/)
    await expect(flowchartBlock.locator('.tr-markdown__mermaid-source')).toContainText('flowchart TD')
    await flowchartBlock.getByRole('button', { name: 'Copy code' }).click()
    await expect(flowchartBlock.getByRole('button', { name: 'Copy code' })).toHaveAttribute('title', 'Copied')
    await flowchartPreviewButton.click()
    await expect(flowchartBlock).toHaveAttribute('data-mermaid-mode', 'preview')
    await expect(flowchartBlock.locator('.tr-markdown__mermaid-preview svg')).toHaveCount(1)

    await expect(sequenceBlock).toHaveAttribute('data-mermaid-state', 'ready', { timeout: 20000 })
    await expect(sequenceBlock.locator('.tr-markdown__mermaid-preview svg')).toHaveCount(1)

    await expect(invalidBlock).toHaveAttribute('data-mermaid-state', 'error', { timeout: 20000 })
    await expect(invalidBlock.locator('.tr-markdown__mermaid-error-badge')).toContainText('Mermaid render failed')
    await expect(invalidBlock.locator('.tr-markdown__mermaid-error-message')).toBeVisible()
    await expect(invalidBlock.getByRole('button', { name: 'Retry' })).toBeVisible()

    const invalidSourceButton = invalidBlock.getByRole('button', { name: 'Code', exact: true })
    const invalidPreviewButton = invalidBlock.getByRole('button', { name: 'Preview', exact: true })

    await invalidSourceButton.click()
    await expect(invalidBlock).toHaveAttribute('data-mermaid-mode', 'source')
    await expect(invalidBlock.locator('.tr-markdown__mermaid-source').last()).toContainText('Start -->')
    await invalidPreviewButton.click()
    await expect(invalidBlock).toHaveAttribute('data-mermaid-mode', 'preview')
    await expect(invalidBlock).toHaveAttribute('data-mermaid-state', 'error')
  })

  test('renders footnotes only when enabled and keeps repeated references wired', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-footnotes-disabled')
    const singleSection = page.getByTestId('markdown-footnotes-single')
    const repeatedSection = page.getByTestId('markdown-footnotes-repeated')
    const inlineSection = page.getByTestId('markdown-footnotes-inline')

    await expect(disabledSection.locator('.tr-markdown__footnote-ref')).toHaveCount(0)
    await expect(disabledSection.locator('.tr-markdown__footnotes')).toHaveCount(0)
    await expect(disabledSection).toContainText('[^1]')

    const singleRef = singleSection.locator('.tr-markdown__footnote-ref-link').first()
    const singleFootnotes = singleSection.locator('.tr-markdown__footnotes').first()
    const singleItem = singleSection.locator('.tr-markdown__footnote-item').first()
    const singleBackref = singleSection.locator('.tr-markdown__footnote-backref').first()

    await expect(singleRef).toHaveAttribute('href', '#fn1')
    await expect(singleRef).toHaveAttribute('id', 'fnref1')
    await expect(singleRef).toContainText('[1]')
    await expect(singleFootnotes.locator('.tr-markdown__footnotes-separator')).toHaveCount(1)
    await expect(singleItem).toHaveAttribute('id', 'fn1')
    await expect(singleItem).toContainText('Footnotes should feel first-party')
    await expect(singleBackref).toHaveAttribute('href', '#fnref1')

    const repeatedRefs = repeatedSection.locator('.tr-markdown__footnote-ref-link')
    const repeatedItem = repeatedSection.locator('.tr-markdown__footnote-item').first()
    const repeatedBackrefs = repeatedSection.locator('.tr-markdown__footnote-backref')

    await expect(repeatedRefs).toHaveCount(2)
    await expect(repeatedRefs.nth(0)).toHaveAttribute('id', 'fnref1')
    await expect(repeatedRefs.nth(1)).toHaveAttribute('id', 'fnref1:1')
    await expect(repeatedRefs.nth(0)).toContainText('[1]')
    await expect(repeatedRefs.nth(1)).toContainText('[1:1]')
    await expect(repeatedItem.locator('.tr-markdown__link')).toHaveAttribute('href', 'https://example.com')
    await expect(repeatedItem.locator('.tr-markdown__inline-code')).toContainText('code')
    await expect(repeatedBackrefs).toHaveCount(2)
    await expect(repeatedBackrefs.nth(0)).toHaveAttribute('href', '#fnref1')
    await expect(repeatedBackrefs.nth(1)).toHaveAttribute('href', '#fnref1:1')

    const inlineRef = inlineSection.locator('.tr-markdown__footnote-ref-link').first()
    const inlineItem = inlineSection.locator('.tr-markdown__footnote-item').first()

    await expect(inlineRef).toHaveAttribute('href', '#fn1')
    await expect(inlineItem).toContainText('Inline note body')
    await expect(inlineItem.locator('strong')).toContainText('emphasis')
  })

  test('renders GitHub alerts only when enabled and keeps plain blockquotes untouched', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-alerts-disabled')
    const matrixSection = page.getByTestId('markdown-alerts-matrix')
    const compareSection = page.getByTestId('markdown-alerts-compare')

    await expect(disabledSection.locator('.tr-markdown__alert')).toHaveCount(0)
    await expect(disabledSection.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(disabledSection).toContainText('[!NOTE]')

    const kinds = [
      ['note', 'Note', 'note'],
      ['tip', 'Tip', 'note'],
      ['important', 'Important', 'note'],
      ['warning', 'Warning', 'alert'],
      ['caution', 'Caution', 'alert'],
    ] as const

    await expect(matrixSection.locator('.tr-markdown__alert')).toHaveCount(kinds.length)

    for (const [kind, title, role] of kinds) {
      const alert = matrixSection.locator(`.tr-markdown__alert[data-alert-kind="${kind}"]`).first()

      await expect(alert).toHaveAttribute('role', role)
      await expect(alert.locator('.tr-markdown__alert-title')).toContainText(title)
      await expect(alert).not.toContainText(`[!${title.toUpperCase()}]`)
    }

    const noteAlert = matrixSection.locator('.tr-markdown__alert[data-alert-kind="note"]').first()
    await expect(noteAlert).toContainText('TinyRobot now treats GitHub alerts as first-party callouts.')
    await expect(noteAlert.locator('.tr-markdown__paragraph')).toHaveCount(2)
    await expect(noteAlert.locator('.tr-markdown__link')).toHaveAttribute('href', 'https://example.com')
    await expect(noteAlert.locator('.tr-markdown__inline-code')).toContainText('code')

    await expect(compareSection.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(compareSection.locator('.tr-markdown__blockquote')).toContainText(
      'Plain blockquotes should stay on the default quote path.',
    )
    await expect(compareSection.locator('.tr-markdown__alert')).toHaveCount(2)

    const tipAlert = compareSection.locator('.tr-markdown__alert[data-alert-kind="tip"]').first()
    const warningAlert = compareSection.locator('.tr-markdown__alert[data-alert-kind="warning"]').first()

    await expect(tipAlert).toContainText('Same-line alerts should also work without leaking the marker into the body.')
    await expect(tipAlert).not.toContainText('[!TIP]')

    await expect(warningAlert).toHaveAttribute('role', 'alert')
    await expect(warningAlert.locator('.tr-markdown__paragraph')).toHaveCount(2)
    await expect(warningAlert.locator('.tr-markdown__paragraph').first()).toContainText(
      'The marker should disappear from the first paragraph.',
    )
    await expect(warningAlert.locator('.tr-markdown__paragraph').last()).toContainText(
      'A follow-up paragraph should stay inside the same alert block.',
    )
    await expect(warningAlert).not.toContainText('[!WARNING]')
  })

  test('renders first-party citations and keeps code boundaries untouched', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const generalSection = page.getByTestId('markdown-citations-general')
    const boundarySection = page.getByTestId('markdown-citations-code-boundary')
    const generalSourceCards = generalSection.locator('[data-citation-source-card="true"]')
    const generalTriggers = generalSection.locator('[data-citation-trigger="true"]')
    const boundaryTriggers = boundarySection.locator('[data-citation-trigger="true"]')

    await expect(generalSection.locator('[data-citation-source-list="true"]')).toHaveCount(1)
    await expect(generalSourceCards).toHaveCount(3)
    await expect(generalSourceCards.first()).toHaveAttribute(
      'href',
      'https://www.weather.com.cn/weather/101210101.shtml',
    )
    await expect(generalTriggers).toHaveCount(4)
    await expect(generalTriggers.first()).toContainText('[1]')
    await expect(generalTriggers.first()).toHaveAttribute(
      'data-citation-url',
      'https://www.weather.com.cn/weather/101210101.shtml',
    )
    await expect(generalSection.locator('.tr-markdown__citation')).toHaveCount(4)

    await expect(boundarySection.locator('[data-citation-source-list="true"]')).toHaveCount(1)
    await expect(boundarySection.locator('[data-citation-source-card="true"]')).toHaveCount(3)
    await expect(boundaryTriggers).toHaveCount(1)
    await expect(boundaryTriggers.first()).toContainText('[1]')
    await expect(boundarySection.locator('.tr-markdown__inline-code')).toContainText('coord[1]')
    await expect(boundarySection.locator('.tr-markdown__code-block-wrap')).toContainText('console.log(coord[1])')
    await expect(boundarySection.locator('.tr-markdown__code-block-wrap [data-citation-trigger="true"]')).toHaveCount(0)
    await expect(boundarySection.locator('.tr-markdown__inline-code [data-citation-trigger="true"]')).toHaveCount(0)
  })

  test('renders standalone video tags as first-party media nodes without enabling raw html', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const videoSection = page.getByTestId('markdown-video')
    const videoWrap = videoSection.locator('.tr-markdown__video-wrap').first()
    const video = videoWrap.locator('.tr-markdown__video').first()

    await expect(videoWrap).toHaveCount(1)
    await expect(video).toHaveCount(1)
    await expect(video).toHaveAttribute(
      'src',
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    )
    await expect(video).toHaveAttribute(
      'poster',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    )
    await expect(video).toHaveAttribute('preload', 'metadata')
    await expect(video).toHaveAttribute('controls', '')
    await expect(videoSection).toContainText('A standalone')
    await expect(videoSection).toContainText('first-party media node')
    await expect(videoSection).toContainText('TinyRobot keeps this path narrow')
    await expect(videoSection.locator('.tr-markdown__link')).toHaveCount(0)
  })

  test('enables markdown-owned image gallery only when the feature is on', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const disabledSection = page.getByTestId('markdown-image-gallery-disabled')
    const enabledSection = page.getByTestId('markdown-image-gallery-enabled')
    const enabledRoot = enabledSection.locator('.tr-markdown-root')

    await expect(disabledSection.locator('.tr-markdown__image')).toHaveCount(3)
    await expect(disabledSection.locator('[data-image-gallery-trigger="true"]')).toHaveCount(0)
    await expect(disabledSection.locator('[data-image-gallery="true"]')).toHaveCount(0)

    await expect(enabledRoot).toHaveAttribute('data-image-gallery-enabled', 'true')
    await expect(enabledRoot).toHaveAttribute('data-image-gallery-count', '3')
    await expect(enabledSection.locator('[data-image-gallery-trigger="true"]')).toHaveCount(3)

    await enabledSection.locator('[data-image-gallery-trigger="true"]').first().click()

    const gallery = page.locator('[data-image-gallery="true"]').first()
    await expect(gallery).toBeVisible()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '0')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Desk setup')
    await expect(gallery.locator('.tr-markdown__image-gallery-thumbnail')).toHaveCount(3)

    await gallery.getByRole('button', { name: 'Next image' }).click()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '1')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Ops wall')

    await gallery.locator('.tr-markdown__image-gallery-thumbnail').nth(2).click()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '2')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Team board')

    await page.keyboard.press('Escape')
    await expect(gallery).toHaveCount(0)
  })

  test('passes componentProps to custom and default markdown components', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const section = page.getByTestId('markdown-component-props')
    const heading = section.locator('.markdown-demo__custom-heading').first()
    const link = section.locator('.markdown-demo__custom-link').first()
    const inlineCode = section.locator('.markdown-demo__custom-inline-code').first()
    const paragraphs = section.locator('.tr-markdown__paragraph[data-component-props-paragraph="true"]')

    await expect(heading).toHaveAttribute('data-heading-badge', 'M5.7')
    await expect(heading.locator('[data-custom-heading-badge="true"]')).toContainText('M5.7')
    await expect(link).toHaveAttribute('data-link-tone', 'brand')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link.locator('[data-custom-link-icon="true"]')).toContainText('DOCS')
    await expect(inlineCode).toHaveAttribute('data-inline-label', 'TOKEN')
    await expect(inlineCode).toHaveAttribute('data-inline-tone', 'brand')
    await expect(inlineCode).toContainText('inline token')
    await expect(paragraphs).toHaveCount(2)
  })

  test('renders first-party custom semantic blocks without exposing generic plugin APIs', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const section = page.getByTestId('markdown-custom-plugins')
    const thinking = section.locator('[data-thinking-block="true"]').first()
    const trigger = section.locator('[data-thinking-trigger="true"]').first()
    const artifact = section.locator('[data-artifact-block="true"]').first()

    await expect(thinking).toHaveCount(1)
    await expect(thinking).not.toHaveAttribute('open', '')
    await trigger.click()
    await expect(thinking).toHaveAttribute('open', '')
    await expect(thinking.locator('[data-thinking-body="true"]')).toContainText(
      '这个请求先适合暴露一个可折叠的 reasoning 语义块',
    )

    await expect(artifact).toHaveCount(1)
    await expect(artifact).toHaveAttribute('data-artifact-identifier', 'sleep-interpretation-card')
    await expect(artifact).toHaveAttribute('data-artifact-type', 'image/svg+xml')
    await expect(artifact.locator('[data-artifact-preview="true"] img')).toHaveAttribute('src', /data:image\/svg\+xml/)
    await expect(artifact.locator('.tr-markdown__artifact-pre')).toContainText(
      '<svg xmlns="http://www.w3.org/2000/svg"',
    )

    await expect(
      section.getByText('<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>'),
    ).toContainText('<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>')
  })

  test('renders custom alert shells through renderOptions without replacing markdown children', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const section = page.getByTestId('markdown-alert-render')
    const customAlerts = section.locator('.markdown-demo__custom-alert')
    const noteAlert = section.locator('.markdown-demo__custom-alert[data-custom-alert-kind="note"]').first()
    const cautionAlert = section.locator('.markdown-demo__custom-alert[data-custom-alert-kind="caution"]').first()

    await expect(customAlerts).toHaveCount(2)
    await expect(section.locator('.tr-markdown__alert')).toHaveCount(0)
    await expect(section.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(noteAlert).toHaveAttribute('role', 'note')
    await expect(noteAlert.locator('.markdown-demo__custom-alert-title')).toContainText('Note')
    await expect(noteAlert.locator('.tr-markdown__link')).toHaveAttribute('href', 'https://example.com')
    await expect(noteAlert.locator('.tr-markdown__inline-code')).toContainText('code')
    await expect(cautionAlert).toHaveAttribute('role', 'alert')
    await expect(cautionAlert.locator('.markdown-demo__custom-alert-title')).toContainText('Caution')
  })

  test('holds incomplete streaming structures until they are complete', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const linkSection = page.getByTestId('markdown-stream-link')
    const imageSection = page.getByTestId('markdown-stream-image')
    const codeSection = page.getByTestId('markdown-stream-code')
    const tableSection = page.getByTestId('markdown-stream-table')

    await expect(linkSection.locator('.tr-markdown__link')).toHaveCount(0)
    await expect(linkSection.locator('.tr-markdown__stream-tail--link')).toContainText('[TinyRobot')
    await linkSection.getByRole('button', { name: 'Close link' }).click()
    await expect(linkSection.locator('.tr-markdown__stream-tail--link')).toHaveCount(0)
    await expect(linkSection.locator('.tr-markdown__link')).toHaveCount(1)
    await expect(linkSection.locator('.tr-markdown__link')).toHaveAttribute(
      'href',
      'https://docs.opentiny.design/tiny-robot/',
    )

    await expect(imageSection.locator('.tr-markdown__image')).toHaveCount(0)
    await expect(imageSection.locator('.tr-markdown__stream-tail--image')).toContainText('![TinyRobot')
    await imageSection.getByRole('button', { name: 'Open target' }).click()
    await expect(imageSection.locator('.tr-markdown__stream-tail--image')).toContainText(
      '![TinyRobot logo](https://docs.opentiny.design',
    )
    await imageSection.getByRole('button', { name: 'Close image' }).click()
    await expect(imageSection.locator('.tr-markdown__stream-tail--image')).toHaveCount(0)
    await expect(imageSection.locator('.tr-markdown__image')).toHaveCount(1)
    await expect(imageSection.locator('.tr-markdown__image')).toHaveAttribute(
      'src',
      'https://docs.opentiny.design/images/logo-opentiny-next-text.svg',
    )

    await expect(codeSection.locator('.tr-markdown__code-block-wrap')).toHaveCount(0)
    await expect(codeSection.locator('.tr-markdown__stream-tail--code')).toContainText("const status = 'streaming'")
    await codeSection.getByRole('button', { name: 'Close fence' }).click()
    await expect(codeSection.locator('.tr-markdown__stream-tail--code')).toHaveCount(0)
    await expect(codeSection.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)
    await expect(codeSection.locator('.tr-markdown__code-block-wrap').first()).toHaveAttribute('data-language', 'ts')

    await expect(tableSection.locator('.tr-markdown__table')).toHaveCount(0)
    await expect(tableSection.locator('.tr-markdown__stream-tail--table')).toContainText('| Name | Type |')
    await tableSection.getByRole('button', { name: 'Flush table' }).click()
    await expect(tableSection.locator('.tr-markdown__stream-tail--table')).toHaveCount(0)
    await expect(tableSection.locator('.tr-markdown__table')).toHaveCount(1)
    await expect(tableSection.locator('.tr-markdown__table')).toContainText('retryCount')
  })

  test('keeps parse count stable while only the smoothing tail changes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const smoothingSection = page.getByTestId('markdown-stream-smoothing')
    const parseCount = smoothingSection.getByTestId('markdown-stream-smoothing-parse-count')
    const smoothingRoot = smoothingSection.locator('.tr-markdown-root')

    await expect(parseCount).toHaveText('parseCount: 1')
    await expect(smoothingRoot).toHaveAttribute('data-stream-parse-count', '1')
    await smoothingSection.getByRole('button', { name: 'Chunk 2' }).click()
    await expect(parseCount).toHaveText('parseCount: 1')
    await expect(smoothingRoot).toHaveAttribute('data-stream-parse-count', '1')
    await smoothingSection.getByRole('button', { name: 'Chunk 3' }).click()
    await expect(parseCount).toHaveText('parseCount: 2')
    await expect(smoothingRoot).toHaveAttribute('data-stream-parse-count', '2')
  })

  test('exposes animated streaming telemetry, handles rewrite reset, skips non-text nodes, and finalizes cleanly', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()

    const largeAppendSection = page.getByTestId('markdown-stream-animated-large-append')
    const paragraphBurstSection = page.getByTestId('markdown-stream-animated-paragraph-burst')
    const fastChunksSection = page.getByTestId('markdown-stream-animated-fast-chunks')
    const rewriteResetSection = page.getByTestId('markdown-stream-animated-rewrite-reset')
    const hardResetSection = page.getByTestId('markdown-stream-animated-hard-reset')
    const headingListSection = page.getByTestId('markdown-stream-animated-heading-list')
    const highTpsSection = page.getByTestId('markdown-stream-animated-high-tps')
    const quoteParagraphSection = page.getByTestId('markdown-stream-animated-quote-paragraph')
    const settlingAppendSection = page.getByTestId('markdown-stream-animated-settling-append')
    const variantsSection = page.getByTestId('markdown-stream-animated-variants')
    const bubbleIntegrationSection = page.getByTestId('markdown-stream-animated-bubble-integration')
    const skipMatrixSection = page.getByTestId('markdown-stream-animated-skip-matrix')

    const largeAppendRoot = largeAppendSection.locator('.tr-markdown-root')
    const paragraphBurstRoot = paragraphBurstSection.locator('.tr-markdown-root')
    const fastChunksRoot = fastChunksSection.locator('.tr-markdown-root')
    const rewriteResetRoot = rewriteResetSection.locator('.tr-markdown-root')
    const hardResetRoot = hardResetSection.locator('.tr-markdown-root')
    const headingListRoot = headingListSection.locator('.tr-markdown-root')
    const highTpsRoot = highTpsSection.locator('.tr-markdown-root')
    const quoteParagraphRoot = quoteParagraphSection.locator('.tr-markdown-root')
    const settlingAppendRoot = settlingAppendSection.locator('.tr-markdown-root')
    const variantsDefaultRoot = variantsSection
      .getByTestId('markdown-stream-animated-variants-default')
      .locator('.tr-markdown-root')
    const variantsBubbleRoot = variantsSection
      .getByTestId('markdown-stream-animated-variants-bubble')
      .locator('.tr-markdown-root')
    const variantsArticleRoot = variantsSection
      .getByTestId('markdown-stream-animated-variants-article')
      .locator('.tr-markdown-root')
    const bubbleFallbackRoot = bubbleIntegrationSection
      .getByTestId('markdown-stream-animated-bubble-fallback')
      .locator('.tr-markdown-root')
    const bubbleContentTypeRoot = bubbleIntegrationSection
      .getByTestId('markdown-stream-animated-bubble-content-type')
      .locator('.tr-markdown-root')
    const skipMatrixRoot = skipMatrixSection.locator('.tr-markdown-root')

    await largeAppendSection.getByRole('button', { name: 'Append payload' }).click()
    await expect(largeAppendRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect(largeAppendRoot).toHaveAttribute('data-stream-profiler-enabled', 'true')
    await expect.poll(async () => await largeAppendRoot.locator('.tr-markdown__stream-char').count()).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.activeBlockCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.blockCount ?? 0).toBeGreaterThan(1)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.pendingCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.activeIndex ?? -1).toBeGreaterThan(-1)
    await expect
      .poll(async () => (await readStreamSnapshot(largeAppendRoot))?.profilerEventCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.rootCommitCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.blockCommitCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.fpsSampleCount ?? 0)
      .toBeGreaterThanOrEqual(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.tokenScheduleCount ?? 0)
      .toBeGreaterThan(0)
    await largeAppendSection.getByRole('button', { name: 'Settle' }).click()
    await expect.poll(async () => await largeAppendRoot.getAttribute('data-stream-active')).toBe('false')
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes((await largeAppendRoot.getAttribute('data-stream-state')) || ''),
      )
      .toBeTruthy()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes((await largeAppendRoot.getAttribute('data-stream-scheduler-phase')) || ''),
      )
      .toBeTruthy()
    await expect
      .poll(async () => await largeAppendRoot.getAttribute('data-stream-state'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => await largeAppendRoot.getAttribute('data-stream-scheduler-phase'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.finalizeCount ?? 0, { timeout: 12000 })
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await largeAppendRoot.locator('.tr-markdown__stream-char').count(), { timeout: 12000 })
      .toBe(0)

    await paragraphBurstSection.getByRole('button', { name: 'Paragraph 3' }).click()
    await expect(paragraphBurstRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect
      .poll(async () => await paragraphBurstRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await paragraphBurstRoot.getAttribute('data-stream-parse-count')) || '0'))
      .toBeGreaterThan(0)

    await fastChunksSection.getByRole('button', { name: 'Chunk C' }).click()
    await expect(fastChunksRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => (await readStreamSnapshot(fastChunksRoot))?.blockCount ?? 0).toBeGreaterThan(2)
    await expect.poll(async () => (await readStreamSnapshot(fastChunksRoot))?.animatingIndex ?? -1).toBeGreaterThan(-1)
    await expect.poll(async () => (await readStreamSnapshot(fastChunksRoot))?.streamingIndex ?? -1).toBeGreaterThan(0)

    await headingListSection.getByRole('button', { name: 'List payload' }).click()
    await expect(headingListRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => await headingListRoot.locator('.tr-markdown__stream-char').count()).toBeGreaterThan(0)
    await expect
      .poll(async () => await headingListRoot.locator('.tr-markdown__list .tr-markdown__stream-char').count())
      .toBeGreaterThan(0)

    await quoteParagraphSection.getByRole('button', { name: 'Close quote' }).click()
    await expect(quoteParagraphRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect
      .poll(async () => await quoteParagraphRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await quoteParagraphRoot.locator('.tr-markdown__blockquote .tr-markdown__stream-char').count())
      .toBeGreaterThan(0)

    await quoteParagraphSection.getByRole('button', { name: 'Paragraph payload' }).click()
    await expect(quoteParagraphRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => (await readStreamSnapshot(quoteParagraphRoot))?.blockCount ?? 0).toBeGreaterThan(2)
    await expect(quoteParagraphRoot).toContainText('The quoted summary should reveal first')
    await expect(quoteParagraphRoot.locator('.tr-markdown__blockquote .tr-markdown__stream-char')).toHaveCount(0)

    await highTpsSection.getByRole('button', { name: 'Follow-up paragraph' }).click()
    await expect(highTpsRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => (await readStreamSnapshot(highTpsRoot))?.queueLength ?? 0).toBeGreaterThan(0)

    await settlingAppendSection.getByRole('button', { name: 'Settling candidate' }).click()
    await settlingAppendSection.getByRole('button', { name: 'Settle' }).click()
    await expect.poll(async () => await settlingAppendRoot.getAttribute('data-stream-active')).toBe('false')
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes(
          (await settlingAppendRoot.getAttribute('data-stream-scheduler-phase')) || '',
        ),
      )
      .toBeTruthy()
    await settlingAppendSection.getByRole('button', { name: 'Resume append' }).click()
    await expect.poll(async () => await settlingAppendRoot.getAttribute('data-stream-active')).toBe('true')
    await expect.poll(async () => await settlingAppendRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect
      .poll(async () => await settlingAppendRoot.getAttribute('data-stream-scheduler-phase'))
      .toBe('streaming')
    await expect
      .poll(async () => await settlingAppendRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await settlingAppendSection.getByRole('button', { name: 'Settle' }).click()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes((await settlingAppendRoot.getAttribute('data-stream-state')) || ''),
      )
      .toBeTruthy()
    await expect
      .poll(async () => await settlingAppendRoot.getAttribute('data-stream-state'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => await settlingAppendRoot.locator('.tr-markdown__stream-char').count(), { timeout: 12000 })
      .toBe(0)

    await variantsSection.getByRole('button', { name: 'High TPS burst animated' }).click()
    await variantsSection.getByRole('button', { name: 'Follow-up paragraph' }).click()
    await expect.poll(async () => await variantsDefaultRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await variantsBubbleRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await variantsArticleRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect
      .poll(async () => await variantsDefaultRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await variantsBubbleRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await variantsArticleRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)

    await variantsSection.getByRole('button', { name: 'Append during settling' }).click()
    await variantsSection.getByRole('button', { name: 'Settling candidate' }).click()
    await variantsSection.getByRole('button', { name: 'Settle' }).click()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes(
          (await variantsBubbleRoot.getAttribute('data-stream-scheduler-phase')) || '',
        ),
      )
      .toBeTruthy()
    await variantsSection.getByRole('button', { name: 'Resume append' }).click()
    await expect.poll(async () => await variantsDefaultRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await variantsBubbleRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await variantsArticleRoot.getAttribute('data-stream-state')).toBe('streaming')

    await variantsSection.getByRole('button', { name: 'Rewrite reset stress' }).click()
    await variantsSection.getByRole('button', { name: 'Append tail' }).click()
    const variantsDefaultResetBefore = (await readStreamSnapshot(variantsDefaultRoot))?.resetCount ?? 0
    const variantsBubbleResetBefore = (await readStreamSnapshot(variantsBubbleRoot))?.resetCount ?? 0
    const variantsArticleResetBefore = (await readStreamSnapshot(variantsArticleRoot))?.resetCount ?? 0
    await variantsSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect.poll(async () => (await readStreamSnapshot(variantsDefaultRoot))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(variantsBubbleRoot))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(variantsArticleRoot))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamSnapshot(variantsDefaultRoot))?.resetCount ?? 0)
      .toBe(variantsDefaultResetBefore)
    await expect
      .poll(async () => (await readStreamSnapshot(variantsBubbleRoot))?.resetCount ?? 0)
      .toBe(variantsBubbleResetBefore)
    await expect
      .poll(async () => (await readStreamSnapshot(variantsArticleRoot))?.resetCount ?? 0)
      .toBe(variantsArticleResetBefore)

    await bubbleIntegrationSection.getByRole('button', { name: 'High TPS burst animated' }).click()
    await bubbleIntegrationSection.getByRole('button', { name: 'Follow-up paragraph' }).click()
    await expect.poll(async () => await bubbleFallbackRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await bubbleContentTypeRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect
      .poll(async () => await bubbleFallbackRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await bubbleContentTypeRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)

    await bubbleIntegrationSection.getByRole('button', { name: 'Append during settling' }).click()
    await bubbleIntegrationSection.getByRole('button', { name: 'Settling candidate' }).click()
    await bubbleIntegrationSection.getByRole('button', { name: 'Settle' }).click()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes(
          (await bubbleFallbackRoot.getAttribute('data-stream-scheduler-phase')) || '',
        ),
      )
      .toBeTruthy()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes(
          (await bubbleContentTypeRoot.getAttribute('data-stream-scheduler-phase')) || '',
        ),
      )
      .toBeTruthy()
    await bubbleIntegrationSection.getByRole('button', { name: 'Resume append' }).click()
    await expect.poll(async () => await bubbleFallbackRoot.getAttribute('data-stream-state')).toBe('streaming')
    await expect.poll(async () => await bubbleContentTypeRoot.getAttribute('data-stream-state')).toBe('streaming')

    await bubbleIntegrationSection.getByRole('button', { name: 'Rewrite reset stress' }).click()
    await bubbleIntegrationSection.getByRole('button', { name: 'Append tail' }).click()
    const bubbleFallbackResetBefore = (await readStreamSnapshot(bubbleFallbackRoot))?.resetCount ?? 0
    const bubbleContentTypeResetBefore = (await readStreamSnapshot(bubbleContentTypeRoot))?.resetCount ?? 0
    await bubbleIntegrationSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect.poll(async () => (await readStreamSnapshot(bubbleFallbackRoot))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamSnapshot(bubbleContentTypeRoot))?.rewriteCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamSnapshot(bubbleFallbackRoot))?.resetCount ?? 0)
      .toBe(bubbleFallbackResetBefore)
    await expect
      .poll(async () => (await readStreamSnapshot(bubbleContentTypeRoot))?.resetCount ?? 0)
      .toBe(bubbleContentTypeResetBefore)

    await rewriteResetSection.getByRole('button', { name: 'Append tail' }).click()
    await expect
      .poll(async () => await rewriteResetRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    const rewriteResetCountBefore = (await readStreamSnapshot(rewriteResetRoot))?.resetCount ?? 0
    await rewriteResetSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect.poll(async () => await rewriteResetRoot.getAttribute('data-stream-update-kind')).toBe('rewrite')
    await expect.poll(async () => (await readStreamSnapshot(rewriteResetRoot))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(rewriteResetRoot))?.inputRewriteCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(rewriteResetRoot))?.tokenPreservedCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(rewriteResetRoot))?.rootCommitCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(rewriteResetRoot))?.blockCommitCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamSnapshot(rewriteResetRoot))?.resetCount ?? 0)
      .toBe(rewriteResetCountBefore)
    await rewriteResetSection.getByRole('button', { name: 'Finalize' }).click()
    await rewriteResetSection.getByRole('button', { name: 'Settle' }).click()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes((await rewriteResetRoot.getAttribute('data-stream-state')) || ''),
      )
      .toBeTruthy()
    await expect
      .poll(async () =>
        ['settling', 'finalized'].includes((await rewriteResetRoot.getAttribute('data-stream-scheduler-phase')) || ''),
      )
      .toBeTruthy()
    await expect
      .poll(async () => await rewriteResetRoot.getAttribute('data-stream-state'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => await rewriteResetRoot.getAttribute('data-stream-scheduler-phase'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => await rewriteResetRoot.locator('.tr-markdown__stream-char').count(), { timeout: 12000 })
      .toBe(0)

    await hardResetSection.getByRole('button', { name: 'List rewrite' }).click()
    await expect.poll(async () => await hardResetRoot.getAttribute('data-stream-update-kind')).toBe('rewrite')
    await expect.poll(async () => (await readStreamSnapshot(hardResetRoot))?.resetCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(hardResetRoot))?.hardReset ?? false).toBe(true)
    await expect.poll(async () => (await readStreamSnapshot(hardResetRoot))?.schedulerPhase || '').toBe('streaming')

    await skipMatrixSection.getByRole('button', { name: 'Append mixed content' }).click()
    await expect(skipMatrixRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => await skipMatrixRoot.locator('.tr-markdown__stream-char').count()).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(skipMatrixRoot))?.skippedNodeCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => JSON.stringify((await readStreamSnapshot(skipMatrixRoot))?.skippedBuckets || []))
      .toContain('code-block')
    await expect
      .poll(async () => JSON.stringify((await readStreamSnapshot(skipMatrixRoot))?.skippedBuckets || []))
      .toContain('table_open')
    await expect
      .poll(async () => JSON.stringify((await readStreamSnapshot(skipMatrixRoot))?.skippedBuckets || []))
      .toContain('image')
    await expect(skipMatrixRoot.locator('.tr-markdown__code-block-wrap .tr-markdown__stream-char')).toHaveCount(0)
    await expect(skipMatrixRoot.locator('.tr-markdown__table .tr-markdown__stream-char')).toHaveCount(0)
    await expect(skipMatrixRoot.locator('.tr-markdown__image')).toHaveCount(1)
    await expect(skipMatrixRoot.locator('.tr-markdown__image .tr-markdown__stream-char')).toHaveCount(0)
  })
})
