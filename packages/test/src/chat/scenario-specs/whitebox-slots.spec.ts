import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Whitebox Slot Passthrough', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=whitebox-slots')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-whitebox-slots-basic"]').waitFor()
  })

  // 7.2: header-extra slot
  test('header-extra slot content is visible in Root + Page path', async ({ page }) => {
    await expect(page.getByTestId('wb-header-extra')).toBeVisible()
    await expect(page.getByTestId('wb-header-extra')).toContainText('Header Extra')
  })

  // 7.2: footer-extra slot
  test('footer-extra slot content is visible in Root + Page path', async ({ page }) => {
    await expect(page.getByTestId('wb-footer-extra')).toBeVisible()
    await expect(page.getByTestId('wb-footer-extra')).toContainText('Footer Extra')
  })

  // 7.2: welcome slot replaces default
  test('welcome slot replaces the default welcome region in Root + Page path', async ({ page }) => {
    const welcomeRoot = page.locator('[data-testid="chat-whitebox-slots-welcome"]')
    await expect(welcomeRoot.getByTestId('wb-custom-welcome')).toBeVisible()
    await expect(welcomeRoot.getByTestId('wb-custom-welcome')).toContainText('Custom Welcome Slot')
    // Default welcome prompts should not be present
    await expect(welcomeRoot.locator(helper.selectors.promptItem)).toHaveCount(0)
  })

  // 7.2: sender slot receives live status and send props
  test('sender slot receives live status and send slot props in Root + Page path', async ({ page }) => {
    const senderRoot = page.locator('[data-testid="chat-whitebox-slots-sender"]')

    await expect(senderRoot.getByTestId('wb-sender-status')).toContainText('status:ready')
    await expect(senderRoot.getByTestId('wb-sender-error')).toContainText('error:no')

    await senderRoot.getByTestId('wb-sender-send').click()

    await expect(senderRoot.getByTestId('wb-sender-status')).toContainText(/status:(submitted|streaming|ready)/)
    await helper.waitForStreamingComplete('[data-testid="chat-whitebox-slots-sender"] .tr-chat')
    await expect(senderRoot.getByTestId('wb-sender-status')).toContainText('status:ready')
  })

  // 7.2: message-list slot receives messages ref
  test('message-list slot receives a live messages ref with correct count', async ({ page }) => {
    const msgListRoot = page.locator('[data-testid="chat-whitebox-slots-msglist"]')

    // Initial messages from initialMessages config
    await expect(msgListRoot.getByTestId('wb-msglist-count')).toContainText('messages:1')

    await msgListRoot.getByTestId('wb-msglist-send').click()

    await expect(msgListRoot.getByTestId('wb-msglist-count')).toContainText('messages:3', { timeout: 10000 })
  })

  // 7.2: messageListVariant prop
  test('messageListVariant prop is honored on the Root + Page path', async ({ page }) => {
    const variantRoot = page.locator('[data-testid="chat-whitebox-slots-variant"] .tr-chat')
    // workspace variant sets data-variant="workspace" on the body div
    await expect(variantRoot.locator('.tr-chat__body[data-variant="workspace"]')).toBeVisible()
  })

  // 7.9: update:model emit
  test('TrChat.Page update:model emit fires when model is switched', async ({ page }) => {
    const emitsRoot = page.locator('[data-testid="chat-whitebox-slots-emits"]')
    const chatRoot = '[data-testid="chat-whitebox-slots-emits"] .tr-chat'

    await expect(emitsRoot.getByTestId('wb-emit-model')).toContainText('model:none')

    await helper.selectModel('DeepSeek Test', chatRoot)

    await expect(emitsRoot.getByTestId('wb-emit-model')).toContainText('model:deepseek-test')
  })

  // 7.9: update:show emit via close button
  test('Header close button fires the close callback', async ({ page }) => {
    const closeRoot = page.locator('[data-testid="chat-whitebox-slots-close"]')
    const chatRoot = '[data-testid="chat-whitebox-slots-close"] .tr-chat'

    await expect(closeRoot.getByTestId('wb-emit-close-show')).toContainText('show:none')

    const closeBtn = page.locator(chatRoot).locator(helper.selectors.closeBtn)
    await closeBtn.click()

    await expect(closeRoot.getByTestId('wb-emit-close-show')).toContainText('show:false')
  })
})
