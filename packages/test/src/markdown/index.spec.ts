import { expect, test } from '@playwright/test'

test.describe('markdown component', () => {
  test('renders markdown structure, color preview, and bubble fallback', async ({ page }) => {
    await page.goto('http://127.0.0.1:3333/')
    await page.getByRole('link', { name: 'Markdown 组件' }).click()
    const staticMarkdown = page.getByTestId('markdown-static')
    const articleMarkdown = page.getByTestId('markdown-article')
    const bubbleMarkdown = page.locator('.tr-bubble [data-type="markdown"]')

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
    await expect(firstBlock.locator('.shiki')).toBeVisible()
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
})
