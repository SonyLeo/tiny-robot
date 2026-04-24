import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'
import { openChatSmokeScene } from './openChatSmokeScene'

test.describe('Chat Entry Smoke', () => {
  test.describe('trchat-entry', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      helper = await openChatSmokeScene(page, 'trchat')
    })

    test('should render the official TrChat shell with welcome state and sender affordances', async () => {
      await helper.expectHeaderVisible()
      await helper.expectFooterVisible()
      await helper.expectWelcomeVisible(true)
      await helper.expectBrandTitle('TrChat')
      await helper.expectWelcomeTitle('Official TrChat entry')
      await helper.expectUploadActionVisible(true)
      await helper.expectVoiceActionVisible(true)
    })

    test('should send from the welcome state and transition into the TrChat message list', async () => {
      await helper.sendMessage('trchat welcome send')
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
      helper = await openChatSmokeScene(page, 'whitebox')
    })

    test('should render the official Root + Page shell with diagnostics and welcome state', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await helper.expectHeaderVisible(root)
      await helper.expectFooterVisible(root)
      await helper.expectWelcomeVisible(true, root)
      await helper.expectBrandTitle('Root + Page', root)
      await helper.expectWelcomeTitle('Official Root + Page entry', root)
      await expect(page.getByTestId('status-indicator')).toContainText('status:ready')
      await expect(page.getByTestId('message-count')).toContainText('messages:0')
    })

    test('should keep the official submit chain working after the welcome state', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.sendMessage('whitebox welcome send', root)
      await helper.expectWelcomeVisible(false, root)
      await helper.expectMessageListVisible(root)
      await helper.waitForAssistantReply(root)
    })
  })

  test.describe('granular', () => {
    let helper: ReturnType<typeof createChatTestHelper>

    test.beforeEach(async ({ page }: { page: Page }) => {
      helper = await openChatSmokeScene(page, 'granular')
    })

    test('should render the official Root + primitives shell with workspace, sender, and attachments visible', async ({
      page,
    }) => {
      const root = helper.selectors.granularChat

      await helper.expectHeaderVisible(root)
      await helper.expectFooterVisible(root)
      await helper.expectWelcomeVisible(true, root)
      await helper.expectBrandTitle('Root + primitives', root)
      await helper.expectWelcomeTitle('Official Root + primitives entry', root)
      await helper.expectUploadActionVisible(true, root)
      await helper.expectVoiceActionVisible(true, root)
      await expect(page.getByTestId('granular-panel')).toContainText('Root + primitives')
    })

    test('should transition from the granular welcome state into the message list without losing workspace affordances', async ({
      page,
    }) => {
      const root = helper.selectors.granularChat

      await helper.clickPrompt(0, root)
      await helper.expectWelcomeVisible(false, root)
      await helper.expectMessageListVisible(root)
      await helper.waitForAssistantReply(root)
      await expect(page.getByTestId('granular-panel')).toBeVisible()
    })
  })
})
