import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { openChatSmokeScene } from './openChatSmokeScene'

const SAVE_CASE_LABEL = '\u4fdd\u5b58\u5230\u6848\u4f8b\u5e93'
const CREATE_TICKET_LABEL = '\u521b\u5efa\u5de5\u5355'

function getAssistantFeedback(root: string, page: Page) {
  return page.locator(`${root} .tr-bubble[data-role="assistant"]`).getByTestId('chat-feedback')
}

test.describe('Chat Feedback Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    helper = await openChatSmokeScene(page, 'trchat', { entry: 'component-test' })
  })

  test('should reveal assistant feedback after the assistant reply completes', async ({ page }) => {
    const root = helper.selectors.trChatChat

    await helper.sendMessage('feedback timing', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback).toBeVisible()
  })

  test('should expose built-in assistant feedback actions on the official TrChat path', async ({ page }) => {
    const root = helper.selectors.trChatChat

    await helper.sendMessage('action cb', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.locator('.tr-feedback__operations-right button')).toHaveCount(2)
  })

  test('should merge custom assistant operations with built-in feedback actions in TrChat mode', async ({ page }) => {
    const root = helper.selectors.trChatChat

    await helper.sendMessage('custom op', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.locator('.tr-feedback__operations-right button')).toHaveCount(2)
    await expect(assistantFeedback.getByText(SAVE_CASE_LABEL)).toBeVisible()

    await assistantFeedback.getByText(SAVE_CASE_LABEL).click()

    await expect(page.getByTestId('business-action-log')).toContainText('business:assistant')
    await expect(page.locator(helper.selectors.onActionLog)).toContainText('action:save-case:assistant:')
  })
})

test.describe('Chat Feedback Feature (whitebox)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    helper = await openChatSmokeScene(page, 'whitebox', { entry: 'component-test' })
  })

  test('should let Root + Page consume custom assistant operations through the default feedback path', async ({
    page,
  }) => {
    const root = helper.selectors.whiteboxChat

    await helper.sendMessage('whitebox custom action', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback.getByText(CREATE_TICKET_LABEL)).toBeVisible()

    await assistantFeedback.getByText(CREATE_TICKET_LABEL).click()

    await expect(page.getByTestId('business-action-log')).toContainText('business:assistant')
    await expect(page.locator(helper.selectors.onActionLog)).toContainText('action:create-ticket:assistant:')
  })
})

test.describe('Chat Feedback Feature (granular)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    helper = await openChatSmokeScene(page, 'granular', { entry: 'component-test' })
  })

  test('should reveal assistant feedback after a completed granular reply', async ({ page }) => {
    const root = helper.selectors.granularChat

    await helper.sendMessage('granular feedback timing', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = getAssistantFeedback(root, page)
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback).toBeVisible()
    await expect(assistantFeedback.locator('.tr-feedback__operations-right button')).toHaveCount(2)
  })
})
