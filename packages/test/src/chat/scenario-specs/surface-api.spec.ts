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

  test('default renderer slots should keep header/footer and official bubble slot passthrough alive', async ({
    page,
  }) => {
    const root = '[data-testid="chat-surface-slots-default"] .tr-chat'

    await expect(page.getByTestId('surface-header-extra')).toBeVisible()
    await expect(page.getByTestId('surface-footer-extra')).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.welcomeTitle)).toContainText('Surface Welcome')

    await helper.clickPrompt(0, root)
    await helper.waitForAssistantReply(root)

    await expect(page.getByTestId('surface-prefix-slot')).toBeVisible()
    await expect(page.getByTestId('surface-suffix-slot')).toBeVisible()
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

  test('message-list and sender slots should receive live slot props on the official TrChat path', async ({ page }) => {
    const root = page.locator('[data-testid="chat-surface-custom-render"]')

    await expect(root.getByTestId('surface-message-list-slot')).toContainText('messages:1')
    await expect(root.getByTestId('surface-sender-slot-status')).toContainText('status:ready')

    await root.getByTestId('surface-sender-slot-send').click()
    await expect(root.getByTestId('surface-message-list-slot')).toContainText('messages:3', { timeout: 10000 })
  })

  test('surface runtime diagnostics should expose official runtime state and allow a manual reset through history runtime', async ({
    page,
  }) => {
    const sceneRoot = page.locator('[data-testid="chat-surface-runtime-diagnostics"]')
    const chatRoot = '[data-testid="chat-surface-runtime-diagnostics"] .tr-chat'

    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-status')).toContainText('status:ready')
    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-message-count')).toContainText('messages:0')
    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-model')).toContainText('model:openai-test')

    await sceneRoot.getByTestId('surface-runtime-diagnostics-send').click()

    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-status')).toContainText(
      /status:(submitted|streaming)/,
    )
    await helper.waitForStreamingComplete(chatRoot)

    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-status')).toContainText('status:ready')
    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-message-count')).toContainText('messages:2')

    const contents = page.locator(chatRoot).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[openai:openai-test] runtime-diagnostics-path')

    await sceneRoot.getByTestId('surface-runtime-diagnostics-reset').click()
    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-status')).toContainText('status:ready')
    await expect(sceneRoot.getByTestId('surface-runtime-diagnostics-message-count')).toContainText('messages:0')
  })

  test('Root + primitives should expose live model runtime for manual composition and keep the send chain working after a model switch', async ({
    page,
  }) => {
    const root = '[data-testid="chat-surface-granular-model"] .tr-chat'
    const sceneRoot = page.locator('[data-testid="chat-surface-granular-model"]')

    await expect(sceneRoot.getByTestId('surface-granular-current-model')).toContainText('openai-test')
    await expect(sceneRoot.getByTestId('surface-granular-header-title')).toContainText('Surface Granular Model Switch')

    await sceneRoot.getByTestId('surface-granular-switch-model').click()

    await expect(sceneRoot.getByTestId('surface-granular-current-model')).toContainText('deepseek-test')
    await expect(sceneRoot.getByTestId('surface-granular-model-log')).toContainText('deepseek-test')

    await helper.clickPrompt(0, root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('This is a streamed reply from the mock provider.')
  })

  test('TrChat.Provider responseProvider branch and leaf-component header slots should work together', async ({
    page,
  }) => {
    const root = '[data-testid="chat-surface-provider-branch"] .tr-chat'
    const sceneRoot = page.locator('[data-testid="chat-surface-provider-branch"]')

    await expect(sceneRoot.getByTestId('surface-provider-title-slot')).toBeVisible()
    await expect(sceneRoot.getByTestId('surface-provider-extra-slot')).toBeVisible()
    await expect(sceneRoot.locator(helper.selectors.newChatBtn)).toHaveCount(0)

    await helper.sendMessage('provider-branch-path', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[provider-branch:provider-branch-model]')
  })

  test('official granular footer-right slot should suppress default upload and voice sender actions', async ({
    page,
  }) => {
    const root = '[data-testid="chat-surface-granular-footer-right"] .tr-chat'

    await expect(page.getByTestId('surface-granular-footer-right-slot')).toBeVisible()
    await helper.expectUploadActionVisible(false, root)
    await helper.expectVoiceActionVisible(false, root)
  })

  test('official leaf close composition should allow the consumer shell to disappear after the close action', async ({
    page,
  }) => {
    const sceneRoot = page.getByTestId('chat-surface-granular-close')
    const closeButton = sceneRoot.locator('.tr-chat').locator('[title="关闭"]')

    await closeButton.click()
    await expect(sceneRoot).toHaveCount(0)
  })

  test('workspace layout default left owner path should render history UI and support filtering', async ({ page }) => {
    const root = page.locator('[data-testid="chat-surface-workspace-history"]')

    await root.getByTestId('workspace-history-seed').click()

    const items = root.locator(helper.selectors.historyItem)
    await expect(items).toHaveCount(2)

    const searchInput = root.locator('.search-input')
    await searchInput.fill('Beta')
    await expect(items).toHaveCount(1)
    await expect(items.first()).toContainText('Beta Surface')
  })
})
