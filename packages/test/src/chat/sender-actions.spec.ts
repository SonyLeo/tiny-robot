import { test, expect, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

function registerFakeSpeechRecognition(page: Page) {
  return page.addInitScript(() => {
    class FakeSpeechRecognition {
      continuous = false
      interimResults = false
      lang = 'zh-CN'
      onstart: ((event: Event) => void) | null = null
      onresult: ((event: Event) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onend: ((event: Event) => void) | null = null

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

    test('sender maxLength should disable submit without truncating the typed content on the official blackbox path', async ({
      page,
    }) => {
      const root = helper.selectors.blackboxChat
      const input = page.locator(root).locator(helper.selectors.senderInput)
      const submitBtn = page.locator(root).locator(helper.selectors.senderSubmitBtn)
      const overLimitText = 'x'.repeat(121)

      await input.fill(overLimitText)
      const value = await input.textContent()

      expect(value?.length).toBe(121)
      expect(value).toBe(overLimitText)
      await expect(submitBtn).toHaveClass(/is-disabled/)
    })

    test('wordCount should be rendered when sender defaults enable it', async ({ page }) => {
      const root = helper.selectors.blackboxChat

      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toContainText('5/120')
    })

    test('voice action should be visible when sender defaults enable it', async () => {
      const root = helper.selectors.blackboxChat

      await helper.expectVoiceActionVisible(true, root)
    })

    test('default footer tools should keep the upload action visible alongside footer controls', async () => {
      const root = helper.selectors.blackboxChat

      await helper.expectUploadActionVisible(true, root)
    })
  })

  test.describe('whitebox', () => {
    test.beforeEach(async () => {
      await helper.switchToWhitebox()
    })

    test('Root + Page should preserve the default upload action from sender and attachments runtime defaults', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.expectUploadActionVisible(true, root)
    })

    test('Root + Page should preserve the default voice action from sender runtime defaults', async () => {
      const root = helper.selectors.whiteboxChat

      await helper.expectVoiceActionVisible(true, root)
    })

    test('Root + Page should preserve sender wordCount defaults', async ({ page }) => {
      const root = helper.selectors.whiteboxChat

      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toContainText('5/120')
    })
  })

  test.describe('granular official-path sender config', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/?chatMode=surface-api')
      await page.locator('nav').getByRole('link').nth(2).click()
      await expect(page.locator('h2')).toContainText('Chat')
      helper = createChatTestHelper(page)
      await page.locator('[data-testid="chat-surface-granular-sender-config"]').waitFor()
    })

    test('Root + primitives should allow sender config to disable wordCount on the official granular path', async ({
      page,
    }) => {
      const root = '[data-testid="chat-surface-granular-sender-config"] .tr-chat'

      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toHaveCount(0)
    })

    test('Root + primitives should allow sender config to hide the voice action on the official granular path', async () => {
      const root = '[data-testid="chat-surface-granular-sender-config"] .tr-chat'

      await helper.expectVoiceActionVisible(false, root)
    })
  })
})
