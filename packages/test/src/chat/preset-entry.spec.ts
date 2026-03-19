import { expect, test } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Preset Entry', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=preset-entry')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await helper.switchToPresetEntry()
  })

  test('white-box preset entry should expose built-in preset slices through scoped slot composition', async ({
    page,
  }) => {
    const root = '[data-testid="chat-preset-entry"] .tr-chat'

    await expect(page.locator('[data-testid="preset-entry-preset-id"]')).toHaveText('docs-reader')
    await expect(page.locator(root).locator(helper.selectors.headerBrand)).toContainText('Docs Reader')
    await helper.expectWelcomeTitle('Docs Assistant', root)
    await helper.expectPromptCount(1, root)
  })

  test('white-box preset entry should keep the injected chatKit live after welcome prompt consumption', async ({
    page,
  }) => {
    const root = '[data-testid="chat-preset-entry"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.locator(root).locator(helper.selectors.welcome)).toHaveCount(0)
    await expect(page.locator(root).locator('.tr-chat__body')).toHaveAttribute('data-variant', 'docs')
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
