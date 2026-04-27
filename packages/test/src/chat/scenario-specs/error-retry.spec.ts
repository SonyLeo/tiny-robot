import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Error and Retry Flow', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=error-retry')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-error-retry"]').waitFor()
  })

  // 7.3: error state is shown after a failed request
  test('assistant bubble shows error state after a failed request', async ({ page }) => {
    const root = '[data-testid="chat-error-retry"] .tr-chat'

    await helper.sendMessage('err', root)

    const retryButton = page.locator(root).getByTestId('chat-error-retry')
    await expect(retryButton).toBeVisible({ timeout: 8000 })
  })

  // 7.3: retry replaces the error with a successful reply
  test('clicking retry replaces the error message with a normal reply', async ({ page }) => {
    const root = '[data-testid="chat-error-retry"] .tr-chat'

    await helper.sendMessage('err-once', root)

    const retryButton = page.locator(root).getByTestId('chat-error-retry')
    await expect(retryButton).toBeVisible({ timeout: 8000 })

    await retryButton.click()
    await helper.waitForAssistantReply(root)
    await helper.waitForStreamingComplete(root)

    // Error button should be gone after successful retry
    await expect(retryButton).toHaveCount(0)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[openai:openai-test] err-once')
  })

  // 7.3: regenerate replaces the assistant reply
  test('regenerate button re-generates the assistant reply', async ({ page }) => {
    const root = '[data-testid="chat-error-retry"] .tr-chat'

    await helper.sendMessage('regen-test', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[openai:openai-test] regen-test')

    // Find the regenerate button in the feedback area
    const assistantBubble = page.locator(`${root} .tr-bubble[data-role="assistant"]`).last()
    const feedback = assistantBubble.getByTestId('chat-feedback')
    await expect(feedback).toBeVisible()

    // The refresh/regenerate button is in the right operations area
    const refreshBtn = feedback.locator('.tr-feedback__operations-right button').last()
    await refreshBtn.click()

    await helper.waitForStreamingComplete(root)

    // Should still have 2 messages (user + regenerated assistant)
    const bubbles = page.locator(root).locator(helper.selectors.bubbleItem)
    await expect(bubbles).toHaveCount(2)
    await expect(contents.last()).toContainText('[openai:openai-test] regen-test')
  })
})
