import { expect, type Page } from '@playwright/test'
import { ANCHOR_SELECTORS } from './selectors'

type AnchorPlacement = 'left' | 'right'
type AnchorExpandTrigger = 'hover' | 'manual'

type HorizontalBounds = {
  left: number
  right: number
  width: number
}

type VerticalBounds = {
  top: number
  bottom: number
  height: number
}

async function getBoundingBoxOrThrow(target: ReturnType<Page['locator']>, errorMessage: string) {
  const box = await target.boundingBox()
  if (!box) {
    throw new Error(errorMessage)
  }

  return box
}

export function createAnchorTestHelper(page: Page) {
  const selectors = ANCHOR_SELECTORS

  function getNavButtonByLabel(label: string) {
    return page
      .locator(selectors.anchorRoot)
      .getByRole('button', { name: new RegExp(label, 'i') })
      .first()
  }

  async function readPlacement(): Promise<AnchorPlacement> {
    const rawValue = (await page.locator(selectors.placementDisplay).textContent())?.trim()
    return rawValue === 'left' ? 'left' : 'right'
  }

  async function gotoDemo() {
    await page.goto('/')
    await page.click(selectors.navLink)
    await expect(page.locator(selectors.pageTitle)).toBeVisible()
  }

  async function isAnchorReady() {
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

  async function setBubbleMode(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleBubbleMode)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setDocumentScrollMode(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleDocumentScrollMode)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setMissingTargetMode(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleMissingTargetMode)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setSpecialIdMode(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleSpecialIdMode)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setEmptyArrayMatcher(enabled: boolean) {
    const checkbox = page.locator(selectors.toggleEmptyArrayMatcher)
    const current = await checkbox.isChecked()
    if (current !== enabled) {
      await checkbox.click()
    }
  }

  async function setExpandTrigger(trigger: AnchorExpandTrigger) {
    const selector = trigger === 'hover' ? selectors.expandTriggerHover : selectors.expandTriggerManual
    await page.locator(selector).check()
  }

  async function setExternalQuery(keyword: string) {
    await page.locator(selectors.externalQueryInput).fill(keyword)
  }

  async function setPlacement(placement: AnchorPlacement) {
    const selector = placement === 'left' ? selectors.placementLeft : selectors.placementRight
    await page.locator(selector).check()
    await expect(page.locator(selectors.placementDisplay)).toHaveText(placement)
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

  async function getPageScrollTop() {
    return page.evaluate(() => window.scrollY)
  }

  async function scrollPageToBottom() {
    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
    })
  }

  async function wheelScrollContainer(deltaY: number) {
    const container = page.locator(selectors.scrollContainer)
    const box = await getBoundingBoxOrThrow(
      container,
      'Expected anchor scroll container to be measurable, but no bounding box was returned.',
    )

    await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 120))
    await page.mouse.wheel(0, deltaY)
  }

  async function wheelPage(deltaY: number) {
    await page.mouse.move(640, 360)
    await page.mouse.wheel(0, deltaY)
  }

  async function hoverNav() {
    const overlay = page.locator(selectors.anchorOverlay)
    await overlay.hover()
  }

  async function focusFirstInteractiveInNav() {
    const root = page.locator(selectors.anchorRoot)
    const focusable = root.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first()
    await focusable.focus()
  }

  async function focusFirstNavItem() {
    const firstItem = page.locator(`${selectors.anchorRoot} .tr-anchor__item`).first()
    await expect(firstItem).toBeVisible()
    await firstItem.focus()
  }

  async function getFocusedItemId() {
    return page.evaluate(() => {
      const activeElement = document.activeElement as HTMLElement | null
      return activeElement?.dataset.itemId ?? ''
    })
  }

  async function focusSearchInput() {
    const search = page.locator(selectors.anchorSearch)
    await expect(search).toBeVisible()
    await search.focus()
  }

  async function fillSearchInput(value: string) {
    const search = page.locator(selectors.anchorSearch)
    await expect(search).toBeVisible()
    await search.fill(value)
  }

  async function moveMouseOutsideNav() {
    await page.mouse.move(1, 1)
  }

  async function clickNavItemByLabel(label: string) {
    const root = page.locator(selectors.anchorRoot)

    await readPlacement()
    await hoverNav()

    const button = getNavButtonByLabel(label)
    if (await button.count()) {
      await button.click()
      return
    }

    const regex = new RegExp(label, 'i')
    const link = root.getByRole('link', { name: regex }).first()
    if (await link.count()) {
      await link.click()
      return
    }

    await root.locator('.tr-anchor__item').filter({ hasText: regex }).first().click()
  }

  async function hoverNavItemByLabel(label: string) {
    await hoverNav()

    const button = getNavButtonByLabel(label)
    await expect(button).toBeVisible()
    await button.hover()
  }

  async function expectTooltipVisibleForLabel(label: string, visible: boolean) {
    const listItem = getNavButtonByLabel(label).locator('xpath=..')

    if (visible) {
      await expect(listItem).toHaveClass(/is-tooltip-visible/)
      return
    }

    await expect(listItem).not.toHaveClass(/is-tooltip-visible/)
  }

  async function expectNavVisible(visible: boolean) {
    const root = page.locator(selectors.anchorRoot)
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
      throw new Error('Expected anchor root to be rendered, but it was not found.')
    }
    await expect(root.first()).toBeVisible()
  }

  async function expectExpanded(value: boolean) {
    await expect(page.locator(selectors.expandedDisplay)).toHaveText(String(value))
  }

  async function expectActiveId(expectedId: string) {
    await expect(page.locator(selectors.activeIdDisplay)).toHaveText(expectedId)
  }

  async function getActiveUpdateCount() {
    const rawValue = (await page.locator(selectors.activeUpdateCountDisplay).textContent())?.trim() ?? '0'
    return Number.parseInt(rawValue, 10)
  }

  async function expectQueryValue(expected: string) {
    await expect(page.locator(selectors.queryDisplay)).toHaveText(expected)
  }

  async function expectPlacement(expected: AnchorPlacement) {
    await expect(page.locator(selectors.placementDisplay)).toHaveText(expected)
  }

  async function expectItemCount(expectedCount: number) {
    await expect(page.locator(selectors.itemCountDisplay)).toHaveText(String(expectedCount))
  }

  async function expectLastEventContains(fragment: string) {
    await expect(page.locator(selectors.lastEventDisplay)).toContainText(fragment)
  }

  async function getFirstMarkerCenterX() {
    const marker = page.locator(`${selectors.anchorRoot} .tr-anchor__marker-slot`).first()
    const box = await getBoundingBoxOrThrow(
      marker,
      'Expected first anchor marker slot to be measurable, but no bounding box was returned.',
    )

    return box.x + box.width / 2
  }

  async function getFirstMarkerCenterY() {
    const marker = page.locator(`${selectors.anchorRoot} .tr-anchor__marker-slot`).first()
    const box = await getBoundingBoxOrThrow(
      marker,
      'Expected first anchor marker slot to be measurable, but no bounding box was returned.',
    )

    return box.y + box.height / 2
  }

  async function getOverlayBounds(): Promise<HorizontalBounds> {
    const overlay = page.locator(selectors.anchorOverlay)
    const box = await getBoundingBoxOrThrow(
      overlay,
      'Expected anchor overlay to be measurable, but no bounding box was returned.',
    )

    return {
      left: box.x,
      right: box.x + box.width,
      width: box.width,
    }
  }

  async function moveMouseIntoExpandedPanel() {
    const placement = await readPlacement()
    const overlay = page.locator(selectors.anchorOverlay)
    const box = await getBoundingBoxOrThrow(
      overlay,
      'Expected anchor overlay to be measurable, but no bounding box was returned.',
    )

    const x = placement === 'right' ? box.x + 12 : box.x + box.width - 12
    const y = box.y + Math.min(box.height / 2, 48)

    await page.mouse.move(x, y)
  }

  async function getHostBounds(): Promise<VerticalBounds> {
    const host = page.locator(selectors.anchorHost)
    const box = await getBoundingBoxOrThrow(
      host,
      'Expected anchor host to be measurable, but no bounding box was returned.',
    )

    return {
      top: box.y,
      bottom: box.y + box.height,
      height: box.height,
    }
  }

  async function getScrollContainerBounds(): Promise<VerticalBounds> {
    const container = page.locator(selectors.scrollContainer)
    const box = await getBoundingBoxOrThrow(
      container,
      'Expected anchor scroll container to be measurable, but no bounding box was returned.',
    )

    return {
      top: box.y,
      bottom: box.y + box.height,
      height: box.height,
    }
  }

  return {
    selectors,
    gotoDemo,
    isAnchorReady,
    setBubbleMode,
    setSingleTurnMode,
    setDocumentScrollMode,
    setMissingTargetMode,
    setSpecialIdMode,
    setEmptyArrayMatcher,
    setExpandTrigger,
    setPlacement,
    setExternalQuery,
    resetState,
    getScrollTop,
    scrollToBottom,
    getPageScrollTop,
    scrollPageToBottom,
    wheelScrollContainer,
    wheelPage,
    hoverNav,
    focusFirstInteractiveInNav,
    focusFirstNavItem,
    getFocusedItemId,
    focusSearchInput,
    fillSearchInput,
    moveMouseOutsideNav,
    clickNavItemByLabel,
    hoverNavItemByLabel,
    expectTooltipVisibleForLabel,
    expectNavVisible,
    expectExpanded,
    expectActiveId,
    getActiveUpdateCount,
    expectQueryValue,
    expectPlacement,
    expectItemCount,
    expectLastEventContains,
    getFirstMarkerCenterX,
    getFirstMarkerCenterY,
    getOverlayBounds,
    moveMouseIntoExpandedPanel,
    getHostBounds,
    getScrollContainerBounds,
  }
}
