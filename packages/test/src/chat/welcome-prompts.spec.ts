import { test, expect } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Welcome Prompts Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=welcome-prompts')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
  })

  test('feature welcomePrompts should replace legacy ui.prompts', async () => {
    const root = '[data-testid="chat-welcome-prompts-enabled"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(3, root)

    const prompts = helper.getLocator(root).locator(helper.selectors.promptItem)
    await expect(prompts.nth(0)).toContainText('feature prompt 1')
    await expect(prompts.nth(1)).toContainText('feature prompt 2')
    await expect(prompts.nth(2)).toContainText('feature prompt 3')
    await expect(helper.getLocator(root)).not.toContainText('legacy prompt')
  })

  test('disabled welcomePrompts should clear both feature prompts and legacy prompts', async () => {
    const root = '[data-testid="chat-welcome-prompts-disabled"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(0, root)
    await expect(helper.getLocator(root)).not.toContainText('legacy prompt')
  })

  test('explicit prompts override should win over resolved welcomePrompts', async () => {
    const root = '[data-testid="chat-welcome-prompts-override"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(1, root)
    await expect(helper.getLocator(root)).toContainText('override prompt')
    await expect(helper.getLocator(root)).not.toContainText('feature prompt 1')
  })

  test('clicking a welcome prompt should transition into the message list', async () => {
    const root = '[data-testid="chat-welcome-prompts-enabled"] .tr-chat'

    await helper.clickPrompt(1, root)
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
    await helper.waitForAssistantReply(root)
  })

  test('#welcome slot should suppress preset welcome prompts rendering', async ({ page }) => {
    const root = '[data-testid="chat-welcome-prompts-slot"] .tr-chat'

    await expect(page.getByTestId('welcome-slot-content')).toBeVisible()
    await helper.expectPromptCount(0, root)
    await expect(page.locator(root)).not.toContainText('feature prompt 1')
  })

  test('whitebox welcome prompts should consume preset slices and keep prompt click working', async () => {
    const root = '[data-testid="chat-welcome-prompts-whitebox"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(3, root)

    await helper.clickPrompt(2, root)
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
    await helper.waitForAssistantReply(root)
  })
})
