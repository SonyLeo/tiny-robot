import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

async function openChatDemo(page: Page) {
  await page.goto('/')
  await page.locator('nav').getByRole('link').nth(2).click()
  await expect(page.locator('h2')).toContainText('Chat')
}

test.describe('Chat Request Lifecycle', () => {
  test.describe('blackbox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await openChatDemo(page)
      helper = createChatTestHelper(page)
      await helper.switchToBlackbox()
    })

    test('should allow an in-flight response to be aborted', async () => {
      await helper.sendMessage('abort-request')
      await helper.clickAbort()
      await helper.waitForStreamingComplete()
    })

    test('should show and then clear optimistic bubbles during a pending request', async ({ page }) => {
      const root = helper.selectors.blackboxChat

      await helper.sendMessage('optimistic-state', root)

      const optimisticBubble = page.locator(root).locator(helper.selectors.bubbleOptimistic)
      await expect(optimisticBubble.first()).toBeVisible()

      await helper.waitForStreamingComplete(root)
      await expect(optimisticBubble).toHaveCount(0)
    })

    test('should expose retry and recover from a transient provider failure on the official blackbox path', async ({
      page,
    }) => {
      const root = helper.selectors.blackboxChat

      await helper.sendMessage('err-once', root)

      const retryButton = page.locator(root).getByTestId('chat-error-retry')
      await expect(retryButton).toBeVisible()

      await retryButton.click()
      await helper.waitForAssistantReply(root)
      await helper.waitForStreamingComplete(root)

      const contents = page.locator(root).locator(helper.selectors.bubbleContent)
      await expect(contents.last()).toContainText('[openai:openai-test] err-once')
    })
  })

  test.describe('whitebox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await openChatDemo(page)
      helper = createChatTestHelper(page)
      await helper.switchToWhitebox()
    })

    test('should start in the ready state with zero messages', async () => {
      await helper.expectStatus('ready')
      await helper.expectStatusMessageCount('0')
    })

    test('should return to ready and update the lifecycle diagnostics after a completed request', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('status-flow', root)
      await helper.waitForStreamingComplete(root)
      await helper.expectStatus('ready')

      const messageCount = page.locator(helper.selectors.messageCount)
      await expect(messageCount).toContainText('messages:2')
      await helper.expectFinishLog('finish:[openai:openai-test] status-flow')
    })

    test('should report the lifecycle error log and surface retry affordances when the provider fails', async ({
      page,
    }) => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('err', root)

      const errorLog = page.getByTestId('on-error-log')
      await expect(errorLog).toContainText('Mock API Error: provider execution failed')

      const retryButton = page.locator(root).getByTestId('chat-error-retry')
      await expect(retryButton).toBeVisible()
    })
  })
})
