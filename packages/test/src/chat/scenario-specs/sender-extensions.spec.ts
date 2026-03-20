import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Sender Extensions Passthrough', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=sender-extensions')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-sender-extensions-blackbox"]').waitFor()
  })

  test('blackbox senderProps.extensions should render suggestion UI and allow selection', async ({ page }) => {
    const root = '[data-testid="chat-sender-extensions-blackbox"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.typeMessage('ECS', root)
    await helper.expectSuggestionListVisible(true)
    await expect(page.locator(helper.selectors.suggestionItem).first()).toContainText('ECS instance startup issue')

    await helper.clickSuggestionItem(0)
    await expect(page.locator(root).locator(helper.selectors.senderInput)).toContainText('ECS instance startup issue')
  })

  test('whitebox TrChat.Sender should receive extensions and keep the submit chain working', async ({ page }) => {
    const root = '[data-testid="chat-sender-extensions-whitebox"] .tr-chat'

    await helper.expectWelcomeVisible(true, root)
    await helper.typeMessage('ECS', root)
    await helper.expectSuggestionListVisible(true)

    await helper.clickSuggestionItem(1)
    await expect(page.locator(root).locator(helper.selectors.senderInput)).toContainText('ECS backup restore workflow')

    await helper.clickSend(root)
    await helper.expectWelcomeVisible(false, root)
    await helper.waitForAssistantReply(root)
  })
})
