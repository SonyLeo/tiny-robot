import { expect, test } from '@playwright/test'
import { openLayoutPage } from '../helpers'
import { layoutSelectors } from '../selectors'

test.describe('Layout 组件测试 - Main Scrollbar', () => {
  test.beforeEach(async ({ page }) => {
    await openLayoutPage(page)
  })

  test('Props: scrollHost - 应解析真实滚动宿主并挂上标记', async ({ page }) => {
    await expect(page.locator('.layout-demo__bubble-list')).toHaveAttribute('data-tr-layout-scroll-host', '')
  })

  test('虚拟滚动条 - 长列表时应显示并随滚动同步', async ({ page }) => {
    const scrollHost = page.locator('.layout-demo__bubble-list')
    const thumb = page.locator(layoutSelectors.scrollbarThumb)

    await expect(page.locator(layoutSelectors.scrollbar)).toBeVisible()

    const before = await thumb.evaluate((node) => window.getComputedStyle(node).transform)
    await scrollHost.evaluate((node) => {
      node.scrollTop = 320
      node.dispatchEvent(new Event('scroll'))
    })

    await expect.poll(async () => thumb.evaluate((node) => window.getComputedStyle(node).transform)).not.toBe(before)
  })

  test('thumb 拖拽 - 应驱动 scrollHost 滚动', async ({ page }) => {
    await page.locator(layoutSelectors.main).hover()
    const thumb = page.locator(layoutSelectors.scrollbarThumb)
    const box = await thumb.boundingBox()

    if (!box) {
      throw new Error('Missing scrollbar thumb')
    }

    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX, startY + 120, { steps: 8 })
    await page.mouse.up()

    await expect
      .poll(async () => page.locator('.layout-demo__bubble-list').evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0)
  })

  test('内容追加后 - metrics 应同步更新', async ({ page }) => {
    const thumb = page.locator(layoutSelectors.scrollbarThumb)
    const before = await thumb.evaluate((node) => node.getBoundingClientRect().height)

    await page.getByTestId('append-messages-btn').click()
    await expect(page.getByTestId('messages-count')).toHaveText('60')

    await expect.poll(async () => thumb.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(before)
  })

  test('滚动条下边界 - thumb 不应越出轨道', async ({ page }) => {
    const scrollHost = page.locator('.layout-demo__bubble-list')
    const track = page.locator(layoutSelectors.scrollbar)
    const thumb = page.locator(layoutSelectors.scrollbarThumb)

    await scrollHost.evaluate((node) => {
      node.scrollTop = node.scrollHeight
      node.dispatchEvent(new Event('scroll'))
    })

    await expect
      .poll(async () => {
        const trackBox = await track.boundingBox()
        const thumbBox = await thumb.boundingBox()

        if (!trackBox || !thumbBox) {
          return false
        }

        return thumbBox.y + thumbBox.height <= trackBox.y + trackBox.height + 1
      })
      .toBe(true)
  })
})
