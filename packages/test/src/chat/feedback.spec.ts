import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Feedback Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToBlackbox()
  })

  test('should reveal feedback actions only after the assistant reply completes', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await helper.sendMessage('feedback timing', root)

    const assistantFeedback = page.locator(root).locator(".tr-bubble[data-role='assistant'] .tr-chat-feedback")
    await expect(assistantFeedback).toHaveCount(0)

    await helper.waitForStreamingComplete(root)
    await expect(assistantFeedback.first()).toBeVisible()
  })

  test('should route feedback actions through the message action callback', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await helper.sendMessage('action cb', root)
    await helper.waitForStreamingComplete(root)
    await helper.waitForAssistantReply(root)

    const actionButtons = page
      .locator(root)
      .locator(".tr-bubble[data-role='assistant'] .tr-feedback .tr-action-group__btn-wrapper")
    await expect(actionButtons.first()).toBeVisible()
    await actionButtons.first().click({ force: true })

    const actionLog = page.locator(helper.selectors.onActionLog)
    await expect(actionLog).toContainText('action:copy:assistant:')
  })
})
