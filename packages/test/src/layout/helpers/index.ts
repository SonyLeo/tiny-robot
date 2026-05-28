import { expect, type Locator, type Page } from '@playwright/test'

export async function openLayoutPage(page: Page) {
  await page.goto('/')
  await page.click('text=Layout 组件')
  await expect(page.locator('h2')).toContainText('Layout 组件测试')
}

export async function dragBy(page: Page, locator: Locator, deltaX: number, deltaY = 0) {
  await expect(locator).toBeVisible()
  await locator.hover()
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Missing drag target')
  }

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 20 })
  await page.mouse.up()
}

export async function dragResizeHandle(page: Page, locator: Locator, side: 'left' | 'right', deltaX: number) {
  await expect(locator).toBeVisible()
  await locator.hover()
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Missing resize handle')
  }

  const startX = side === 'left' ? box.x + box.width - 1 : box.x + 1
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY, { steps: 24 })
  await page.mouse.up()
}
