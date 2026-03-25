import { expect, test } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

test.describe('Chat Model Switching', () => {
  test('dropdown should close on outside click and Escape without breaking later model switching', async ({ page }) => {
    await page.goto('/')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')

    const helper = createChatTestHelper(page)
    await helper.switchToBlackbox()

    const root = helper.selectors.blackboxChat
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

  test('blackbox should use the newly selected provider and emit onModelChange', async ({ page }) => {
    await page.goto('/')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')

    const helper = createChatTestHelper(page)
    await helper.switchToBlackbox()

    const root = helper.selectors.blackboxChat
    await helper.selectModel('DeepSeek Test', root)

    const modelLog = page.getByTestId('model-change-log')
    await expect(modelLog).toContainText('model:deepseek-test')

    await helper.sendMessage('switch-blackbox', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })

  test('whitebox should update the injected chatKit provider after model switching', async ({ page }) => {
    await page.goto('/')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')

    const helper = createChatTestHelper(page)
    await helper.switchToWhitebox()

    const root = helper.selectors.whiteboxChat
    await helper.selectModel('DeepSeek Test', root)
    await helper.sendMessage('switch-whitebox', root)
    await helper.waitForStreamingComplete(root)

    const contents = page.locator(root).locator(helper.selectors.bubbleContent)
    await expect(contents.last()).toContainText('[deepseek:deepseek-test]')
  })
})
