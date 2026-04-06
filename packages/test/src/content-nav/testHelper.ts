import { expect, type Page } from '@playwright/test'
import { CONTENT_NAV_SELECTORS } from './selectors'

export function createContentNavTestHelper(page: Page) {
  const selectors = CONTENT_NAV_SELECTORS

  async function gotoDemo() {
    await page.goto('/')
    await page.click(selectors.navLink)
    await expect(page.locator(selectors.pageTitle)).toBeVisible()
  }

  async function isContentNavReady() {
    const value = await page.locator(selectors.availability).textContent()
    return (value ?? '').trim() === 'ready'
  }

  async function setSingleTurnMode(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleSingleTurnMode)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setExternalQuery(keyword: string) {
    await page.locator(selectors.externalQueryInput).fill(keyword)
  }

  async function resetState() {
    await page.locator(selectors.resetStateButton).click()
  }

  async function getScrollTop() {
    return page.locator(selectors.scrollContainer).evaluate((el) => (el as HTMLElement).scrollTop)
  }

  async function scrollToBottom() {
    await page
      .locator(selectors.scrollContainer)
      .evaluate((el) => ((el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight))
  }

  async function hoverNav() {
    await page.locator(selectors.contentNavHost).hover({
      position: { x: 264, y: 24 },
    })
  }

  async function focusFirstInteractiveInNav() {
    const root = page.locator(selectors.contentNavRoot)
    const focusable = root.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first()
    await focusable.focus()
  }

  async function clickNavItemByLabel(label: string) {
    const root = page.locator(selectors.contentNavRoot)
    const regex = new RegExp(label, 'i')

    await hoverNav()

    const button = root.getByRole('button', { name: regex }).first()
    if (await button.count()) {
      await button.click()
      return
    }

    const link = root.getByRole('link', { name: regex }).first()
    if (await link.count()) {
      await link.click()
      return
    }

    await root.locator('.tr-content-nav__item').filter({ hasText: regex }).first().click()
  }

  async function expectNavVisible(visible: boolean) {
    const root = page.locator(selectors.contentNavRoot)
    const count = await root.count()

    if (!visible) {
      if (count === 0) {
        await expect(root).toHaveCount(0)
      } else {
        await expect(root.first()).toBeHidden()
      }
      return
    }

    if (count === 0) {
      throw new Error('Expected content nav root to be rendered, but it was not found.')
    }
    await expect(root.first()).toBeVisible()
  }

  async function expectExpanded(value: boolean) {
    await expect(page.locator(selectors.expandedDisplay)).toHaveText(String(value))
  }

  async function expectActiveId(expectedId: string) {
    await expect(page.locator(selectors.activeIdDisplay)).toHaveText(expectedId)
  }

  async function expectQueryValue(expected: string) {
    await expect(page.locator(selectors.queryDisplay)).toHaveText(expected)
  }

  async function expectItemCount(expectedCount: number) {
    await expect(page.locator(selectors.itemCountDisplay)).toHaveText(String(expectedCount))
  }

  async function expectLastEventContains(fragment: string) {
    await expect(page.locator(selectors.lastEventDisplay)).toContainText(fragment)
  }

  return {
    selectors,
    gotoDemo,
    isContentNavReady,
    setSingleTurnMode,
    setExternalQuery,
    resetState,
    getScrollTop,
    scrollToBottom,
    hoverNav,
    focusFirstInteractiveInNav,
    clickNavItemByLabel,
    expectNavVisible,
    expectExpanded,
    expectActiveId,
    expectQueryValue,
    expectItemCount,
    expectLastEventContains,
  }
}
