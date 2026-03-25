import { expect, test, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Edge Overrides', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await helper.switchToBlackboxEdge()
  })

  test('fullscreen should toggle through the scaffold-composed edge header', async ({ page }) => {
    const chat = page.getByTestId('chat-blackbox-edge').locator('.tr-chat')
    const headerButtons = chat.locator('.tr-chat__header-right button')
    const btn = headerButtons.nth(2)

    await expect(chat).not.toHaveClass(/tr-chat--fullscreen/)
    await btn.click()
    await expect(chat).toHaveClass(/tr-chat--fullscreen/)
    await btn.click()
    await expect(chat).not.toHaveClass(/tr-chat--fullscreen/)
  })

  test('senderProps maxLength should disable submit without truncating the typed content', async ({ page }) => {
    const root = '[data-testid="chat-blackbox-edge"] .tr-chat'
    const input = page.locator(root).locator('.tiptap')
    const submitBtn = page.locator(root).locator('.tr-sender-submit-button')

    await input.fill('12345678')
    const value = await input.textContent()

    expect(value?.length).toBe(8)
    expect(value).toBe('12345678')
    await expect(submitBtn).toHaveClass(/is-disabled/)
  })

  test('roleConfigs should override the default placement order', async () => {
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

  test('custom header and footer slots should render in the edge scene', async ({ page }) => {
    const chatNode = page.getByTestId('chat-blackbox-edge')

    await expect(chatNode.getByTestId('custom-header-btn')).toBeVisible()
    await expect(chatNode.getByTestId('custom-footer-extra')).toBeVisible()
    await expect(chatNode.getByTestId('custom-footer-extra')).toHaveText('这是 Footer 额外区域')
  })

  test('close action should hide the composed edge chat shell', async ({ page }) => {
    const chatNode = page.getByTestId('chat-blackbox-edge')
    const closeButton = chatNode.locator('.tr-chat').locator('.tr-chat__header-right button').nth(3)

    await closeButton.click()
    await expect(chatNode).toHaveCount(0)
  })
})
