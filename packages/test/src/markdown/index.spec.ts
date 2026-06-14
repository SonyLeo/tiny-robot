import { expect, test, type Locator, type Page } from '@playwright/test'

type StreamSnapshot = {
  blockCount: number
  pendingCount: number
  profilerEventCount: number
}

type StreamProfilerDebug = {
  finalizeCount: number
  tokenScheduleCount: number
}

const readJsonDataset = async <T>(root: Locator, key: string) => {
  const raw = await root.getAttribute(key)
  return raw ? (JSON.parse(raw) as T) : null
}

const readStreamSnapshot = (root: Locator) => readJsonDataset<StreamSnapshot>(root, 'data-stream-snapshot')
const readStreamProfilerDebug = (root: Locator) =>
  readJsonDataset<StreamProfilerDebug>(root, 'data-stream-profiler-debug')

const openMarkdownDemo = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Markdown 组件' }).click()
  await expect(page.getByRole('heading', { name: 'Markdown Demo' })).toBeVisible()
}

test.describe('markdown demo integration smoke', () => {
  test.describe.configure({ mode: 'serial' })

  test('opens the markdown demo page and renders representative component sections', async ({ page }) => {
    await openMarkdownDemo(page)

    await expect(page.getByTestId('markdown-static').getByRole('heading', { name: 'Markdown Title' })).toBeVisible()
    await expect(page.getByTestId('markdown-static').locator('.tr-markdown__table')).toContainText('Unique identifier')
    await expect(page.getByTestId('markdown-html-preview-enabled')).toBeVisible()
    await expect(page.getByTestId('markdown-math-inline')).toBeVisible()
    await expect(page.getByTestId('markdown-mermaid-flowchart')).toBeVisible()
    await expect(page.getByTestId('markdown-bubble')).toBeVisible()
  })

  test('keeps Bubble markdown fallback and content-type renderer integration working', async ({ page }) => {
    await openMarkdownDemo(page)

    const bubbleMarkdown = page.getByTestId('markdown-bubble').locator('[data-type="markdown"]')
    const bubbleFallbackSection = page.getByTestId('markdown-bubble-fallback')
    const bubbleContentTypeSection = page.getByTestId('markdown-bubble-content-type')

    await expect(bubbleMarkdown).toBeVisible()
    await expect(bubbleMarkdown.locator('.tr-markdown__task-checkbox')).toHaveCount(2)
    await expect(bubbleFallbackSection.locator('.tr-markdown__link')).toHaveAttribute('target', '_self')
    await expect(bubbleFallbackSection.locator('.tr-markdown__copy-button')).toHaveCount(0)
    await expect(bubbleContentTypeSection.locator('.tr-markdown__link')).toHaveAttribute('target', '_self')
    await expect(bubbleContentTypeSection.locator('.tr-markdown__copy-button')).toHaveCount(0)
    await expect(bubbleContentTypeSection.locator('.tr-bubble__text').last()).toContainText(
      'This trailing text item intentionally remains on the default text renderer.',
    )
  })

  test('keeps a full HTML Preview iframe path working in the demo page', async ({ page }) => {
    await openMarkdownDemo(page)

    const enabledSection = page.getByTestId('markdown-html-preview-enabled')
    const previewBlock = enabledSection.locator('[data-code-type="html-preview"]').first()

    await expect(previewBlock).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-modals',
    )
    await expect(previewBlock.getByRole('button', { name: 'Preview', exact: true })).toHaveClass(
      /tr-markdown__html-preview-segment--active/,
    )
    await expect(previewBlock.getByRole('button', { name: 'Copy HTML code' })).toBeVisible()
    await expect(previewBlock.getByRole('button', { name: 'Download HTML' })).toBeVisible()
  })

  test('keeps animated markdown and Bubble streaming smoke paths working', async ({ page }) => {
    await openMarkdownDemo(page)

    const largeAppendSection = page.getByTestId('markdown-stream-animated-large-append')
    const largeAppendRoot = largeAppendSection.locator('.tr-markdown-root')

    await largeAppendSection.getByRole('button', { name: 'Append payload' }).click()
    await expect(largeAppendRoot).toHaveAttribute('data-stream-state', 'streaming')
    await expect(largeAppendRoot).toHaveAttribute('data-stream-profiler-enabled', 'true')
    await expect.poll(async () => await largeAppendRoot.locator('.tr-markdown__stream-char').count()).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.blockCount ?? 0).toBeGreaterThan(1)
    await expect.poll(async () => (await readStreamSnapshot(largeAppendRoot))?.pendingCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamSnapshot(largeAppendRoot))?.profilerEventCount ?? 0)
      .toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.tokenScheduleCount ?? 0)
      .toBeGreaterThan(0)

    await largeAppendSection.getByRole('button', { name: 'Settle' }).click()
    await expect
      .poll(async () => await largeAppendRoot.getAttribute('data-stream-state'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => (await readStreamProfilerDebug(largeAppendRoot))?.finalizeCount ?? 0, { timeout: 12000 })
      .toBeGreaterThan(0)

    const bubbleIntegrationSection = page.getByTestId('markdown-stream-animated-bubble-integration')
    const bubbleFallbackRoot = bubbleIntegrationSection
      .getByTestId('markdown-stream-animated-bubble-fallback')
      .locator('.tr-markdown-root')
    const bubbleContentTypeRoot = bubbleIntegrationSection
      .getByTestId('markdown-stream-animated-bubble-content-type')
      .locator('.tr-markdown-root')

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
  })
})
