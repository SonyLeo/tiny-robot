import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { openChatSmokeScene } from './openChatSmokeScene'

const SAVE_CASE_LABEL = '保存到案例库'
const CREATE_TICKET_LABEL = '创建工单'

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

// 7.8: feedback actionMode replace
test.describe('Chat Feedback Feature (replace mode)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=feedback')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-feedback-replace"]').waitFor()
  })

  test('replace mode suppresses built-in copy and refresh buttons and shows only custom actions', async ({ page }) => {
    const root = '[data-testid="chat-feedback-replace"] .tr-chat'

    await helper.sendMessage('replace-mode-test', root)
    await helper.waitForStreamingComplete(root)

    const assistantFeedback = page.locator(`${root} .tr-bubble[data-role="assistant"]`).getByTestId('chat-feedback')
    await expect(assistantFeedback).toHaveCount(1)
    await expect(assistantFeedback).toBeVisible()

    // In replace mode, built-in copy/refresh should not appear
    // Only the custom action should be present
    const operationBtns = assistantFeedback.locator('.tr-feedback__operations-left button')
    await expect(operationBtns).toHaveCount(1)
    await expect(operationBtns.first()).toContainText('自定义操作')
  })
})

// Usage panel tests
test.describe('Chat Feedback — Usage Panel', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=feedback')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-feedback-usage"]').waitFor()
  })

  const root = '[data-testid="chat-feedback-usage"] .tr-chat'

  function getUsageTrigger(page: Page) {
    return page
      .locator(`${root} .tr-bubble[data-role="assistant"]`)
      .getByTestId('chat-feedback')
      .locator('.tr-chat-usage__trigger')
  }

  test('usage icon is absent when the reply carries no usage metadata', async ({ page }) => {
    // "no-usage" does not trigger the usage branch in the mock server
    await helper.sendMessage('no-usage', root)
    await helper.waitForStreamingComplete(root)

    const trigger = getUsageTrigger(page)
    await expect(trigger).toHaveCount(0)
  })

  test('usage icon appears after a reply that includes usage metadata', async ({ page }) => {
    await helper.sendMessage('usage-test', root)
    await helper.waitForStreamingComplete(root)

    const trigger = getUsageTrigger(page)
    await expect(trigger).toHaveCount(1)
    await expect(trigger).toBeVisible()
  })

  test('hovering the usage icon reveals the panel with token counts', async ({ page }) => {
    await helper.sendMessage('usage-test', root)
    await helper.waitForStreamingComplete(root)

    const trigger = getUsageTrigger(page)
    await trigger.hover()

    const panel = page
      .locator(`${root} .tr-bubble[data-role="assistant"]`)
      .getByTestId('chat-feedback')
      .locator('.tr-chat-usage__panel')

    await expect(panel).toBeVisible()
    await expect(panel).toContainText('输入 Token')
    await expect(panel).toContainText('42')
    await expect(panel).toContainText('输出 Token')
    await expect(panel).toContainText('88')
    await expect(panel).toContainText('总计 Token')
    await expect(panel).toContainText('130')
  })

  test('panel disappears when the cursor leaves the usage icon', async ({ page }) => {
    await helper.sendMessage('usage-test', root)
    await helper.waitForStreamingComplete(root)

    const trigger = getUsageTrigger(page)
    await trigger.hover()

    const panel = page
      .locator(`${root} .tr-bubble[data-role="assistant"]`)
      .getByTestId('chat-feedback')
      .locator('.tr-chat-usage__panel')

    await expect(panel).toBeVisible()

    // Move cursor away
    await page.mouse.move(0, 0)
    await expect(panel).not.toBeVisible()
  })

  test('usage icon is not shown on user messages', async ({ page }) => {
    await helper.sendMessage('usage-test', root)
    await helper.waitForStreamingComplete(root)

    const userUsageTrigger = page
      .locator(`${root} .tr-bubble[data-role="user"]`)
      .getByTestId('chat-feedback')
      .locator('.tr-chat-usage__trigger')

    await expect(userUsageTrigger).toHaveCount(0)
  })

  test('usage icon is not shown while the assistant is still streaming', async ({ page }) => {
    // Start a message but don't wait for completion
    await helper.typeMessage('usage-test', root)
    await helper.clickSend(root)

    // During streaming the feedback area itself is hidden, so usage icon must not exist
    const trigger = getUsageTrigger(page)
    await expect(trigger).toHaveCount(0)

    // Confirm it appears after streaming finishes
    await helper.waitForStreamingComplete(root)
    await expect(trigger).toHaveCount(1)
  })
})
