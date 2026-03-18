import { test, expect } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Welcome Prompts Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=welcome-prompts')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
  })

  test('feature welcomePrompts 应覆盖 legacy ui.prompts', async () => {
    const root = '[data-testid="chat-welcome-prompts"] .tr-chat'
    await helper.expectWelcomeVisible(true, root)
    await helper.expectPromptCount(3, root)

    const prompts = helper.getLocator(root).locator(helper.selectors.promptItem)
    await expect(prompts.nth(0)).toContainText('feature prompt 1')
    await expect(prompts.nth(1)).toContainText('feature prompt 2')
    await expect(prompts.nth(2)).toContainText('feature prompt 3')
    await expect(helper.getLocator(root)).not.toContainText('legacy prompt')
  })

  test('点击 welcome prompt 后应切换到消息列表并发送消息', async () => {
    const root = '[data-testid="chat-welcome-prompts"] .tr-chat'

    await helper.clickPrompt(1, root)
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
    await helper.waitForAssistantReply(root)
  })
})
