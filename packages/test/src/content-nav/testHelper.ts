import { expect, type Page } from '@playwright/test'
import { CONTENT_NAV_SELECTORS } from './selectors'

type ContentNavPlacement = 'left' | 'right'

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

export function createContentNavTestHelper(page: Page) {
  const selectors = CONTENT_NAV_SELECTORS

  async function readPlacement(): Promise<ContentNavPlacement> {
    const rawValue = (await page.locator(selectors.placementDisplay).textContent())?.trim()
    return rawValue === 'left' ? 'left' : 'right'
  }

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

  async function setPlacement(placement: ContentNavPlacement) {
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

  async function hoverNav() {
    const overlay = page.locator(selectors.contentNavOverlay)
    await overlay.hover()
  }

  async function focusFirstInteractiveInNav() {
    const root = page.locator(selectors.contentNavRoot)
    const focusable = root.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first()
    await focusable.focus()
  }

  async function clickNavItemByLabel(label: string) {
    const root = page.locator(selectors.contentNavRoot)
    const regex = new RegExp(label, 'i')

    await readPlacement()
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

  async function expectPlacement(expected: ContentNavPlacement) {
    await expect(page.locator(selectors.placementDisplay)).toHaveText(expected)
  }

  async function expectItemCount(expectedCount: number) {
    await expect(page.locator(selectors.itemCountDisplay)).toHaveText(String(expectedCount))
  }

  async function expectLastEventContains(fragment: string) {
    await expect(page.locator(selectors.lastEventDisplay)).toContainText(fragment)
  }

  async function getFirstMarkerCenterX() {
    const marker = page.locator(`${selectors.contentNavRoot} .tr-content-nav__marker-slot`).first()
    const box = await getBoundingBoxOrThrow(
      marker,
      'Expected first content-nav marker slot to be measurable, but no bounding box was returned.',
    )

    return box.x + box.width / 2
  }

  async function getFirstMarkerCenterY() {
    const marker = page.locator(`${selectors.contentNavRoot} .tr-content-nav__marker-slot`).first()
    const box = await getBoundingBoxOrThrow(
      marker,
      'Expected first content-nav marker slot to be measurable, but no bounding box was returned.',
    )

    return box.y + box.height / 2
  }

  async function getOverlayBounds(): Promise<HorizontalBounds> {
    const overlay = page.locator(selectors.contentNavOverlay)
    const box = await getBoundingBoxOrThrow(
      overlay,
      'Expected content-nav overlay to be measurable, but no bounding box was returned.',
    )

    return {
      left: box.x,
      right: box.x + box.width,
      width: box.width,
    }
  }

  async function getHostBounds(): Promise<VerticalBounds> {
    const host = page.locator(selectors.contentNavHost)
    const box = await getBoundingBoxOrThrow(
      host,
      'Expected content-nav host to be measurable, but no bounding box was returned.',
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
      'Expected content-nav scroll container to be measurable, but no bounding box was returned.',
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
    isContentNavReady,
    setSingleTurnMode,
    setPlacement,
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
    expectPlacement,
    expectItemCount,
    expectLastEventContains,
    getFirstMarkerCenterX,
    getFirstMarkerCenterY,
    getOverlayBounds,
    getHostBounds,
    getScrollContainerBounds,
  }
}
