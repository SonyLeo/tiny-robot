import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Message Edit Flow', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=message-edit')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    const root = '[data-testid="chat-message-edit"] .tr-chat'
    await page.locator(`${root} .tr-bubble[data-role="user"]`).first().waitFor({ state: 'visible' })
  })

  // 7.4: clicking edit button enters edit mode
  test('clicking the user message edit button enters edit mode', async ({ page }) => {
    const root = '[data-testid="chat-message-edit"] .tr-chat'

    await page.locator(`${root} .tr-bubble[data-role="user"]`).first().hover()
    await page.getByRole('img').nth(4).click()

    await expect(page.locator(`${root} .edit-input-container`)).toBeVisible({ timeout: 5000 })
  })

  // 7.4: saving edit triggers resend and updates assistant reply
  test('saving an edited message triggers resend and updates the assistant reply', async ({ page }) => {
    const root = '[data-testid="chat-message-edit"] .tr-chat'

    await page.locator(`${root} .tr-bubble[data-role="user"]`).first().hover()
    await page.getByRole('img').nth(4).click()

    const editTextarea = page.getByRole('textbox', { name: '编辑消息内容' })
    await editTextarea.waitFor({ state: 'visible', timeout: 5000 })
    await editTextarea.fill('edited-message')

    await page.getByRole('button', { name: '保存' }).click()
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[openai:openai-test] edited-message')
  })

  // 7.4: cancelling edit restores original content
  test('cancelling edit restores the original message content', async ({ page }) => {
    const root = '[data-testid="chat-message-edit"] .tr-chat'
    const userBubble = page.locator(`${root} .tr-bubble[data-role="user"]`).first()

    await userBubble.hover()
    await page.getByRole('img').nth(4).click()

    const editTextarea = page.getByRole('textbox', { name: '编辑消息内容' })
    await editTextarea.waitFor({ state: 'visible', timeout: 5000 })
    await editTextarea.fill('this should be discarded')

    await page.getByRole('button', { name: '取消' }).click()

    await expect(page.locator(`${root} .edit-input-container`)).toHaveCount(0)
    await expect(userBubble.locator(helper.selectors.bubbleContent)).toContainText('original message')
  })
})
