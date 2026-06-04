import { expect, test, type Locator, type Page } from '@playwright/test'
import { dragBy, openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

async function openFloatingStateFixtures(page: Page) {
  await page.getByTestId('show-floating-state-fixtures-btn').click()
  await expect(page.locator('#blocked-floating-surface')).toBeVisible()
  await expect(page.locator('#uncontrolled-floating-surface')).toBeVisible()
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Missing bounding box')
  }

  return box
}

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

  test('Events: floating-drag* - 拖拽应公开三阶段事件', async ({ page }) => {
    await page.getByTestId('mode-floating-btn').click()

    await dragBy(page, page.locator(layoutSelectors.surfaceDragBar), 80, 40)

    await expect(page.getByTestId('metric-floating-drag-start')).toHaveText('1')
    await expect(page.getByTestId('metric-floating-drag-end')).toHaveText('1')
    await expect
      .poll(async () => Number(await page.getByTestId('metric-floating-drag').textContent()))
      .toBeGreaterThan(0)
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

  test('Controlled props: floating - 受控父级不回写时应只发事件，不自改位置和宽度', async ({ page }) => {
    await openFloatingStateFixtures(page)

    const surface = page.locator('#blocked-floating-surface')
    const dragBar = surface.locator(layoutSelectors.surfaceDragBar)
    const rightResizeHandle = surface.locator(layoutSelectors.rightSurfaceResizeTrigger)
    const before = await getBox(surface)

    await dragBy(page, dragBar, 140, 40)
    await expect
      .poll(async () => Number(await page.getByTestId('blocked-floating-updates').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number(await page.getByTestId('blocked-floating-last-x').textContent()))
      .toBeGreaterThan(64)

    const afterDrag = await getBox(surface)
    expect(Math.abs(afterDrag.x - before.x)).toBeLessThan(2)
    expect(Math.abs(afterDrag.y - before.y)).toBeLessThan(2)

    await dragBy(page, rightResizeHandle, 160, 0)
    await expect
      .poll(async () => Number(await page.getByTestId('blocked-floating-last-width').textContent()))
      .toBeGreaterThan(420)

    const afterResize = await getBox(surface)
    expect(Math.abs(afterResize.width - before.width)).toBeLessThan(2)
  })

  test('Default props: defaultMode / defaultFloating - 非受控 floating 应按默认几何值启动', async ({ page }) => {
    await openFloatingStateFixtures(page)

    const surface = page.locator('#uncontrolled-floating-surface')
    const box = await getBox(surface)

    await expect(surface).toHaveClass(/tr-layout-surface--floating/)
    expect(box.x).toBeGreaterThanOrEqual(556)
    expect(box.x).toBeLessThanOrEqual(564)
    expect(box.y).toBeGreaterThanOrEqual(92)
    expect(box.y).toBeLessThanOrEqual(100)
    expect(box.width).toBeGreaterThanOrEqual(416)
    expect(box.width).toBeLessThanOrEqual(424)
    expect(box.height).toBeGreaterThanOrEqual(296)
    expect(box.height).toBeLessThanOrEqual(304)
  })

  test('Default props: defaultFloating - 非受控 floating 拖拽后应更新内部位置', async ({ page }) => {
    await openFloatingStateFixtures(page)

    const surface = page.locator('#uncontrolled-floating-surface')
    const dragBar = surface.locator(layoutSelectors.surfaceDragBar)
    const before = await getBox(surface)

    await dragBy(page, dragBar, -120, 60)
    await expect
      .poll(async () => Number(await page.getByTestId('uncontrolled-floating-updates').textContent()))
      .toBeGreaterThan(0)

    const after = await getBox(surface)
    expect(after.x).toBeLessThan(before.x - 40)
    expect(after.y).toBeGreaterThan(before.y + 20)
  })

  test('Default props: minWidth / maxWidth - 非受控 floating resize 应 obey clamp', async ({ page }) => {
    await openFloatingStateFixtures(page)

    const surface = page.locator('#uncontrolled-floating-surface')
    const rightResizeHandle = surface.locator(layoutSelectors.rightSurfaceResizeTrigger)
    const leftResizeHandle = surface.locator(layoutSelectors.leftSurfaceResizeTrigger)

    await dragBy(page, rightResizeHandle, 240, 0)
    await expect
      .poll(async () => Number(await page.getByTestId('uncontrolled-floating-last-width').textContent()))
      .toBeGreaterThan(420)

    const expanded = await getBox(surface)
    expect(expanded.width).toBeGreaterThanOrEqual(476)
    expect(expanded.width).toBeLessThanOrEqual(484)

    await dragBy(page, leftResizeHandle, 400, 0)
    const shrunk = await getBox(surface)
    expect(shrunk.width).toBeGreaterThanOrEqual(316)
    expect(shrunk.width).toBeLessThanOrEqual(324)
  })
})
