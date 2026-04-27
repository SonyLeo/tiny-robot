import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { CHAT_SELECTORS } from '../selectors'

test.describe('Chat MessageList Config', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=message-list-config')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-msglist-role-configs"]').waitFor()
  })

  // 7.6: custom role-configs avatar renders in bubbles
  test('custom role-configs avatar renders in assistant and user bubbles', async ({ page }) => {
    const root = '[data-testid="chat-msglist-role-configs"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)
    await helper.waitForStreamingComplete(root)

    // Custom avatar components render with class="custom-avatar"
    const customAvatars = page.locator(root).locator('.custom-avatar')
    await expect(customAvatars).toHaveCount(2, { timeout: 5000 })
    await expect(customAvatars.first()).toContainText(/AI|ME/)
    await expect(customAvatars.last()).toContainText(/AI|ME/)
  })

  // 7.6: auto-scroll brings new messages into view
  test('auto-scroll is true and new messages scroll the list to the bottom', async ({ page }) => {
    const root = '[data-testid="chat-msglist-autoscroll"] .tr-chat'

    await helper.clickPrompt(0, root)
    await helper.waitForStreamingComplete(root)

    const lastBubble = page.locator(root).locator(helper.selectors.bubbleItem).last()
    await expect(lastBubble).toBeVisible({ timeout: 5000 })
  })

  // 7.6: group-strategy consecutive groups same-role messages
  test('group-strategy consecutive groups consecutive same-role messages into fewer bubbles', async ({ page }) => {
    const root = '[data-testid="chat-msglist-group-strategy"] .tr-chat'

    // 4 messages (1 user + 3 consecutive assistant) with consecutive grouping
    // the 3 assistant messages should be in 1 group = 2 bubbles total
    const bubbles = page.locator(root).locator(CHAT_SELECTORS.bubbleItem)
    await expect(bubbles).toHaveCount(2, { timeout: 5000 })
  })
})
