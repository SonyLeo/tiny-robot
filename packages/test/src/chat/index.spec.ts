import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Entry Smoke', () => {
  test.describe('blackbox', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/')
      await page.click('text=Chat 组件')
      await expect(page.locator('h2')).toContainText('Chat 组件测试')
      helper = createChatTestHelper(page)
      await helper.switchToBlackbox()
    })

    test('should render the core chat shell with brand and welcome content', async () => {
      await helper.expectHeaderVisible()
      await helper.expectFooterVisible()
      await helper.expectWelcomeVisible(true)
      await helper.expectBrandTitle('Chat Kit 测试')
      await helper.expectWelcomeTitle('TinyRobot')
      await helper.expectPromptCount(2)
    })

    test('should consume a welcome prompt and transition into the message list', async () => {
      await helper.clickPrompt(0)
      await helper.expectWelcomeVisible(false)
      await helper.expectMessageListVisible()
      await helper.waitForAssistantReply()
    })

    test('should send a message and keep the default user and assistant placement', async () => {
      await helper.sendMessage('entry-smoke')
      await helper.waitForAssistantReply()
      await helper.expectUserOnRight()
      await helper.expectAssistantOnLeft()
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

    test('should render the composed root slices', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.expectHeaderVisible(root)
      await helper.expectFooterVisible(root)
      await helper.expectWelcomeVisible(true, root)
    })

    test('should keep the injected submit chain working after the welcome state', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.clickPrompt(0, root)
      await helper.expectWelcomeVisible(false, root)
      await helper.expectMessageListVisible(root)
      await helper.waitForAssistantReply(root)
    })
  })
})
