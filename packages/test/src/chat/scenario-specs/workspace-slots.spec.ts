import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat Workspace Panel Slots', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=workspace-slots')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.getByTestId('switch-workspace-slots').click()
    await page.getByTestId('chat-workspace-slots-default').waitFor()
  })

  test('TrChat workspace slots render custom desktop left and right panels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const root = page.locator('[data-testid="chat-workspace-slots-default"]')
    const rightPanelToggle = root.locator('.tr-chat__header-right button').last()

    await expect(root.getByTestId('workspace-left-default')).toBeVisible()
    await expect(root.getByTestId('workspace-left-default')).toContainText('Desktop Left Slot')

    await rightPanelToggle.click({ force: true })
    await expect(root.getByTestId('workspace-right-default')).toBeVisible()
    await expect(root.getByTestId('workspace-right-default')).toContainText('Desktop Right Slot')
  })

  test('mobile-left falls back to left when mobile-left is not provided', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    const root = page.locator('[data-testid="chat-workspace-slots-default"]')

    await helper.clickHistoryBtn('[data-testid="chat-workspace-slots-default"] .tr-chat')
    await expect(root.getByTestId('workspace-left-default')).toBeVisible()
    await expect(root.getByTestId('workspace-mobile-left-override')).toHaveCount(0)
  })

  test('explicit mobile-left and mobile-right overrides win over desktop panel slots', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    const root = page.locator('[data-testid="chat-workspace-slots-mobile-override"]')
    const chatRoot = '[data-testid="chat-workspace-slots-mobile-override"] .tr-chat'
    const rightPanelToggle = root.locator('.tr-chat__header-right button').last()

    await helper.clickHistoryBtn(chatRoot)
    await expect(root.getByTestId('workspace-mobile-left-override')).toBeVisible()
    await expect(root.getByTestId('workspace-left-override')).toHaveCount(0)

    // Close drawer and wait for overlay to disappear before clicking right toggle
    await root.locator('.tr-chat-drawer-overlay').click({ force: true })
    await expect(root.locator('.tr-chat-drawer-overlay.is-open')).toHaveCount(0, { timeout: 3000 })

    await rightPanelToggle.click()
    await expect(root.getByTestId('workspace-mobile-right-override')).toBeVisible()
    await expect(root.getByTestId('workspace-right-override')).toHaveCount(0)
  })
})

// 7.10: workspace region interaction coverage
test.describe('Chat Workspace Region Interactions', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=workspace-interaction')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.getByTestId('switch-workspace-interaction').click()
    await page.getByTestId('chat-workspace-interaction').waitFor()
  })

  test('desktop right region toggle via header button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const root = page.locator('[data-testid="chat-workspace-interaction"]')
    const rightRegion = root.locator('.tr-workspace-shell__region--right')
    const rightPanelToggle = root.locator('[title="切换工作区面板"]')

    // Initially closed — right region width should be 0 (is-hidden)
    await expect(rightRegion).toHaveCSS('width', '0px', { timeout: 3000 })

    // Open right panel
    await rightPanelToggle.click({ force: true })
    await expect(rightRegion).not.toHaveCSS('width', '0px', { timeout: 3000 })
    await expect(root.getByTestId('wi-right-panel')).toBeVisible({ timeout: 3000 })

    // Close right panel
    await rightPanelToggle.click({ force: true })
    await expect(rightRegion).toHaveCSS('width', '0px', { timeout: 3000 })
  })

  test('mobile left drawer opens and closes via overlay click', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    const root = '[data-testid="chat-workspace-interaction"] .tr-chat'

    await helper.clickHistoryBtn(root)
    await helper.expectDrawerOpen(true, '[data-testid="chat-workspace-interaction"]')

    await helper.clickOverlayToClose('[data-testid="chat-workspace-interaction"]')
    await helper.expectDrawerOpen(false, '[data-testid="chat-workspace-interaction"]')
  })
})
