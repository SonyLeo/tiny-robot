import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

function getAssistantFeedback(root: string, page: Page) {
  return page.locator(`${root} .tr-bubble[data-role="assistant"]`).getByTestId('chat-feedback')
}

test.describe('Chat Feedback Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToBlackbox()
  })

  test('should reveal assistant feedback after the assistant reply completes', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await helper.sendMessage('feedback timing', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback).toBeVisible()
  })

  test('should expose built-in assistant feedback actions on the official blackbox path', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await helper.sendMessage('action cb', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.locator('.tr-feedback__operations-right button')).toHaveCount(2)
  })

  test('should merge custom assistant operations with built-in feedback actions in blackbox mode', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await helper.sendMessage('custom op', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.locator('.tr-feedback__operations-right button')).toHaveCount(2)
    await expect(assistantFeedback.getByText('保存到案例库')).toBeVisible()

    await assistantFeedback.getByText('保存到案例库').click()

    await expect(page.getByTestId('business-action-log')).toContainText('business:assistant')
    await expect(page.locator(helper.selectors.onActionLog)).toContainText('action:save-case:assistant:')
  })
})

test.describe('Chat Feedback Feature (whitebox)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToWhitebox()
  })

  test('should let Root + Page consume custom assistant operations through the default feedback path', async ({
    page,
  }) => {
    const root = helper.selectors.whiteboxChat

    await helper.sendMessage('whitebox custom action', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.getByText('创建工单')).toBeVisible()

    await assistantFeedback.getByText('创建工单').click()

    await expect(page.getByTestId('business-action-log')).toContainText('business:assistant')
    await expect(page.locator(helper.selectors.onActionLog)).toContainText('action:create-ticket:assistant:')
  })
})
