import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Request Lifecycle', () => {
  test.describe('blackbox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/')
      await page.click('text=Chat 组件')
      await expect(page.locator('h2')).toContainText('Chat 组件测试')
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
  })

  test.describe('blackbox edge', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/')
      await page.click('text=Chat 组件')
      await expect(page.locator('h2')).toContainText('Chat 组件测试')
      helper = createChatTestHelper(page)
      await helper.switchToBlackboxEdge()
    })

    test('should surface the error callback when the provider fails', async ({ page }) => {
      const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

      await helper.sendMessage('err', root)

      const errLog = page.getByTestId('on-error-log')
      await expect(errLog).toContainText('error:Mock API Error: provider execution failed')
    })

    test('should retry a failed request through the error action', async ({ page }) => {
      const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

      await helper.sendMessage('err', root)

      const retryButton = page.locator(root).getByTestId('chat-error-retry')
      await expect(retryButton).toBeVisible()

      await retryButton.click()
      await helper.waitForAssistantReply(root)

      const contents = page.locator(root).locator(helper.selectors.bubbleContent)
      await expect(contents.last()).toContainText('[edge-provider:edge-model] err')
    })
  })

  test.describe('whitebox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/')
      await page.click('text=Chat 组件')
      await expect(page.locator('h2')).toContainText('Chat 组件测试')
      helper = createChatTestHelper(page)
      await helper.switchToWhitebox()
    })

    test('should start in the ready state with zero messages', async () => {
      await helper.expectStatus('ready')
      await helper.expectStatusMessageCount('0')
    })

    test('should return to ready and increase message count after a completed request', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('status-flow', root)
      await helper.waitForStreamingComplete(root)
      await helper.expectStatus('ready')

      const messageCount = page.locator(helper.selectors.messageCount)
      const countText = await messageCount.textContent()
      expect(Number(countText)).toBeGreaterThanOrEqual(2)
    })

    test('should emit onFinish after a successful response', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('test onFinish', root)
      await helper.waitForStreamingComplete(root)
      await helper.expectFinishLog('finish:')
    })

    test('should terminate cleanly and report the error when the provider throws', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('err', root)

      const finishLog = page.getByTestId('on-finish-log')
      await expect(finishLog).toContainText('error:Mock API Error: provider execution failed')
    })
  })
})
