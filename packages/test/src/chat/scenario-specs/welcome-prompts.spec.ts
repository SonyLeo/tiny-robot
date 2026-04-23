import { test, expect } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Welcome Prompts Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=welcome-prompts')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
  })

  test('official ui.welcome.prompts should render on the blackbox path', async () => {
    const root = '[data-testid="chat-welcome-prompts-enabled"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(3, root)

    const prompts = helper.getLocator(root).locator(helper.selectors.promptItem)
    await expect(prompts.nth(0)).toContainText('feature prompt 1')
    await expect(prompts.nth(1)).toContainText('feature prompt 2')
    await expect(prompts.nth(2)).toContainText('feature prompt 3')
  })

  test('an empty official prompt list should leave the welcome surface without prompt items', async () => {
    const root = '[data-testid="chat-welcome-prompts-disabled"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(0, root)
  })

  test('scene-local official prompt sets should override the default prompt list', async () => {
    const root = '[data-testid="chat-welcome-prompts-override"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(1, root)
    await expect(helper.getLocator(root)).toContainText('override prompt')
    await expect(helper.getLocator(root)).not.toContainText('feature prompt 1')
  })

  test('clicking an official welcome prompt should transition into the message list', async () => {
    const root = '[data-testid="chat-welcome-prompts-enabled"] .tr-chat'

    await helper.clickPrompt(1, root)
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
    await helper.waitForAssistantReply(root)
  })

  test('#welcome slot should suppress the default welcome prompt surface', async ({ page }) => {
    const root = '[data-testid="chat-welcome-prompts-slot"] .tr-chat'

    await expect(page.getByTestId('welcome-slot-content')).toBeVisible()
    await helper.expectPromptCount(0, root)
  })

  test('Root + Page should preserve official welcome prompts and keep prompt click working', async () => {
    const root = '[data-testid="chat-welcome-prompts-whitebox"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(3, root)

    await helper.clickPrompt(2, root)
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
    await helper.waitForAssistantReply(root)
  })
})
