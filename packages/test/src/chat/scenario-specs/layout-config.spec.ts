import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Layout Config', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=layout-config')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-layout-config-trchat"]').waitFor()
  })

  test('TrChat should honor the official wide content-layout and explicit dark appearance', async ({ page }) => {
    const root = '[data-testid="chat-layout-config-trchat"] .tr-chat'

    await helper.sendMessage('layout wide trchat', root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(page.locator(root)).toHaveAttribute('data-chat-content-layout', 'wide')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
  })

  test('Root + Page should preserve the same official wide content-layout boundary', async ({ page }) => {
    const root = '[data-testid="chat-layout-config-whitebox"] .tr-chat'

    await helper.sendMessage('layout wide whitebox', root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(page.locator(root)).toHaveAttribute('data-chat-content-layout', 'wide')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
  })

  test('TrChat should keep centered content-layout as the default official layout boundary', async ({ page }) => {
    const root = '[data-testid="chat-layout-workspace-trchat"] .tr-chat'

    await helper.sendMessage('layout centered trchat', root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-chat-content-layout', 'centered')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
  })

  test('Root + primitives should keep centered content-layout without old layout.variant or placement overrides', async ({
    page,
  }) => {
    const root = '[data-testid="chat-layout-workspace-whitebox"] .tr-chat'

    await helper.sendMessage('layout centered granular', root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-chat-content-layout', 'centered')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
  })
})
