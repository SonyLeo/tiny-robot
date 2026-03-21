import { expect, test } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Workspace Shell', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=p5-shell-preview')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="p5-shell-preview"]').waitFor({ state: 'visible' })
  })

  test('should collapse and restore both regions with visible rails', async ({ page }) => {
    await helper.expectLeftCollapsed(false)
    await helper.expectRightCollapsed(false)

    await helper.clickLeftToggle()
    await helper.expectLeftCollapsed(true)
    await helper.expectLeftRailVisible(true)
    await expect(page.locator(helper.selectors.leftRail)).toContainText('History')

    await helper.clickRightToggle()
    await helper.expectRightCollapsed(true)
    await helper.expectRightRailVisible(true)
    await expect(page.locator(helper.selectors.rightRail)).toContainText('Tools')

    await helper.clickLeftRail()
    await helper.expectLeftCollapsed(false)
    await helper.expectLeftRailVisible(false)

    await helper.clickRightRail()
    await helper.expectRightCollapsed(false)
    await helper.expectRightRailVisible(false)
  })

  test('should hide region content while collapsed', async () => {
    await helper.expectLeftRegionContentHidden(false)
    await helper.expectRightRegionContentHidden(false)

    await helper.clickLeftToggle()
    await helper.expectLeftRegionContentHidden(true)

    await helper.clickRightToggle()
    await helper.expectRightRegionContentHidden(true)
  })

  test('should activate the default panels and allow panel switching', async ({ page }) => {
    await helper.expectActivePanelId('History', 'left')
    await helper.expectActivePanelId('Notes', 'right')

    await helper.clickPanelTab('Sources', 'left')
    await helper.expectActivePanelId('Sources', 'left')

    await helper.clickPanelTab('Outline', 'right')
    await helper.expectActivePanelId('Outline', 'right')

    const meta = page.locator(helper.selectors.shellMeta)
    await expect(meta).toContainText('Left active: sources')
    await expect(meta).toContainText('Right active: outline')
  })

  test('should preserve the active panel across collapse cycles', async () => {
    await helper.clickPanelTab('Sources', 'left')
    await helper.expectActivePanelId('Sources', 'left')

    await helper.clickLeftToggle()
    await helper.expectLeftCollapsed(true)

    await helper.clickLeftToggle()
    await helper.expectLeftCollapsed(false)
    await helper.expectActivePanelId('Sources', 'left')
  })

  test('should toggle fullWidth mode and keep shell appearance in sync', async ({ page }) => {
    const shell = page.locator(helper.selectors.workspaceShell)
    const chat = page.locator(helper.selectors.shellChat)

    await helper.expectFullWidthMode(false)
    await expect(shell).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(chat).toHaveAttribute('data-tr-color-mode', 'dark')

    await helper.clickFullWidthToggle()
    await helper.expectFullWidthMode(true)

    await helper.clickFullWidthToggle()
    await helper.expectFullWidthMode(false)
  })

  test('should render chat inside the shell and complete a basic roundtrip', async ({ page }) => {
    await helper.expectShellChatVisible()

    await helper.sendMessageInShell('What is 2+2?')
    await helper.waitForShellAssistantReply(2)

    const messages = page.locator(helper.selectors.shellChat).locator(helper.selectors.bubbleItem)
    await expect(messages).toHaveCount(2)
    await expect(messages.nth(0)).toContainText('2+2')
    await expect(messages.nth(1)).toBeVisible()
  })

  test('should keep chat functional after region collapse', async ({ page }) => {
    await helper.sendMessageInShell('Hello shell')
    await helper.waitForShellAssistantReply(2)

    await helper.clickLeftToggle()
    await helper.expectLeftCollapsed(true)

    await helper.sendMessageInShell('Still working?')
    await helper.waitForShellAssistantReply(4)

    const messages = page.locator(helper.selectors.shellChat).locator(helper.selectors.bubbleItem)
    await expect(messages).toHaveCount(4)
  })

  test('should keep chat functional through fullWidth changes', async ({ page }) => {
    await helper.sendMessageInShell('Before full width')
    await helper.waitForShellAssistantReply(2)

    await helper.clickFullWidthToggle()
    await helper.expectFullWidthMode(true)

    await helper.sendMessageInShell('After full width')
    await helper.waitForShellAssistantReply(4)

    const messages = page.locator(helper.selectors.shellChat).locator(helper.selectors.bubbleItem)
    await expect(messages).toHaveCount(4)
  })

  test('should survive a fullWidth toggle during an in-flight response', async ({ page }) => {
    await helper.sendMessageInShell('Tell me a long story')
    await helper.clickFullWidthToggle()
    await helper.expectFullWidthMode(true)
    await helper.waitForShellAssistantReply(2)

    const messages = page.locator(helper.selectors.shellChat).locator(helper.selectors.bubbleItem)
    await expect(messages).toHaveCount(2)
  })
})
