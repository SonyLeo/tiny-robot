import { expect, test } from '@playwright/test'
import { dragBy, openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

test.describe('Layout 组件测试 - Floating', () => {
  test.beforeEach(async ({ page }) => {
    await openLayoutPage(page)
  })

  test('Props: mode / update:mode - 应支持 normal 与 floating 切换', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()
    await expect(page.getByTestId('metric-mode-toggle-actions')).toHaveText('1')
    await expect(page.locator(layoutSelectors.surface)).toHaveClass(/tr-layout-surface--floating/)

    await page.getByTestId('mode-normal-btn').click()
    await expect(page.getByTestId('metric-mode-toggle-actions')).toHaveText('2')
    await expect(page.locator(layoutSelectors.surface)).toHaveClass(/tr-layout-surface--normal/)
  })

  test('Props: draggable - floating 拖拽应更新位置', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()
    const surface = page.locator(layoutSelectors.surface)
    const before = await surface.boundingBox()

    await dragBy(page, page.locator(layoutSelectors.surfaceDragBar), 80, 40)
    const after = await surface.boundingBox()

    if (!before || !after) {
      throw new Error('Missing floating surface')
    }

    expect(after.x).toBeGreaterThan(before.x)
    expect(after.y).toBeGreaterThan(before.y)
  })

  test('Props: draggable=false - drag bar 不应再移动 surface', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()
    await page.getByTestId('floating-draggable-off-btn').click()

    const surface = page.locator(layoutSelectors.surface)
    const before = await surface.boundingBox()
    await dragBy(page, page.locator(layoutSelectors.surfaceDragBar), 80, 0)
    const after = await surface.boundingBox()

    if (!before || !after) {
      throw new Error('Missing floating surface')
    }

    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
  })

  test('Props: resizable / floating-resize* - 左右改宽应生效', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()

    const before = Number(await page.getByTestId('emitted-floating-width').textContent())
    await dragBy(page, page.locator(layoutSelectors.rightSurfaceResizeTrigger), 80, 0)
    const afterExpand = Number(await page.getByTestId('emitted-floating-width').textContent())

    expect(afterExpand).toBeGreaterThan(before)
    await expect(page.getByTestId('metric-floating-right-resize-start')).toHaveText('1')
    await expect(page.getByTestId('metric-floating-right-resize-end')).toHaveText('1')

    await dragBy(page, page.locator(layoutSelectors.leftSurfaceResizeTrigger), 60, 0)
    await expect(page.getByTestId('metric-floating-left-resize-start')).toHaveText('1')
    await expect(page.getByTestId('metric-floating-left-resize-end')).toHaveText('1')
  })

  test('Props: resizable=false - 应隐藏 floating resize trigger', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()
    await page.getByTestId('floating-resizable-off-btn').click()

    await expect(page.locator(layoutSelectors.leftSurfaceResizeTrigger)).toHaveCount(0)
    await expect(page.locator(layoutSelectors.rightSurfaceResizeTrigger)).toHaveCount(0)
  })

  test('viewport clamp - 超界拖拽后应被限制在视口内', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()
    await dragBy(page, page.locator(layoutSelectors.surfaceDragBar), -2000, -2000)

    const surface = page.locator(layoutSelectors.surface)
    await expect
      .poll(async () => {
        const box = await surface.boundingBox()
        return box ? box.x >= 0 && box.y >= 0 : false
      })
      .toBe(true)
  })
})
