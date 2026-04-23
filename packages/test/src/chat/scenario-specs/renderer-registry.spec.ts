import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Renderer Registry', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=renderer-registry')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.getByTestId('chat-renderer-registry-blackbox').waitFor()
  })

  test('blackbox TrChat should replace the targeted assistant content renderer and box attributes', async ({
    page,
  }) => {
    const root = page.locator('[data-testid="chat-renderer-registry-blackbox"] .tr-chat')

    await expect(root.getByTestId('renderer-registry-card')).toContainText('[card] Official custom renderer card')
    await expect(root.locator('.tr-bubble__box[data-registry-box="true"]')).toHaveCount(1)
    await expect(
      root.locator(helper.selectors.bubbleContent).filter({ hasText: 'Plain assistant fallback' }),
    ).toBeVisible()
  })

  test('Root + Page should consume the same runtime-owned renderer registry', async ({ page }) => {
    const root = page.locator('[data-testid="chat-renderer-registry-whitebox"] .tr-chat')

    await expect(root.getByTestId('renderer-registry-card')).toContainText('[card] Official custom renderer card')
    await expect(root.locator('.tr-bubble__box[data-registry-box="true"]')).toHaveCount(1)
    await expect(
      root.locator(helper.selectors.bubbleContent).filter({ hasText: 'Plain assistant fallback' }),
    ).toBeVisible()
  })

  test('Root + primitives should keep the renderer registry without relying on page relay', async ({ page }) => {
    const root = page.locator('[data-testid="chat-renderer-registry-granular"] .tr-chat')

    await expect(root.getByTestId('renderer-registry-card')).toContainText('[card] Official custom renderer card')
    await expect(root.locator('.tr-bubble__box[data-registry-box="true"]')).toHaveCount(1)
    await expect(
      root.locator(helper.selectors.bubbleContent).filter({ hasText: 'Plain assistant fallback' }),
    ).toBeVisible()
  })
})
