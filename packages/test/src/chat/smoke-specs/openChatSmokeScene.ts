import { expect, type Page } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

export type ChatSmokeMode = 'trchat' | 'whitebox' | 'granular'
export type ChatSmokeEntry = 'demo-nav' | 'component-test'

export async function openChatSmokeScene(page: Page, mode: ChatSmokeMode, options: { entry?: ChatSmokeEntry } = {}) {
  const { entry = 'demo-nav' } = options

  await page.goto('/')

  if (entry === 'component-test') {
    await page.locator('nav a[href="/chat"]').click()
    await expect(page.locator('h2')).toContainText('Chat')
  } else {
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
  }

  const helper = createChatTestHelper(page)

  if (mode === 'trchat') {
    await helper.switchToTrChat()
  } else if (mode === 'whitebox') {
    await helper.switchToWhitebox()
  } else {
    await helper.switchToGranular()
  }

  return helper
}
