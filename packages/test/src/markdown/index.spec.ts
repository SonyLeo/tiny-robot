import { expect, test } from '@playwright/test'

test.describe('markdown component', () => {
  test('renders markdown structure, color preview, and bubble integration paths', async ({ page }) => {
    await page.goto('http://127.0.0.1:3333/')
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
    await page.goto('http://127.0.0.1:3333/')
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
    await page.goto('http://127.0.0.1:3333/')
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
    await page.goto('http://127.0.0.1:3333/')
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

  test('holds incomplete streaming structures until they are complete', async ({ page }) => {
    await page.goto('http://127.0.0.1:3333/')
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
    await page.goto('http://127.0.0.1:3333/')
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
    await page.goto('http://127.0.0.1:3333/')
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
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-active-block-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-block-count')) || '0'))
      .toBeGreaterThan(1)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-pending-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-active-index')) || '-1'))
      .toBeGreaterThan(-1)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-char-delay')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-settle-hold-ms')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-profiler-event-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-profiler-root-commit-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-profiler-block-commit-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-profiler-fps-sample-count')) || '0'))
      .toBeGreaterThanOrEqual(0)
    await expect
      .poll(async () =>
        Number((await largeAppendRoot.getAttribute('data-stream-profiler-token-schedule-count')) || '0'),
      )
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
      .poll(async () => Number((await largeAppendRoot.getAttribute('data-stream-profiler-finalize-count')) || '0'), {
        timeout: 12000,
      })
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
    await expect
      .poll(async () => Number((await fastChunksRoot.getAttribute('data-stream-block-count')) || '0'))
      .toBeGreaterThan(2)
    await expect
      .poll(async () => Number((await fastChunksRoot.getAttribute('data-stream-animating-index')) || '-1'))
      .toBeGreaterThan(-1)
    await expect
      .poll(async () => Number((await fastChunksRoot.getAttribute('data-stream-streaming-index')) || '-1'))
      .toBeGreaterThan(0)

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
    await expect
      .poll(async () => Number((await quoteParagraphRoot.getAttribute('data-stream-block-count')) || '0'))
      .toBeGreaterThan(2)
    await expect(quoteParagraphRoot).toContainText('The quoted summary should reveal first')
    await expect(quoteParagraphRoot.locator('.tr-markdown__blockquote .tr-markdown__stream-char')).toHaveCount(0)

    await highTpsSection.getByRole('button', { name: 'Follow-up paragraph' }).click()
    await expect(highTpsRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect
      .poll(async () => Number((await highTpsRoot.getAttribute('data-stream-queue-length')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await highTpsRoot.getAttribute('data-stream-char-delay')) || '0'))
      .toBeLessThan(18)

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
    const variantsDefaultResetBefore = Number(
      (await variantsDefaultRoot.getAttribute('data-stream-reset-count')) || '0',
    )
    const variantsBubbleResetBefore = Number((await variantsBubbleRoot.getAttribute('data-stream-reset-count')) || '0')
    const variantsArticleResetBefore = Number(
      (await variantsArticleRoot.getAttribute('data-stream-reset-count')) || '0',
    )
    await variantsSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect
      .poll(async () => Number((await variantsDefaultRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await variantsBubbleRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await variantsArticleRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await variantsDefaultRoot.getAttribute('data-stream-reset-count')) || '0'))
      .toBe(variantsDefaultResetBefore)
    await expect
      .poll(async () => Number((await variantsBubbleRoot.getAttribute('data-stream-reset-count')) || '0'))
      .toBe(variantsBubbleResetBefore)
    await expect
      .poll(async () => Number((await variantsArticleRoot.getAttribute('data-stream-reset-count')) || '0'))
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
    const bubbleFallbackResetBefore = Number((await bubbleFallbackRoot.getAttribute('data-stream-reset-count')) || '0')
    const bubbleContentTypeResetBefore = Number(
      (await bubbleContentTypeRoot.getAttribute('data-stream-reset-count')) || '0',
    )
    await bubbleIntegrationSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect
      .poll(async () => Number((await bubbleFallbackRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await bubbleContentTypeRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await bubbleFallbackRoot.getAttribute('data-stream-reset-count')) || '0'))
      .toBe(bubbleFallbackResetBefore)
    await expect
      .poll(async () => Number((await bubbleContentTypeRoot.getAttribute('data-stream-reset-count')) || '0'))
      .toBe(bubbleContentTypeResetBefore)

    await rewriteResetSection.getByRole('button', { name: 'Append tail' }).click()
    await expect
      .poll(async () => await rewriteResetRoot.locator('.tr-markdown__stream-char').count())
      .toBeGreaterThan(0)
    const rewriteResetCountBefore = Number((await rewriteResetRoot.getAttribute('data-stream-reset-count')) || '0')
    await rewriteResetSection.getByRole('button', { name: 'Rewrite', exact: true }).click()
    await expect.poll(async () => await rewriteResetRoot.getAttribute('data-stream-update-kind')).toBe('rewrite')
    await expect
      .poll(async () => Number((await rewriteResetRoot.getAttribute('data-stream-rewrite-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () =>
        Number((await rewriteResetRoot.getAttribute('data-stream-profiler-input-rewrite-count')) || '0'),
      )
      .toBeGreaterThan(0)
    await expect
      .poll(async () =>
        Number((await rewriteResetRoot.getAttribute('data-stream-profiler-token-preserved-count')) || '0'),
      )
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await rewriteResetRoot.getAttribute('data-stream-profiler-root-commit-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await rewriteResetRoot.getAttribute('data-stream-profiler-block-commit-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await rewriteResetRoot.getAttribute('data-stream-reset-count')) || '0'))
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
    await expect
      .poll(async () => Number((await hardResetRoot.getAttribute('data-stream-reset-count')) || '0'))
      .toBeGreaterThan(0)
    await expect.poll(async () => hardResetRoot.getAttribute('data-stream-hard-reset')).toBe('true')
    await expect.poll(async () => hardResetRoot.getAttribute('data-stream-scheduler-phase')).toBe('streaming')

    await skipMatrixSection.getByRole('button', { name: 'Append mixed content' }).click()
    await expect(skipMatrixRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect.poll(async () => await skipMatrixRoot.locator('.tr-markdown__stream-char').count()).toBeGreaterThan(0)
    await expect
      .poll(async () => Number((await skipMatrixRoot.getAttribute('data-stream-skipped-node-count')) || '0'))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await skipMatrixRoot.getAttribute('data-stream-skipped-buckets')) || '')
      .toContain('code-block')
    await expect
      .poll(async () => (await skipMatrixRoot.getAttribute('data-stream-skipped-buckets')) || '')
      .toContain('table_open')
    await expect
      .poll(async () => (await skipMatrixRoot.getAttribute('data-stream-skipped-buckets')) || '')
      .toContain('image')
    await expect(skipMatrixRoot.locator('.tr-markdown__code-block-wrap .tr-markdown__stream-char')).toHaveCount(0)
    await expect(skipMatrixRoot.locator('.tr-markdown__table .tr-markdown__stream-char')).toHaveCount(0)
    await expect(skipMatrixRoot.locator('.tr-markdown__image')).toHaveCount(1)
    await expect(skipMatrixRoot.locator('.tr-markdown__image .tr-markdown__stream-char')).toHaveCount(0)
  })
})
