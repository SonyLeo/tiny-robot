import { expect, test } from '@playwright/experimental-ct-vue'
import TrMarkdownPhase0Story from './TrMarkdownPhase0.story.vue'

const narrowLayoutContent = `## Narrow layout checks

Keep this long URL readable without widening the message: [https://docs.opentiny.design/tiny-robot/components/markdown/rendering/production-defaults-and-narrow-layout](https://docs.opentiny.design/tiny-robot/components/markdown/rendering/production-defaults-and-narrow-layout)

Inline configuration remains \`retryCount\` readable at the narrow width.

| Property | Description | Status | Notes |
| --- | --- | ---: | --- |
| parserOptions | A deliberately long table cell should stay inside the scroll container instead of widening the message surface. | ready | keep-table-scroll |
| renderer | Alignment and overflow remain explicit on small screens. | review | preserve-edges |

\`\`\`ts
const retryCount: number = 3
console.log(retryCount)
\`\`\``

const visualComparisonContent = `# Production heading scale

This matched fixture compares the production Bubble heading scale with the explicit pre-calibration value.

## Nested content

- Keep paragraph rhythm stable.
- Preserve list markers and inline \`code\`.`

test.describe('TrMarkdown phase 3 narrow production surface', () => {
  test.use({ viewport: { width: 375, height: 900 } })

  test('keeps narrow content bounded while preserving table, inline code and highlight surfaces', async ({ mount }) => {
    const component = await mount(TrMarkdownPhase0Story, {
      props: {
        content: narrowLayoutContent,
        mode: 'bubble',
        narrow: true,
        theme: 'dark',
        variant: 'bubble',
      },
    })

    const surface = component
    const root = component.locator('.tr-markdown-root')
    await expect(surface).toHaveCSS('background-color', 'rgb(38, 38, 38)')
    await expect(root).toHaveCSS('color', 'rgb(230, 230, 230)')
    await expect(component.locator('.tr-bubble__box')).toHaveCSS('background-color', 'rgb(38, 38, 38)')
    await expect(root).toContainText('retryCount')
    await expect(root.locator('.tr-markdown__inline-code')).toContainText('retryCount')
    await expect(root.locator('.tr-markdown__table-wrap')).toHaveCount(1)
    await expect(root.locator('.tr-markdown__table')).toContainText('deliberately long table cell')
    await expect(root.locator('.tr-markdown__code-block-wrap')).toHaveAttribute('data-language', 'ts')
    await expect(root.locator('.tr-markdown__code-highlight--block')).toHaveCount(1, { timeout: 20000 })

    const dimensions = await root.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    const tableDimensions = await root.locator('.tr-markdown__table-wrap').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(tableDimensions.scrollWidth).toBeGreaterThan(tableDimensions.clientWidth)
  })

  test('captures matched Bubble algorithm evidence for heading-scale calibration', async ({ mount }, testInfo) => {
    const before = await mount(TrMarkdownPhase0Story, {
      props: {
        content: visualComparisonContent,
        headingScale: 1,
        mode: 'bubble',
        theme: 'light',
        variant: 'bubble',
      },
    })
    await expect(before.locator('.tr-markdown-root')).toHaveClass(/tr-markdown--bubble/)
    const beforeHeadingSize = await before.locator('h1').evaluate((element) => getComputedStyle(element).fontSize)
    expect(beforeHeadingSize).toBe('40px')
    await before.screenshot({ path: testInfo.outputPath('heading-scale-1.png') })

    await before.update({
      props: {
        content: visualComparisonContent,
        headingScale: undefined,
        mode: 'bubble',
        theme: 'light',
        variant: 'bubble',
      },
    })
    const afterHeadingSize = await before.locator('h1').evaluate((element) => getComputedStyle(element).fontSize)
    expect(afterHeadingSize).toBe('22px')
    await before.screenshot({ path: testInfo.outputPath('heading-scale-025.png') })
  })
})
