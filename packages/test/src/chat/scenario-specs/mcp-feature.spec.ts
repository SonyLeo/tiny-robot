import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Chat MCP Feature', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=mcp-feature')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="chat-mcp-feature-blackbox"]').waitFor()
  })

  test('blackbox mcp feature should inject the manager into TrChatMcpPanel', async ({ page }) => {
    const root = page.locator('[data-testid="chat-mcp-feature-blackbox"]')

    await page.getByTestId('mcp-feature-blackbox-open').click()

    await expect(root).toContainText('Weather Service')
    await expect(root).toContainText('Get Weather')
  })

  test('whitebox preset slices should inject the mcp manager into TrChat.Root', async ({ page }) => {
    const root = page.locator('[data-testid="chat-mcp-feature-whitebox"]')

    await page.getByTestId('mcp-feature-whitebox-open').click()

    await expect(root).toContainText('Weather Service')
    await expect(root).toContainText('Get Weather')
  })
})
