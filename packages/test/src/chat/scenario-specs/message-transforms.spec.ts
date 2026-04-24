import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Message Transforms', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=message-transforms')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.getByTestId('chat-message-transforms-trchat').waitFor()
  })

  test('TrChat config.messages.transforms should stream chunk diagnostics and rewrite final assistant content', async ({
    page,
  }) => {
    const sceneRoot = page.locator('[data-testid="chat-message-transforms-trchat"]')
    const chatRoot = '[data-testid="chat-message-transforms-trchat"] .tr-chat'

    await helper.sendMessage('transform trchat', chatRoot)
    await helper.waitForStreamingComplete(chatRoot)

    await expect(sceneRoot.getByTestId('transform-trchat-chunk-count')).not.toContainText('chunks:0')
    await expect(sceneRoot.locator('[data-testid="message-transform-card"]')).toContainText(
      '[card] [openai:openai-test] transform trchat',
    )
  })

  test('Root + Page config-owned transforms should flow through the same renderer contract', async ({ page }) => {
    const sceneRoot = page.locator('[data-testid="chat-message-transforms-whitebox"]')
    const chatRoot = '[data-testid="chat-message-transforms-whitebox"] .tr-chat'

    await helper.sendMessage('transform whitebox', chatRoot)
    await helper.waitForStreamingComplete(chatRoot)

    await expect(sceneRoot.getByTestId('transform-whitebox-chunk-count')).not.toContainText('chunks:0')
    await expect(sceneRoot.locator('[data-testid="message-transform-card"]')).toContainText(
      '[card] [openai:openai-test] transform whitebox',
    )
  })
})
