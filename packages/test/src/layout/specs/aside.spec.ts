import { expect, test } from '@playwright/test'
import { dragResizeHandle, openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

test.describe('Layout 组件测试 - Aside', () => {
  test.beforeEach(async ({ page }) => {
    await openLayoutPage(page)
  })

  test('Props: leftAside / rightAside - 应支持 dock 与 drawer 切换', async ({ page }) => {
    await page.getByTestId('left-mode-drawer-btn').click()
    await expect(page.locator(layoutSelectors.leftAside)).toHaveClass(/tr-layout__aside--drawer/)

    await page.getByTestId('left-mode-dock-btn').click()
    await expect(page.locator(layoutSelectors.leftAside)).toHaveClass(/tr-layout__aside--dock/)

    await page.getByTestId('right-mode-dock-btn').click()
    await expect(page.locator(layoutSelectors.rightAside)).toHaveClass(/tr-layout__aside--dock/)

    await page.getByTestId('right-mode-drawer-btn').click()
    await expect(page.locator(layoutSelectors.rightAside)).toHaveClass(/tr-layout__aside--drawer/)
  })

  test('Emits: update:leftAside / update:rightAside - toggle 后应更新状态', async ({ page }) => {
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

  test('Props: resizable=false - 应隐藏 resize trigger', async ({ page }) => {
    await page.getByTestId('left-resizable-off-btn').click()
    await page.getByTestId('right-mode-dock-btn').click()
    await page.getByTestId('right-resizable-off-btn').click()

    await expect(page.locator(layoutSelectors.leftResizeTrigger)).toHaveCount(0)
    await expect(page.locator(layoutSelectors.rightResizeTrigger)).toHaveCount(0)
    await expect(page.locator(layoutSelectors.leftAside)).not.toHaveAttribute('data-resizable', '')
    await expect(page.locator(layoutSelectors.rightAside)).not.toHaveAttribute('data-resizable', '')
  })
})
