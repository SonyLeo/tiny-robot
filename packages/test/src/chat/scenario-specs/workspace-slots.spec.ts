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

  test('blackbox workspace slots render custom desktop left and right panels', async ({ page }) => {
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

    await root.locator('.tr-chat-drawer-overlay').click({ force: true })
    await rightPanelToggle.click()
    await expect(root.getByTestId('workspace-mobile-right-override')).toBeVisible()
    await expect(root.getByTestId('workspace-right-override')).toHaveCount(0)
  })
})
