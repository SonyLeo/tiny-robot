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
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
  })

  test.describe('黑盒模式', () => {
    test.beforeEach(async () => {
      await helper.switchToBlackbox()
    })

    test('启用 wordCount 后应显示字数计数', async ({ page }) => {
      const root = helper.selectors.blackboxChat
      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toContainText('5/20')
    })

    test('浏览器支持语音识别且启用 voice 时应显示默认语音按钮', async () => {
      const root = helper.selectors.blackboxChat
      await helper.expectVoiceActionVisible(true, root)
    })
  })

  test.describe('黑盒边界场景', () => {
    test.beforeEach(async () => {
      await helper.switchToBlackboxEdge()
    })

    test('upload 显式禁用时应覆盖 attachments 的默认上传入口', async () => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      await helper.expectUploadActionVisible(false, root)
      await helper.expectAttachmentsAreaVisible(false, root)
    })

    test('未启用 sender actions feature 的场景下不应显示字数计数', async ({ page }) => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      await helper.typeMessage('12345', root)
      await expect(page.locator(root).locator(helper.selectors.senderWordCounter)).toHaveCount(0)
    })

    test('未配置 voice 时不应显示默认语音按钮', async () => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      await helper.expectVoiceActionVisible(false, root)
    })
  })

  test.describe('白盒模式', () => {
    test.beforeEach(async () => {
      await helper.switchToWhitebox()
    })

    test('自定义 footer-right 插槽应抑制默认 upload / voice actions', async ({ page }) => {
      const root = helper.selectors.whiteboxChat
      await expect(page.getByTestId('whitebox-custom-footer-right')).toBeVisible()
      await helper.expectUploadActionVisible(false, root)
      await helper.expectVoiceActionVisible(false, root)
    })
  })
})
