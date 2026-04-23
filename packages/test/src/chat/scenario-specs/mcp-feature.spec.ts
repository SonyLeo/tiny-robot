import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat MCP Feature', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=mcp-feature')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-mcp-feature-provider"]').waitFor()
  })

  test('provider footer trigger should render the MCP trigger and open the panel', async ({ page }) => {
    const scene = page.locator('[data-testid="chat-mcp-feature-provider"]')
    const root = '[data-testid="chat-mcp-feature-provider"] .tr-chat'

    await expect(page.locator(root).locator(helper.selectors.mcpTriggerLabel)).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.mcpTriggerCount)).toContainText('1')
    await helper.openMcpTrigger(root)

    await expect(scene).toContainText('Weather Service')
    await expect(scene).toContainText('Get Weather')
  })

  test('provider footer MCP trigger should remain usable on mobile while keeping the count visible', async ({
    page,
  }) => {
    const root = '[data-testid="chat-mcp-feature-provider"] .tr-chat'

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    await page.locator('nav').getByRole('link').nth(2).click()
    await page.locator('[data-testid="chat-mcp-feature-provider"]').waitFor()

    await expect(page.locator(root).locator(helper.selectors.mcpTrigger)).toBeVisible()
    await expect(page.locator(root).locator(helper.selectors.mcpTriggerCount)).toBeVisible()
  })

  test('granular sender footer should open the MCP panel through TrMcpTrigger', async ({ page }) => {
    const scene = page.locator('[data-testid="chat-mcp-feature-granular"]')
    const root = '[data-testid="chat-mcp-feature-granular"] .tr-chat'

    await helper.openMcpTrigger(root)

    await expect(scene).toContainText('Weather Service')
    await expect(scene).toContainText('Get Weather')
  })
})
