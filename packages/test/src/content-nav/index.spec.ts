import { expect, test } from '@playwright/test'
import { createContentNavTestHelper } from './testHelper'

test.describe('ContentNav component e2e', () => {
  test.describe.configure({ mode: 'serial' })

  const helperFactory = createContentNavTestHelper

  test.beforeEach(async ({ page }) => {
    const helper = helperFactory(page)
    await helper.gotoDemo()

    const ready = await helper.isContentNavReady()
    test.skip(!ready, 'TrContentNav is not exported yet in @opentiny/tiny-robot.')
  })

  test('renders only when item threshold is met', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.expectItemCount(6)
    await helper.expectNavVisible(true)

    await helper.setSingleTurnMode(true)
    await helper.expectItemCount(1)
    await helper.expectNavVisible(false)

    await helper.setSingleTurnMode(false)
    await helper.expectItemCount(6)
    await helper.expectNavVisible(true)
  })

  test('hover/focus expands rail', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.expectExpanded(false)
    await helper.hoverNav()
    await expect.poll(async () => page.locator(helper.selectors.expandedDisplay).textContent()).toBe('true')

    await helper.resetState()
    await helper.expectExpanded(false)
    await helper.focusFirstInteractiveInNav()
    await expect.poll(async () => page.locator(helper.selectors.expandedDisplay).textContent()).toBe('true')
  })

  test('query model changes and list can be filtered', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.setExternalQuery('timeline')
    await helper.expectQueryValue('timeline')
    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('Incident timeline planning')
    await expect(page.locator(helper.selectors.contentNavRoot)).not.toContainText('Security review items')
  })

  test('clicking item scrolls to target content', async ({ page }) => {
    const helper = helperFactory(page)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')
    await helper.expectLastEventContains('turn-5')

    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-5')
  })

  test('keyboard activation works', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    const beforeScrollTop = await helper.getScrollTop()

    await helper.focusFirstInteractiveInNav()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await expect
      .poll(async () => page.locator(helper.selectors.lastEventDisplay).textContent())
      .toMatch(/(select|activate):turn-/)
    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop)
  })

  test('active item updates while scrolling', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.expectActiveId('turn-1')
    await helper.scrollToBottom()

    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-6')
  })
})
