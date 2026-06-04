import { expect, test } from '@playwright/test'
import { openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

test.describe('Layout 组件测试 - 结构', () => {
  test.beforeEach(async ({ page }) => {
    await openLayoutPage(page)
  })

  test('Slots: header / footer / left-aside / right-aside - 应正确渲染', async ({ page }) => {
    await expect(page.getByTestId('layout-header-slot')).toBeVisible()
    await expect(page.getByTestId('layout-footer-slot')).toBeVisible()
    await expect(page.getByTestId('left-aside-slot')).toBeVisible()
    await expect(page.getByTestId('right-aside-slot')).toBeHidden()

    await page.getByTestId('right-toggle-btn').click()
    await expect(page.getByTestId('right-aside-slot')).toBeVisible()
  })

  test('Stable hooks - 应输出关键 data-part / data-placement', async ({ page }) => {
    await expect(page.locator(layoutSelectors.surface)).toBeVisible()
    await expect(page.locator(layoutSelectors.main)).toBeVisible()
    await expect(page.locator(layoutSelectors.leftAside)).toHaveAttribute('data-placement', 'left')
    await expect(page.locator(layoutSelectors.rightAside)).toHaveAttribute('data-placement', 'right')
    await expect(page.locator(layoutSelectors.leftAsideContent)).toHaveAttribute('data-placement', 'left')
    await expect(page.locator(layoutSelectors.rightAsideContent)).toHaveAttribute('data-placement', 'right')
  })

  test('Layout.AsideToggle slot - 应能拿到 isExpanded', async ({ page }) => {
    await expect(page.getByTestId('left-toggle-slot')).toHaveText('left-open')
    await page.getByTestId('left-aside-toggle').click()
    await expect(page.getByTestId('left-toggle-slot')).toHaveText('left-close')
  })

  test('Props: ariaLabel - right toggle 应使用默认 aria-label', async ({ page }) => {
    await expect(page.getByTestId('right-aside-toggle')).toHaveAttribute('aria-label', 'Toggle right panel')
  })

  test('Fallthrough attrs: class / id / data-* - 应始终落在 surface', async ({ page }) => {
    const surface = page.locator(layoutSelectors.surface)
    const surfaceHost = page.locator(layoutSelectors.surfaceHost)

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)
    await expect(surfaceHost).not.toHaveAttribute('id', 'layout-demo-surface')
    await expect(surfaceHost).not.toHaveAttribute('data-surface-marker', 'layout-demo-surface')

    await page.getByTestId('mode-floating-btn').click()

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)
  })

  test('Conditional slots: empty header / left-aside - should not keep empty shell or resize trigger', async ({
    page,
  }) => {
    await page.getByTestId('conditional-slots-empty-btn').click()

    await expect(page.locator('.tr-layout__header-shell')).not.toHaveClass(/tr-layout__header-shell--active/)
    await expect(page.locator(layoutSelectors.leftAside)).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator(layoutSelectors.leftResizeTrigger)).toHaveCount(0)
    await expect(page.locator('[data-part="root"]')).not.toHaveClass(/tr-layout--left-expanded/)
  })
})
