import { test, expect, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

function registerFakeSpeechRecognition(page: Page) {
  return page.addInitScript(() => {
    class FakeSpeechRecognition {
      continuous = false
      interimResults = false
      lang = 'zh-CN'
      onstart = null
      onresult = null
      onerror = null
      onend = null

      start() {
        this.onstart?.(new Event('start'))
      }

      stop() {
        this.onend?.(new Event('end'))
      }
    }

    ;(window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition =
      FakeSpeechRecognition
    ;(window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition =
      FakeSpeechRecognition
  })
}

test.describe('Chat Sender Actions Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await registerFakeSpeechRecognition(page)
    await page.goto('/')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
  })

  test.describe('blackbox', () => {
    test.beforeEach(async () => {
      await helper.switchToBlackbox()
    })

    test('wordCount should be rendered when senderActions enables it', async ({ page }) => {
      const root = helper.selectors.blackboxChat

      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toContainText('5/20')
    })

    test('voice action should be visible when senderActions enables it', async () => {
      const root = helper.selectors.blackboxChat

      await helper.expectVoiceActionVisible(true, root)
    })
  })

  test.describe('blackbox edge overrides', () => {
    test.beforeEach(async () => {
      await helper.switchToBlackboxEdge()
    })

    test('senderActions upload disable should hide the default upload button and keep attachments area empty', async () => {
      const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

      await helper.expectUploadActionVisible(false, root)
      await helper.expectAttachmentsAreaVisible(false, root)
    })

    test('senderActions override should be able to turn off wordCount', async ({ page }) => {
      const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toHaveCount(0)
    })

    test('voice button should stay hidden when the edge senderActions config does not enable it', async () => {
      const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

      await helper.expectVoiceActionVisible(false, root)
    })
  })

  test.describe('whitebox', () => {
    test.beforeEach(async () => {
      await helper.switchToWhitebox()
    })

    test('custom footer-right on the existing whitebox demo should suppress default upload and voice actions', async ({
      page,
    }) => {
      const root = helper.selectors.whiteboxChat

      await expect(page.getByTestId('whitebox-custom-footer-right')).toBeVisible()
      await helper.expectUploadActionVisible(false, root)
      await helper.expectVoiceActionVisible(false, root)
    })

    test('preset slices whitebox should render default upload and voice actions from root features', async () => {
      const root = '[data-testid="chat-whitebox-slices-default"] .tr-chat'

      await helper.expectUploadActionVisible(true, root)
      await helper.expectVoiceActionVisible(true, root)
    })

    test('footer-right slot should still suppress preset-slices default sender actions', async ({ page }) => {
      const root = '[data-testid="chat-whitebox-slices-slot"] .tr-chat'

      await expect(page.getByTestId('whitebox-slices-custom-footer-right')).toBeVisible()
      await helper.expectUploadActionVisible(false, root)
      await helper.expectVoiceActionVisible(false, root)
    })
  })
})
