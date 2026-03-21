import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Edge Overrides', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToBlackboxEdge()
  })

  test('should support fullscreen mode in the edge demo', async ({ page }) => {
    const chat = page.getByTestId('chat-blackbox-edge').locator('.tr-chat')
    const btn = chat.getByTitle('全屏')

    await expect(chat).not.toHaveClass(/tr-chat--fullscreen/)
    await btn.click()
    await expect(chat).toHaveClass(/tr-chat--fullscreen/)
    await btn.click()
  })

  test('should pass senderProps maxLength without truncating the input content', async ({ page }) => {
    const root = '[data-testid="chat-blackbox-edge"] .tr-chat'
    const input = page.locator(root).locator('.tiptap')
    const submitBtn = page.locator(root).locator('.tr-sender-submit-button')

    await input.fill('12345678')
    const value = await input.textContent()

    expect(value?.length).toBe(8)
    expect(value).toBe('12345678')
    await expect(submitBtn).toHaveClass(/is-disabled/)
  })

  test('should allow edge roleConfigs to override the default placement', async () => {
    const root = '[data-testid="chat-blackbox-edge"] .tr-chat'

    await helper.sendMessage('left', root)
    await helper.waitForAssistantReply(root)

    const placement = await helper
      .getLocator(root)
      .locator(helper.selectors.bubbleItem)
      .first()
      .getAttribute('data-placement')
    expect(placement).toBe('start')
  })

  test('should render custom header and footer slots in the edge demo', async ({ page }) => {
    const chatNode = page.getByTestId('chat-blackbox-edge')

    await expect(chatNode.getByTestId('custom-header-btn')).toBeVisible()
    await expect(chatNode.getByTestId('custom-footer-extra')).toBeVisible()
    await expect(chatNode.getByTestId('custom-footer-extra')).toHaveText('这是 Footer 额外区域')
  })
})
