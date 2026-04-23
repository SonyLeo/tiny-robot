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

  test('tooltip only appears for truncated items after the configured delay', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.hoverNavItemByLabel('Checklist')
    await helper.expectTooltipVisibleForLabel('Checklist', false)
    await page.waitForTimeout(320)
    await helper.expectTooltipVisibleForLabel('Checklist', false)

    await helper.hoverNavItemByLabel('Postmortem draft notes with extended follow-up context')
    await helper.expectTooltipVisibleForLabel('Postmortem draft notes with extended follow-up context', false)
    await page.waitForTimeout(320)
    await helper.expectTooltipVisibleForLabel('Postmortem draft notes with extended follow-up context', true)
  })

  test('focus alone does not show tooltip for truncated items', async ({ page }) => {
    const helper = helperFactory(page)
    const longItemButton = page
      .locator(helper.selectors.contentNavRoot)
      .getByRole('button', { name: /Postmortem draft notes with extended follow-up context/i })
      .first()

    await helper.resetState()
    await longItemButton.focus()
    await helper.expectExpanded(true)
    await page.waitForTimeout(320)
    await helper.expectTooltipVisibleForLabel('Postmortem draft notes with extended follow-up context', false)
  })

  test('hovering a new item clears the previous tooltip even if the old item keeps focus', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.clickNavItemByLabel('Postmortem draft notes with extended follow-up context')
    await helper.hoverNavItemByLabel('Postmortem draft notes with extended follow-up context')
    await page.waitForTimeout(320)
    await helper.expectTooltipVisibleForLabel('Postmortem draft notes with extended follow-up context', true)

    await helper.hoverNavItemByLabel('Checklist')
    await page.waitForTimeout(320)
    await helper.expectTooltipVisibleForLabel('Postmortem draft notes with extended follow-up context', false)
    await expect(
      page.locator(`${helper.selectors.contentNavRoot} .tr-content-nav__list-item.is-tooltip-visible`),
    ).toHaveCount(0)
  })

  test('search query model changes and list can be filtered by assistant reply text', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.setExternalQuery('retry storms')
    await helper.expectQueryValue('retry storms')
    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('Incident timeline planning')
    await expect(page.locator(helper.selectors.contentNavRoot)).not.toContainText('Project kickoff summary')
  })

  test('highlighted item resyncs to the active item after clearing a filtered search query', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.clickNavItemByLabel('Release train dependencies')
    await helper.expectActiveId('turn-5')
    await helper.expectLastEventContains('turn-5')

    await helper.setExternalQuery('retry storms')
    await helper.hoverNav()
    await expect(page.locator(`${helper.selectors.contentNavRoot} [data-item-id="turn-2"]`)).toHaveAttribute(
      'tabindex',
      '0',
    )

    await helper.setExternalQuery('')
    const currentActiveId = ((await page.locator(helper.selectors.activeIdDisplay).textContent()) ?? '').trim()
    await page.locator(helper.selectors.contentNavOverlay).evaluate((el) => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    })

    await helper.expectLastEventContains(currentActiveId)
  })

  test('clicking item scrolls to target content', async ({ page }) => {
    const helper = helperFactory(page)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')
    await helper.expectLastEventContains('turn-5')

    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-5')
  })

  test('clicking item applies and clears the target active class automatically', async ({ page }) => {
    const helper = helperFactory(page)
    const target = page.locator('[data-content-nav-id="turn-5"]').first()

    await helper.resetState()
    await expect(target).not.toHaveClass(/tr-content-nav-target--flash/)

    await helper.clickNavItemByLabel('Release train dependencies')

    await expect(target).toHaveClass(/tr-content-nav-target--flash/)
    await expect
      .poll(async () => (await target.getAttribute('class')) ?? '')
      .not.toContain('tr-content-nav-target--flash')
  })

  test('does not emit duplicate active-id updates when scroll sync keeps the same item active', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.expectActiveId('turn-1')

    const beforeCount = await helper.getActiveUpdateCount()
    await helper.wheelScrollContainer(24)
    await helper.expectActiveId('turn-1')

    await expect.poll(async () => helper.getActiveUpdateCount()).toBe(beforeCount)
  })

  test('falls back to document scrolling when scrollContainer is omitted', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setDocumentScrollMode(true)

    const beforeScrollTop = await helper.getPageScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')

    await helper.expectLastEventContains('turn-5')
    await expect.poll(async () => helper.getPageScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-5')

    await helper.wheelPage(4000)
    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-6')

    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-1')
  })

  test('non-scrollable content keeps the first anchored item active even when a targetless item exists', async ({
    page,
  }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setMissingTargetMode(true)

    await helper.expectItemCount(7)
    await helper.expectActiveId('turn-1')
    await expect(page.locator(helper.selectors.activeIdDisplay)).not.toHaveText('turn-missing')
  })

  test('bubble scene resolves marked box nodes as scroll targets', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)

    const bubbleTarget = page.locator('[data-content-nav-id="turn-5"]').first()
    await expect(bubbleTarget).toHaveClass(/tr-bubble__box/)

    const closestBubbleIsSameNode = await bubbleTarget.evaluate((node) => node.closest('.tr-bubble') === node)
    expect(closestBubbleIsSameNode).toBe(false)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')

    await helper.expectLastEventContains('turn-5')
    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await expect
      .poll(async () => {
        const containerBox = await page.locator(helper.selectors.scrollContainer).boundingBox()
        const targetBox = await bubbleTarget.boundingBox()

        if (!containerBox || !targetBox) {
          return null
        }

        return targetBox.y - containerBox.y
      })
      .toBeGreaterThanOrEqual(0)
  })

  test('bubble scene keeps the clicked turn active when nearby turns are close together', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Security review items')

    await helper.expectLastEventContains('turn-4')
    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-4')
  })

  test('bubble scene keeps the clicked penultimate turn active when the jump lands near the bottom', async ({
    page,
  }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Release train dependencies')

    await helper.expectLastEventContains('turn-5')
    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-5')
  })

  test('bubble scene releases the clicked lock after the user scrolls again', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)

    const beforeScrollTop = await helper.getScrollTop()
    await helper.clickNavItemByLabel('Security review items')

    await helper.expectLastEventContains('turn-4')
    await expect.poll(async () => helper.getScrollTop()).toBeGreaterThan(beforeScrollTop + 50)
    await helper.expectActiveId('turn-4')

    await helper.wheelScrollContainer(1600)
    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-6')
  })

  test('bubble scene still auto-expands on hover when expanded is bound', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)
    await helper.expectExpanded(false)

    await helper.hoverNav()

    await expect.poll(async () => page.locator(helper.selectors.expandedDisplay).textContent()).toBe('true')
  })

  test('bubble scene keeps the current turn active until the next turn reaches the configured offset', async ({
    page,
  }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setBubbleMode(true)

    await page.locator(helper.selectors.scrollContainer).evaluate((container) => {
      const root = container as HTMLElement
      const nextTurn = root.querySelector('[data-content-nav-id="turn-4"]') as HTMLElement | null
      if (!nextTurn) {
        throw new Error('Expected turn-4 target to exist in bubble scene.')
      }

      const targetTop = nextTurn.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
      root.scrollTop = Math.max(0, targetTop - 80)
    })

    await expect.poll(async () => page.locator(helper.selectors.activeIdDisplay).textContent()).toBe('turn-3')
  })

  test('keyboard activation works', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    const beforeScrollTop = await helper.getScrollTop()

    await helper.focusFirstInteractiveInNav()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await expect.poll(async () => page.locator(helper.selectors.lastEventDisplay).textContent()).toMatch(/select:turn-/)
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

  test('shows empty state when the controlled search query has no matches', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setExternalQuery('no-match-keyword')
    await helper.hoverNav()

    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('No matching items')
    await helper.expectQueryValue('no-match-keyword')
  })

  test('treats empty matcher arrays as non-matches instead of blank rows', async ({ page }) => {
    const helper = helperFactory(page)

    await helper.resetState()
    await helper.setEmptyArrayMatcher(true)
    await helper.setExternalQuery('no-match-keyword')
    await helper.hoverNav()

    await expect(page.locator(helper.selectors.contentNavRoot)).toContainText('No matching items')
    await expect(page.locator(`${helper.selectors.contentNavRoot} .tr-content-nav__item`)).toHaveCount(0)
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

  test('keyboard highlight remains focusable when CSS.escape is unavailable', async ({ page }) => {
    const helper = helperFactory(page)

    await page.addInitScript(() => {
      Object.defineProperty(globalThis, 'CSS', {
        value: {},
        configurable: true,
      })
    })
    await helper.gotoDemo()

    await helper.setSpecialIdMode(true)
    await helper.hoverNav()
    await helper.focusFirstNavItem()
    await page.keyboard.press('ArrowDown')

    await expect.poll(async () => helper.getFocusedItemId()).toBe('turn-2["2"]')
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
