import { expect, test } from '@playwright/test'

test('Angular production build loads two Chats and keeps host controls usable', async ({ page }) => {
  const failed: string[] = []
  const assets: string[] = []
  page.on('requestfailed', (request) => failed.push(`${request.url()}: ${request.failure()?.errorText}`))
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) assets.push(response.url())
  })
  page.on('pageerror', (error) => failed.push(error.message))
  await page.goto('/')
  await expect(page.locator('#ready-count'))
    .toHaveText('2')
    .catch((error) => {
      throw new Error(`${failed.join('\n')}\n${error.message}`)
    })
  await expect(page.locator('tiny-robot-chat').first().locator('.tr-chat-ui')).toBeVisible()
  await expect(page.locator('tiny-robot-chat').last().locator('.tr-chat-ui')).toBeVisible()
  const themes = await page
    .locator('tiny-robot-chat')
    .evaluateAll((elements) =>
      elements.map((element) =>
        getComputedStyle(element.shadowRoot!.querySelector('.chat-web-component-root')!)
          .getPropertyValue('--tr-color-primary')
          .trim(),
      ),
    )
  expect(themes[0]).not.toBe(themes[1])
  await expect(page.locator('tiny-robot-chat').first().locator('slot[name="header-notice"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Send A' }).click()
  await page.getByRole('button', { name: 'Send B' }).click()
  await page.getByRole('button', { name: 'Release A' }).click()
  await page.getByRole('button', { name: 'Release B' }).click()
  await expect(page.locator('tiny-robot-chat').first().locator('strong')).toHaveText('Angular answer a')
  await expect(page.locator('tiny-robot-chat').last().locator('strong')).toHaveText('Angular answer b')
  await page.getByRole('textbox', { name: 'External form' }).fill('still works')
  await expect(page.getByRole('textbox', { name: 'External form' })).toHaveValue('still works')
  expect(failed).toEqual([])
  expect(assets.some((asset) => asset.includes('chunk-'))).toBe(true)
})
