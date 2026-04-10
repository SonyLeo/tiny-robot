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

  test('keeps rendering when only one item remains', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.expectItemCount(6)
    await helper.expectNavVisible(true)

    await helper.setSingleTurnMode(true)
    await helper.expectItemCount(1)
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

  test('manual expand trigger does not auto-expand on hover', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setExpandTrigger('manual')
    const collapsed = await helper.getOverlayBounds()

    await helper.hoverNav()

    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeLessThanOrEqual(collapsed.width)
    await helper.expectExpanded(false)
  })

  test('hovered rail stays expanded while the pointer moves into the expanded panel', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.expectExpanded(false)
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(200)

    await helper.moveMouseIntoExpandedPanel()

    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(200)
  })

  test('query model changes and list can be filtered by assistant reply text', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.setExternalQuery('retry storms')
    await helper.expectQueryValue('retry storms')
    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('Incident timeline planning')
    await expect(page.locator(helper.selectors.contentNavRoot)).not.toContainText('Project kickoff summary')
  })

  test('clicking item scrolls to target content', async ({ page }) => {
    const helper = helperFactory(page)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')
    await helper.expectLastEventContains('turn-5')

    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-5')
  })

  test('bubble anchors attach to the real user bubble and receive jump feedback', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.clickNavItemByLabel('Release train dependencies')

    const anchoredBubble = helper.getAnchoredBubble('turn-5')
    await expect(anchoredBubble).toHaveCount(1)
    await expect(anchoredBubble).toHaveAttribute('data-role', 'user')
    await expect(anchoredBubble).toHaveClass(/demo-user-bubble-flash/)
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

  test('search input keeps native keyboard behavior', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    const beforeScrollTop = await helper.getScrollTop()

    await helper.hoverNav()
    await helper.focusSearchInput()
    await helper.fillSearchInput('timeline')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await helper.expectQueryValue('timeline')
    await expect(page.locator(helper.selectors.lastEventDisplay)).toHaveText('none')
    await expect.poll(async () => helper.getScrollTop()).toBe(beforeScrollTop)
  })

  test('shows empty state when the controlled query has no matches', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setExternalQuery('no-match-keyword')
    await helper.hoverNav()

    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('No matching items')
    await helper.expectQueryValue('no-match-keyword')
  })

  test('mouseleave does not collapse while focus stays inside nav', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.hoverNav()
    await helper.focusSearchInput()
    await helper.moveMouseOutsideNav()

    await helper.expectExpanded(true)
  })

  test('escape collapses the rail from keyboard focus', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await helper.focusFirstNavItem()
    await page.keyboard.press('Escape')

    await expect.poll(async () => page.locator(helper.selectors.expandedDisplay).textContent()).toBe('false')
  })

  test('active item updates while scrolling', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.expectActiveId('turn-1')
    await helper.scrollToBottom()

    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-6')
  })

  test('controlled activeId falls back to the first visible item when the selected item is removed', async ({
    page,
  }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.clickNavItemByLabel('Release train dependencies')
    await helper.expectActiveId('turn-5')

    await helper.setSingleTurnMode(true)

    await helper.expectItemCount(1)
    await helper.expectActiveId('turn-1')
    await helper.expectNavVisible(true)
  })

  test('marker anchor stays stable before and after expand for both placements', async ({ page }) => {
    const helper = helperFactory(page)
    const tolerance = 2

    await helper.resetState()
    await helper.setPlacement('right')
    await helper.expectPlacement('right')
    const collapsedRightX = await helper.getFirstMarkerCenterX()
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(200)
    const expandedRightX = await helper.getFirstMarkerCenterX()
    expect(Math.abs(expandedRightX - collapsedRightX)).toBeLessThanOrEqual(tolerance)

    await helper.resetState()
    await helper.setPlacement('left')
    await helper.expectPlacement('left')
    const collapsedLeftX = await helper.getFirstMarkerCenterX()
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(200)
    const expandedLeftX = await helper.getFirstMarkerCenterX()
    expect(Math.abs(expandedLeftX - collapsedLeftX)).toBeLessThanOrEqual(tolerance)
  })

  test('floating nav is vertically centered within the scroll container', async ({ page }) => {
    const helper = helperFactory(page)
    const tolerance = 2

    await helper.resetState()
    const hostBounds = await helper.getHostBounds()
    const containerBounds = await helper.getScrollContainerBounds()

    const hostCenterY = hostBounds.top + hostBounds.height / 2
    const containerCenterY = containerBounds.top + containerBounds.height / 2

    expect(Math.abs(hostCenterY - containerCenterY)).toBeLessThanOrEqual(tolerance)
  })

  test('floating panel expands away from the fixed marker anchor on both sides', async ({ page }) => {
    const helper = helperFactory(page)
    const tolerance = 1

    await helper.resetState()
    await helper.setPlacement('right')
    const collapsedRight = await helper.getOverlayBounds()
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(collapsedRight.width + 20)
    const expandedRight = await helper.getOverlayBounds()
    expect(Math.abs(expandedRight.right - collapsedRight.right)).toBeLessThanOrEqual(tolerance)
    expect(expandedRight.left).toBeLessThan(collapsedRight.left)
    expect(expandedRight.width).toBeGreaterThan(collapsedRight.width)

    await helper.resetState()
    await helper.setPlacement('left')
    const collapsedLeft = await helper.getOverlayBounds()
    await helper.hoverNav()
    await helper.expectExpanded(true)
    await expect.poll(async () => (await helper.getOverlayBounds()).width).toBeGreaterThan(collapsedLeft.width + 20)
    const expandedLeft = await helper.getOverlayBounds()
    expect(Math.abs(expandedLeft.left - collapsedLeft.left)).toBeLessThanOrEqual(tolerance)
    expect(expandedLeft.right).toBeGreaterThan(collapsedLeft.right)
    expect(expandedLeft.width).toBeGreaterThan(collapsedLeft.width)
  })
})
