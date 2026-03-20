import { expect, test } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Layout Config', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=layout-config')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await helper.switchToLayoutConfig()
  })

  test('blackbox layout config should drive docs variant and custom placements', async ({ page }) => {
    const root = '[data-testid="chat-layout-config-blackbox"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(page.locator(root).locator('.tr-chat__body')).toHaveAttribute('data-variant', 'docs')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'start',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'end',
    )
  })

  test('whitebox preset slices should preserve docs variant and placement defaults', async ({ page }) => {
    const root = '[data-testid="chat-layout-config-whitebox"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root)).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(page.locator(root).locator('.tr-chat__body')).toHaveAttribute('data-variant', 'docs')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'start',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'end',
    )
  })

  test('blackbox layout config should preserve workspace variant without docs-only role overrides', async ({
    page,
  }) => {
    const root = '[data-testid="chat-layout-workspace-blackbox"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root).locator('.tr-chat__body')).toHaveAttribute('data-variant', 'workspace')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
    await expect(
      page.locator(root).locator(helper.selectors.bubbleItem).nth(1).locator('.tr-bubble__box'),
    ).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('whitebox preset slices should preserve workspace variant as a pure layout choice', async ({ page }) => {
    const root = '[data-testid="chat-layout-workspace-whitebox"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root).locator('.tr-chat__body')).toHaveAttribute('data-variant', 'workspace')
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(0)).toHaveAttribute(
      'data-placement',
      'end',
    )
    await expect(page.locator(root).locator(helper.selectors.bubbleItem).nth(1)).toHaveAttribute(
      'data-placement',
      'start',
    )
    await expect(
      page.locator(root).locator(helper.selectors.bubbleItem).nth(1).locator('.tr-bubble__box'),
    ).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })
})
