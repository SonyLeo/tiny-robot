import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat MCP Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=mcp-feature')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-mcp-feature-blackbox"]').waitFor()
  })

  test('blackbox default renderer should render the MCP trigger and open the panel', async ({ page }) => {
    const scene = page.locator('[data-testid="chat-mcp-feature-blackbox"]')
    const root = '[data-testid="chat-mcp-feature-blackbox"] .tr-chat'

    await expect(page.locator(root).locator(helper.selectors.mcpTriggerLabel)).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.mcpTriggerCount)).toContainText('1')
    await helper.openMcpTrigger(root)

    await expect(scene).toContainText('Weather Service')
    await expect(scene).toContainText('Get Weather')
  })

  test('blackbox MCP trigger should remain usable on mobile while keeping the count visible', async ({ page }) => {
    const root = '[data-testid="chat-mcp-feature-blackbox"] .tr-chat'

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    await page.locator('nav').getByRole('link').nth(2).click()
    await page.locator('[data-testid="chat-mcp-feature-blackbox"]').waitFor()

    await expect(page.locator(root).locator(helper.selectors.mcpTrigger)).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.mcpTriggerCount)).toBeVisible()
  })

  test('whitebox sender footer should open the MCP panel through TrMcpTrigger', async ({ page }) => {
    const scene = page.locator('[data-testid="chat-mcp-feature-whitebox"]')
    const root = '[data-testid="chat-mcp-feature-whitebox"] .tr-chat'

    await helper.openMcpTrigger(root)

    await expect(scene).toContainText('Weather Service')
    await expect(scene).toContainText('Get Weather')
  })
})
