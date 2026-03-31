import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Surface API', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=surface-api')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-surface-slots-default"]').waitFor()
  })

  test('default renderer slots should keep header/footer and bubble slot passthrough alive', async ({ page }) => {
    const root = '[data-testid="chat-surface-slots-default"] .tr-chat'

    await expect(page.getByTestId('surface-header-extra')).toBeVisible()
    await expect(page.getByTestId('surface-footer-extra')).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.welcomeTitle)).toContainText('Surface Welcome')

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.getByTestId('surface-prefix-slot')).toBeVisible()
    await expect(page.getByTestId('surface-suffix-slot')).toBeVisible()
    await expect(page.getByTestId('surface-after-slot')).toBeVisible()
    await expect(page.getByTestId('surface-content-footer-slot')).toBeVisible()
  })

  test('header, welcome, and empty slots should replace their default regions', async ({ page }) => {
    const headerRoot = page.locator('[data-testid="chat-surface-header-slot"]')
    await expect(headerRoot.getByTestId('surface-header-slot')).toBeVisible()
    await expect(headerRoot.locator('.tr-chat__header-brand')).toHaveCount(0)

    const welcomeRoot = page.locator('[data-testid="chat-surface-welcome-slot"]')
    await expect(welcomeRoot.getByTestId('surface-welcome-slot')).toBeVisible()
    await expect(welcomeRoot.locator(helper.selectors.promptItem)).toHaveCount(0)

    const emptyRoot = page.locator('[data-testid="chat-surface-empty-slot"]')
    await expect(emptyRoot.getByTestId('surface-empty-slot')).toBeVisible()
  })

  test('message-list and sender slots should receive live slot props', async ({ page }) => {
    const root = page.locator('[data-testid="chat-surface-custom-render"]')

    await expect(root.getByTestId('surface-message-list-slot')).toContainText('messages:0')
    await expect(root.getByTestId('surface-sender-slot-status')).toContainText('status:ready')

    await root.getByTestId('surface-sender-slot-send').click()
    await expect(root.getByTestId('surface-message-list-slot')).toContainText('messages:3', { timeout: 10000 })
  })

  test('TrChat should preserve an injected runtime.chatKit responseProvider', async ({ page }) => {
    const root = '[data-testid="chat-surface-runtime-chat-kit"] .tr-chat'

    await helper.sendMessage('runtime-chat-kit-path', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[runtime-chat-kit:runtime-chat-kit-model]')
  })

  test('TrChat.Scaffold should expose live slot props for manual composition and model switching', async ({ page }) => {
    const root = '[data-testid="chat-surface-scaffold"] .tr-chat'
    const sceneRoot = page.locator('[data-testid="chat-surface-scaffold"]')

    await expect(sceneRoot.getByTestId('surface-scaffold-current-model')).toContainText('openai-test')
    await expect(sceneRoot.getByTestId('surface-scaffold-header-title')).toContainText('Surface Scaffold')

    await sceneRoot.getByTestId('surface-scaffold-switch-model').click()

    await expect(sceneRoot.getByTestId('surface-scaffold-current-model')).toContainText('deepseek-test')
    await expect(sceneRoot.getByTestId('surface-scaffold-model-log')).toContainText('deepseek-test')

    await helper.clickPrompt(0, root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })

  test('TrChat.Root responseProvider branch and leaf-component header slots should work together', async ({ page }) => {
    const root = '[data-testid="chat-surface-root-provider"] .tr-chat'
    const sceneRoot = page.locator('[data-testid="chat-surface-root-provider"]')

    await expect(sceneRoot.getByTestId('surface-root-title-slot')).toBeVisible()
    await expect(sceneRoot.getByTestId('surface-root-extra-slot')).toBeVisible()
    await expect(sceneRoot.locator(helper.selectors.newChatBtn)).toHaveCount(0)

    await helper.sendMessage('root-provider-path', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[root-provider:root-provider-model]')
  })

  test('HistorySurface should render independent history UI and support filtering', async ({ page }) => {
    const root = page.locator('[data-testid="chat-surface-history-surface"]')

    await root.getByTestId('history-surface-seed').click()

    const items = root.locator(helper.selectors.historyItem)
    await expect(items).toHaveCount(2)

    const searchInput = root.locator('.search-input')
    await searchInput.fill('Beta')
    await expect(items).toHaveCount(1)
    await expect(items.first()).toContainText('Beta Surface')
  })
})
