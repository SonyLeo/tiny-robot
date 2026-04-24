import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { openChatSmokeScene } from './openChatSmokeScene'

test.describe('Chat History And Conversation', () => {
  test.describe('trchat-entry', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      helper = await openChatSmokeScene(page, 'trchat')
    })

    test('should open and close the workspace mobile-left drawer on small viewports', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 900 })
      await helper.clickHistoryBtn(helper.selectors.trChatChat)
      await helper.expectDrawerOpen(true, helper.selectors.trChatRoot)

      await helper.clickOverlayToClose(helper.selectors.trChatRoot)
      await helper.expectDrawerOpen(false, helper.selectors.trChatRoot)
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

      const items = helper.getLocator(helper.selectors.trChatRoot).locator(helper.selectors.historyItem)
      await expect(items).toHaveCount(1, { timeout: 5000 })
    })
  })

  test.describe('whitebox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      helper = await openChatSmokeScene(page, 'whitebox')
    })

    test('should keep the official Root + Page history drawer wiring live on mobile', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await page.setViewportSize({ width: 480, height: 900 })
      await helper.clickHistoryBtn(root)
      await helper.expectDrawerOpen(true, helper.selectors.whiteboxRoot)

      await helper.clickOverlayToClose(helper.selectors.whiteboxRoot)
      await helper.expectDrawerOpen(false, helper.selectors.whiteboxRoot)
    })

    test('should reset the whitebox chat through the official header action', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('whitebox conversation', root)
      await helper.waitForStreamingComplete(root)

      await helper.clickNewChat(root)
      await helper.expectWelcomeVisible(true, root)
    })
  })

  test.describe('granular', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      helper = await openChatSmokeScene(page, 'granular')
    })

    test('should open and close the granular history drawer on mobile', async ({ page }) => {
      const root = helper.selectors.granularChat

      await page.setViewportSize({ width: 480, height: 900 })
      await helper.clickHistoryBtn(root)
      await helper.expectDrawerOpen(true, helper.selectors.granularRoot)

      await helper.clickOverlayToClose(helper.selectors.granularRoot)
      await helper.expectDrawerOpen(false, helper.selectors.granularRoot)
    })

    test('should keep granular history entries after a completed conversation', async ({ page }) => {
      const root = helper.selectors.granularChat

      await helper.sendMessage('granular history conversation', root)
      await helper.waitForStreamingComplete(root)

      const items = page.locator(helper.selectors.granularRoot).locator(helper.selectors.historyItem)
      await expect(items).toHaveCount(1, { timeout: 5000 })
    })

    test('should return the granular scene back to welcome after starting a new chat', async () => {
      const root = helper.selectors.granularChat

      await helper.sendMessage('granular reset conversation', root)
      await helper.waitForStreamingComplete(root)

      await helper.clickNewChat(root)
      await helper.expectWelcomeVisible(true, root)
    })
  })
})
