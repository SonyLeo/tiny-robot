import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat History And Conversation', () => {
  test.describe('blackbox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/')
      await page.click('text=Chat 组件')
      await expect(page.locator('h2')).toContainText('Chat 组件测试')
      helper = createChatTestHelper(page)
      await helper.switchToBlackbox()
    })

    test('should open and close the workspace mobile-left drawer on small viewports', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 })
      await helper.clickHistoryBtn(helper.selectors.blackboxChat)
      await helper.expectDrawerOpen(true, helper.selectors.blackboxRoot)

      await helper.clickOverlayToClose(helper.selectors.blackboxRoot)
      await helper.expectDrawerOpen(false, helper.selectors.blackboxRoot)
    })

    test('should reset the conversation back to welcome when creating a new chat', async () => {
      await helper.sendMessage('first conversation')
      await helper.waitForStreamingComplete()

      await helper.clickNewChat()

      await helper.expectWelcomeVisible(true)
    })

    test('should keep the finished conversation in the default desktop history sidebar', async () => {
      await helper.sendMessage('history conversation')
      await helper.waitForStreamingComplete()

      const items = helper.getLocator(helper.selectors.blackboxRoot).locator(helper.selectors.historyItem)
      await expect(items).toHaveCount(1, { timeout: 5000 })
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

    test('should keep the injected history drawer wiring live in whitebox mode', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.clickHistoryBtn(root)
      await helper.expectDrawerOpen(true, root)

      await helper.clickOverlayToClose(root)
      await helper.expectDrawerOpen(false, root)
    })

    test('should reset the whitebox chat through the injected header action', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('whitebox conversation', root)
      await helper.waitForStreamingComplete(root)

      await helper.clickNewChat(root)

      await helper.expectWelcomeVisible(true, root)
    })
  })
})
