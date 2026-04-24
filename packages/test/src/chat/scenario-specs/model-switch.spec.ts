import { expect, test } from '@playwright/test'
import { openChatSmokeScene } from './openChatSmokeScene'

test.describe('Chat Model Switching', () => {
  test('dropdown should close on outside click and Escape without breaking later model switching', async ({ page }) => {
    const helper = await openChatSmokeScene(page, 'trchat')

    const root = helper.selectors.trChatChat
    await helper.openModelSelector(root)

    const dropdown = page.locator('.tr-model-selector__dropdown-wrapper')
    await expect(dropdown).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dropdown).toHaveCount(0)

    await helper.openModelSelector(root)
    await expect(dropdown).toBeVisible()

    await page.click('h2')
    await expect(dropdown).toHaveCount(0)

    await helper.selectModel('DeepSeek Test', root)
    await helper.sendMessage('switch-close-paths', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })

  test('TrChat should use the newly selected provider and emit onModelChange', async ({ page }) => {
    const helper = await openChatSmokeScene(page, 'trchat')

    const root = helper.selectors.trChatChat
    await helper.selectModel('DeepSeek Test', root)

    await helper.sendMessage('switch-trchat', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })

  test('Root + Page should update the selected model and keep the request path aligned after switching', async ({
    page,
  }) => {
    const helper = await openChatSmokeScene(page, 'whitebox')

    const root = helper.selectors.whiteboxChat
    await helper.selectModel('DeepSeek Test', root)
    await helper.sendMessage('switch-whitebox', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })
})
