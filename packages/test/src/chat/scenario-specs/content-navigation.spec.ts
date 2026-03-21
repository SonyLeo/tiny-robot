import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Content Navigation (P5-C)', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=content-navigation')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="content-navigation-shell"]').waitFor({ state: 'visible' })

    const root = '[data-testid="content-navigation-shell"] .tr-chat'
    await helper.sendMessage('Create the navigation map.', root)
    await expect(page.locator(root).locator(helper.selectors.bubbleItem)).toHaveCount(8)
    await helper.waitForStreamingComplete(root)
  })

  test('should render a workspace-attached turn navigation host with active state', async ({ page }) => {
    const host = page.locator('[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-host"]')
    const items = page.locator('[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"]')
    const activeItem = page.locator(
      '[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"][data-active="true"]',
    )

    await expect(host).toBeVisible()
    await expect(items).toHaveCount(4)
    await expect(activeItem).toHaveCount(1)
    await expect(activeItem).not.toBeEmpty()
  })

  test('should render an assistant outline overlay for the active assistant response', async ({ page }) => {
    const rail = page.locator('[data-testid="assistant-outline-rail"]')
    const items = page.locator('[data-testid="assistant-outline-item"]')
    const markers = page.locator('[data-testid="assistant-outline-marker"]')

    await expect(rail).toBeVisible()
    await expect(rail).toHaveAttribute('role', 'navigation')
    await expect(rail).toHaveAttribute('aria-label', 'Assistant response outline')
    await expect(markers).toHaveCount(5)
    await expect(items).toHaveCount(5)
    await expect(items.nth(0)).toContainText('Plan overview')
    await expect(items.nth(1)).toContainText('Stabilize the shell container')
    await expect(items.nth(0)).toHaveAttribute('aria-label', /Jump to section/)
  })

  test('should expand the right rail into a lightweight panel on hover', async ({ page }) => {
    const host = page.locator('[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-host"]')
    const activeMarker = page.locator(
      '[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"][data-active="true"] .tr-content-navigation-host__marker',
    )
    const markerBefore = await activeMarker.boundingBox()

    await host.hover()

    await expect(host).toHaveAttribute('data-expanded', 'true')
    await expect(host.locator('[data-testid="content-navigation-search"]')).toBeVisible()

    const markerAfter = await activeMarker.boundingBox()

    expect(markerBefore).not.toBeNull()
    expect(markerAfter).not.toBeNull()
    expect(Math.abs((markerAfter?.x ?? 0) - (markerBefore?.x ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs((markerAfter?.y ?? 0) - (markerBefore?.y ?? 0))).toBeLessThanOrEqual(1)
  })

  test('should update the active turn when a navigation item is selected', async ({ page }) => {
    const items = page.locator('[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"]')

    await items.nth(2).click()

    await expect(
      page.locator(
        '[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"][data-active="true"]',
      ),
    ).toContainText('Call out the rollout risks for content navigation phase one.')
    await expect(page.locator('[data-testid="content-navigation-active"]')).toContainText(
      'Active turn: Call out the rollout risks for content navigation phase',
    )
  })

  test('should highlight only the user bubble box when a navigation item is selected', async ({ page }) => {
    const items = page.locator('[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"]')
    const targetBubble = page.locator('.tr-bubble[data-role="user"]').nth(2)
    const targetBox = targetBubble.locator('.tr-bubble__box')

    await items.nth(2).click()

    await expect(targetBubble).not.toHaveClass(/is-navigation-highlight/)
    await expect(targetBox).toHaveClass(/is-navigation-highlight/)
  })

  test('should keep navigation available after sending another turn and toggling full width', async ({ page }) => {
    const root = '[data-testid="content-navigation-shell"] .tr-chat'

    await page.locator('[data-testid="toggle-content-navigation-width"]').click()
    await expect(page.locator('[data-testid="content-navigation-shell"]')).toHaveAttribute('data-full-width', 'true')
    const bodyPadding = await page
      .locator('[data-testid="content-navigation-shell"] .tr-chat__body')
      .evaluate((node) => {
        const style = window.getComputedStyle(node)
        return {
          left: style.paddingLeft,
          right: style.paddingRight,
        }
      })

    expect(bodyPadding.left).toBe(bodyPadding.right)

    await helper.sendMessage('Add one more rollout note.', root)
    await expect(page.locator(root).locator(helper.selectors.bubbleItem)).toHaveCount(10)

    const turnItems = page.locator(
      '[data-testid="conversation-turn-navigation"] [data-testid="content-navigation-item"]',
    )

    await expect(turnItems).toHaveCount(5)
    await expect(turnItems.nth(4)).toContainText('Add one more rollout note.')

    await expect(page.locator('[data-testid="assistant-outline-item"]')).toHaveCount(5)
  })
})
