import { expect, test, type Locator, type Page } from '@playwright/test'
import { dragResizeHandle, openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

async function openAsideStateFixtures(page: Page) {
  await page.getByTestId('show-aside-state-fixtures-btn').click()
  await expect(page.getByTestId('blocked-aside-fixture')).toBeVisible()
}

async function getWidth(locator: Locator) {
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Missing bounding box')
  }

  return box.width
}

test.describe('Layout 组件测试 - Aside', () => {
  test.beforeEach(async ({ page }) => {
    await openLayoutPage(page)
  })

  test('Props: Layout.Aside mode - 应支持 dock 与 drawer 切换', async ({ page }) => {
    await page.getByTestId('left-mode-drawer-btn').click()
    await expect(page.locator(layoutSelectors.leftAside)).toHaveClass(/tr-layout__aside--drawer/)

    await page.getByTestId('left-mode-dock-btn').click()
    await expect(page.locator(layoutSelectors.leftAside)).toHaveClass(/tr-layout__aside--dock/)

    await page.getByTestId('right-mode-dock-btn').click()
    await expect(page.locator(layoutSelectors.rightAside)).toHaveClass(/tr-layout__aside--dock/)

    await page.getByTestId('right-mode-drawer-btn').click()
    await expect(page.locator(layoutSelectors.rightAside)).toHaveClass(/tr-layout__aside--drawer/)
  })

  test('Emits: update:open - toggle 后应更新状态', async ({ page }) => {
    await page.getByTestId('left-toggle-btn').click()
    await expect(page.getByTestId('metric-left-toggle-actions')).toHaveText('1')
    await expect(page.getByTestId('left-expanded-state')).toHaveText('false')

    await page.getByTestId('right-toggle-btn').click()
    await expect(page.getByTestId('metric-right-toggle-actions')).toHaveText('1')
    await expect(page.getByTestId('right-expanded-state')).toHaveText('true')
  })

  test('Drawer: backdrop / Escape - 应正确打开和关闭右侧 drawer', async ({ page }) => {
    await page.getByTestId('right-mode-drawer-btn').click()
    await page.getByTestId('right-toggle-btn').click()

    await expect(page.locator(layoutSelectors.backdrop)).toHaveClass(/tr-layout__backdrop--active/)
    await page.keyboard.press('Escape')
    await expect(page.locator(layoutSelectors.backdrop)).not.toHaveClass(/tr-layout__backdrop--active/)
  })

  test('Props: collapseEffect - slide 时 aside-content 应切换类名', async ({ page }) => {
    await page.getByTestId('left-effect-slide-btn').click()
    await page.getByTestId('left-collapse-btn').click()
    await expect(page.locator(layoutSelectors.leftAsideContent)).toHaveClass(/tr-layout-aside--effect-slide/)

    await page.getByTestId('right-mode-dock-btn').click()
    await page.getByTestId('right-effect-slide-btn').click()
    await page.getByTestId('right-collapse-btn').click()
    await expect(page.locator(layoutSelectors.rightAsideContent)).toHaveClass(/tr-layout-aside--effect-slide/)
  })

  test('Props: resizable / Emits: aside-resize* - 改宽应生效', async ({ page }) => {
    await page.getByTestId('left-mode-dock-btn').click()
    await page.getByTestId('right-mode-dock-btn').click()
    await page.getByTestId('right-toggle-btn').click()
    await expect(page.getByTestId('left-expanded-state')).toHaveText('true')
    await expect(page.getByTestId('right-expanded-state')).toHaveText('true')
    await expect(page.locator(layoutSelectors.leftResizeTrigger)).toBeVisible()
    await expect(page.locator(layoutSelectors.rightResizeTrigger)).toBeVisible()

    const beforeLeft = Number(await page.getByTestId('emitted-left-width').textContent())
    await dragResizeHandle(page, page.locator(layoutSelectors.leftResizeTrigger), 'left', 160)
    await expect(page.getByTestId('metric-left-resize-start')).toHaveText('1')
    await expect(page.getByTestId('metric-left-resize-end')).toHaveText('1')
    const afterLeft = Number(await page.getByTestId('emitted-left-width').textContent())
    expect(afterLeft).toBeGreaterThanOrEqual(beforeLeft)

    const beforeRight = Number(await page.getByTestId('emitted-right-width').textContent())
    await dragResizeHandle(page, page.locator(layoutSelectors.rightResizeTrigger), 'right', -160)
    await expect(page.getByTestId('metric-right-resize-start')).toHaveText('1')
    await expect(page.getByTestId('metric-right-resize-end')).toHaveText('1')
    const afterRight = Number(await page.getByTestId('emitted-right-width').textContent())
    expect(afterRight).toBeGreaterThanOrEqual(beforeRight)
  })

  test('Dock: main min width - 双侧展开时主区不应被压穿', async ({ page }) => {
    await page.getByTestId('right-mode-dock-btn').click()
    await page.getByTestId('right-toggle-btn').click()

    await expect
      .poll(async () => {
        const box = await page.locator(layoutSelectors.main).boundingBox()
        return box?.width ?? 0
      })
      .toBeGreaterThanOrEqual(320)
  })

  test('Rail: railWidth=0 - 收起后应完全隐藏', async ({ page }) => {
    await page.getByTestId('left-rail-width-zero-btn').click()
    await page.getByTestId('left-collapse-btn').click()

    await expect(page.locator('[data-part="root"]')).not.toHaveClass(/tr-layout--left-rail/)
    await expect(page.locator(layoutSelectors.leftAside)).not.toHaveClass(/tr-layout__aside--rail/)
    await expect(page.locator(layoutSelectors.leftAside)).toHaveAttribute('aria-hidden', 'true')
  })

  test('Props: resizable=false - 应隐藏 resize trigger', async ({ page }) => {
    await page.getByTestId('left-resizable-off-btn').click()
    await page.getByTestId('right-mode-dock-btn').click()
    await page.getByTestId('right-resizable-off-btn').click()

    await expect(page.locator(layoutSelectors.leftResizeTrigger)).toHaveCount(0)
    await expect(page.locator(layoutSelectors.rightResizeTrigger)).toHaveCount(0)
    await expect(page.locator(layoutSelectors.leftAside)).not.toHaveAttribute('data-resizable', '')
    await expect(page.locator(layoutSelectors.rightAside)).not.toHaveAttribute('data-resizable', '')
  })

  test('Controlled props: open - 受控父级不回写时应只发事件，不自改 UI', async ({ page }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('blocked-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)

    await expect(fixture.getByTestId('blocked-open-state')).toHaveText('open')
    await fixture.getByTestId('blocked-toggle').click()

    await expect(page.getByTestId('blocked-open-events')).toHaveText('1')
    await expect(page.getByTestId('blocked-last-open')).toHaveText('false')
    await expect(fixture.getByTestId('blocked-open-state')).toHaveText('open')
    await expect(leftAside).toHaveClass(/tr-layout__aside--expanded/)
  })

  test('Controlled props: width - 受控父级不回写时应只发事件，并保持 prop 宽度优先', async ({ page }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('blocked-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)
    const resizeTrigger = fixture.locator(layoutSelectors.leftResizeTrigger)

    const beforeWidth = await getWidth(leftAside)
    expect(beforeWidth).toBeGreaterThanOrEqual(256)
    expect(beforeWidth).toBeLessThanOrEqual(264)

    await dragResizeHandle(page, resizeTrigger, 'left', 160)

    await expect
      .poll(async () => Number(await page.getByTestId('blocked-width-events').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number(await page.getByTestId('blocked-last-width').textContent()))
      .toBeGreaterThan(260)

    const afterWidth = await getWidth(leftAside)
    expect(Math.abs(afterWidth - beforeWidth)).toBeLessThan(2)
  })

  test('Default props: defaultOpen / defaultWidth - 非受控 aside 应以内建状态启动，并支持自定义 ariaLabel', async ({
    page,
  }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('uncontrolled-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)

    await expect(fixture.getByTestId('uncontrolled-toggle')).toHaveAttribute('aria-label', 'Uncontrolled custom toggle')
    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('open')

    const width = await getWidth(leftAside)
    expect(width).toBeGreaterThanOrEqual(286)
    expect(width).toBeLessThanOrEqual(294)
  })

  test('Default props: defaultOpen / railWidth - 非受控 aside 收起后应保留 rail', async ({ page }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('uncontrolled-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)

    await fixture.getByTestId('uncontrolled-toggle').click()

    await expect(page.getByTestId('uncontrolled-open-events')).toHaveText('1')
    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('closed')
    await expect(leftAside).toHaveClass(/tr-layout__aside--rail/)

    await expect.poll(async () => await getWidth(leftAside)).toBeGreaterThanOrEqual(48)
    await expect.poll(async () => await getWidth(leftAside)).toBeLessThanOrEqual(56)
  })

  test('Default props: defaultWidth / minWidth / maxWidth - 非受控 resize 应更新内部宽度并 obey clamp', async ({
    page,
  }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('uncontrolled-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)
    const resizeTrigger = fixture.locator(layoutSelectors.leftResizeTrigger)

    await dragResizeHandle(page, resizeTrigger, 'left', 200)
    await expect
      .poll(async () => Number(await page.getByTestId('uncontrolled-width-events').textContent()))
      .toBeGreaterThan(0)

    const maxClampedWidth = await getWidth(leftAside)
    expect(maxClampedWidth).toBeGreaterThanOrEqual(336)
    expect(maxClampedWidth).toBeLessThanOrEqual(344)

    await dragResizeHandle(page, resizeTrigger, 'left', -400)
    const minClampedWidth = await getWidth(leftAside)
    expect(minClampedWidth).toBeGreaterThanOrEqual(236)
    expect(minClampedWidth).toBeLessThanOrEqual(244)
  })

  test('CSS vars: drawer width - 应按实例变量生效，且双 drawer 打开时保持互斥', async ({ page }) => {
    await openAsideStateFixtures(page)

    const fixture = page.getByTestId('drawer-aside-fixture')
    const leftAside = fixture.locator(layoutSelectors.leftAside)
    const rightAside = fixture.locator(layoutSelectors.rightAside)

    await expect(fixture.getByTestId('drawer-left-toggle')).toHaveAttribute('aria-label', 'Custom drawer left label')

    await fixture.getByTestId('drawer-left-toggle').click()
    await expect(fixture.getByTestId('drawer-left-state')).toHaveText('open')
    await expect(fixture.locator(layoutSelectors.backdrop)).toHaveClass(/tr-layout__backdrop--active/)

    const leftWidth = await getWidth(leftAside)
    expect(leftWidth).toBeGreaterThanOrEqual(340)
    expect(leftWidth).toBeLessThanOrEqual(348)

    await fixture.getByTestId('drawer-right-toggle').evaluate((element: HTMLButtonElement) => element.click())
    await expect(fixture.getByTestId('drawer-right-state')).toHaveText('open')
    await expect(fixture.getByTestId('drawer-left-state')).toHaveText('closed')
    await expect(leftAside).toHaveAttribute('aria-hidden', 'true')

    const rightWidth = await getWidth(rightAside)
    expect(rightWidth).toBeGreaterThanOrEqual(384)
    expect(rightWidth).toBeLessThanOrEqual(392)
  })
})
