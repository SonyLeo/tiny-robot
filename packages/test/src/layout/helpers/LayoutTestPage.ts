import { expect, type Locator, type Page } from '@playwright/test'
import { layoutSelectors } from '../selectors'

type ScopedTarget = Page | Locator

export type LayoutPlacement = 'left' | 'right'
export type LayoutMode = 'normal' | 'floating'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutCollapseEffect = 'overlay' | 'slide'
export type LayoutAsideState = 'open' | 'rail' | 'closed'
export type LayoutEventPhase = 'start' | 'progress' | 'end'

export interface LayoutAsideResizeLogEntry {
  phase: LayoutEventPhase
  placement: LayoutPlacement
  width: number
}

export interface LayoutFloatingDragLogEntry {
  phase: LayoutEventPhase
  x: number
  y: number
}

export interface LayoutFloatingResizeLogEntry {
  phase: LayoutEventPhase
  edge: LayoutPlacement
  width: number
}

export interface LayoutHarnessSnapshot {
  metrics: {
    leftResizeStart: number
    leftResizeEnd: number
    rightResizeStart: number
    rightResizeEnd: number
    floatingDragStart: number
    floatingDrag: number
    floatingDragEnd: number
    floatingLeftResizeStart: number
    floatingLeftResizeEnd: number
    floatingRightResizeStart: number
    floatingRightResizeEnd: number
    leftToggleActions: number
    rightToggleActions: number
    modeToggleActions: number
  }
  widths: {
    left: number
    right: number
    floating: number
  }
  messagesCount: number
  logs: {
    asideResize: LayoutAsideResizeLogEntry[]
    floatingDrag: LayoutFloatingDragLogEntry[]
    floatingResize: LayoutFloatingResizeLogEntry[]
  }
}

function within(scope: ScopedTarget, selector: string): Locator {
  return scope.locator(selector)
}

function isPage(scope: ScopedTarget): scope is Page {
  return 'goto' in scope
}

export class LayoutTestPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get surface() {
    return this.page.locator(layoutSelectors.surface)
  }

  get surfaceHost() {
    return this.page.locator(layoutSelectors.surfaceHost)
  }

  get root() {
    return this.page.locator(layoutSelectors.root)
  }

  get main() {
    return this.page.locator(layoutSelectors.main)
  }

  get scrollHost() {
    return this.page.locator(layoutSelectors.scrollHost)
  }

  get scrollbar() {
    return this.page.locator(layoutSelectors.scrollbar)
  }

  get scrollbarThumb() {
    return this.page.locator(layoutSelectors.scrollbarThumb)
  }

  get backdrop() {
    return this.page.locator(layoutSelectors.backdrop)
  }

  get blockedAsideFixture() {
    return this.page.getByTestId('blocked-aside-fixture')
  }

  get uncontrolledAsideFixture() {
    return this.page.getByTestId('uncontrolled-aside-fixture')
  }

  get drawerAsideFixture() {
    return this.page.getByTestId('drawer-aside-fixture')
  }

  get blockedFloatingSurface() {
    return this.page.locator('#blocked-floating-surface')
  }

  get uncontrolledFloatingSurface() {
    return this.page.locator('#uncontrolled-floating-surface')
  }

  async open() {
    await this.page.goto('/')
    await this.page.click('text=Layout 组件')
    await expect(this.page.getByRole('heading', { level: 2, name: 'Layout 组件测试' })).toBeVisible()
  }

  getAside(placement: LayoutPlacement, scope: ScopedTarget = this.page) {
    return within(scope, placement === 'left' ? layoutSelectors.leftAside : layoutSelectors.rightAside)
  }

  getAsideContent(placement: LayoutPlacement, scope: ScopedTarget = this.page) {
    return within(scope, placement === 'left' ? layoutSelectors.leftAsideContent : layoutSelectors.rightAsideContent)
  }

  getResizeTrigger(placement: LayoutPlacement, scope: ScopedTarget = this.page) {
    return within(scope, placement === 'left' ? layoutSelectors.leftResizeTrigger : layoutSelectors.rightResizeTrigger)
  }

  getSurfaceResizeTrigger(edge: LayoutPlacement, scope: ScopedTarget = this.page) {
    return within(
      scope,
      edge === 'left' ? layoutSelectors.leftSurfaceResizeTrigger : layoutSelectors.rightSurfaceResizeTrigger,
    )
  }

  getSurfaceDragBar(scope: ScopedTarget = this.page) {
    return within(scope, layoutSelectors.surfaceDragBar)
  }

  getBackdrop(scope: ScopedTarget = this.page) {
    return within(scope, layoutSelectors.backdrop)
  }

  async showAsideFixtures() {
    await this.page.getByTestId('show-aside-state-fixtures-btn').click()
    await expect(this.blockedAsideFixture).toBeVisible()
    await expect(this.uncontrolledAsideFixture).toBeVisible()
    await expect(this.drawerAsideFixture).toBeVisible()
  }

  async showFloatingFixtures() {
    await this.page.getByTestId('show-floating-state-fixtures-btn').click()
    await expect(this.blockedFloatingSurface).toBeVisible()
    await expect(this.uncontrolledFloatingSurface).toBeVisible()
  }

  async showCssVarFixtures() {
    await this.page.getByTestId('show-css-var-fixtures-btn').click()
    await expect(this.page.getByTestId('css-vars-normal-surface')).toBeVisible()
  }

  async setMode(mode: LayoutMode) {
    await this.page.getByTestId(`mode-${mode}-btn`).click()
  }

  async setAsideMode(placement: LayoutPlacement, mode: LayoutAsideMode) {
    await this.page.getByTestId(`${placement}-mode-${mode}-btn`).click()
  }

  async toggleAside(placement: LayoutPlacement) {
    await this.page.getByTestId(`${placement}-toggle-btn`).click()
  }

  async collapseAside(placement: LayoutPlacement) {
    await this.page.getByTestId(`${placement}-collapse-btn`).click()
  }

  async setCollapseEffect(placement: LayoutPlacement, effect: LayoutCollapseEffect) {
    await this.page.getByTestId(`${placement}-effect-${effect}-btn`).click()
  }

  async disableAsideResizable(placement: LayoutPlacement) {
    await this.page.getByTestId(`${placement}-resizable-off-btn`).click()
  }

  async setLeftRailWidthZero() {
    await this.page.getByTestId('left-rail-width-zero-btn').click()
  }

  async appendMessages() {
    await this.page.getByTestId('append-messages-btn').click()
  }

  async emptyConditionalSlots() {
    await this.page.getByTestId('conditional-slots-empty-btn').click()
  }

  async disableFloatingResizable() {
    await this.page.getByTestId('floating-resizable-off-btn').click()
  }

  async disableFloatingDraggable() {
    await this.page.getByTestId('floating-draggable-off-btn').click()
  }

  async resetFloating() {
    await this.page.getByTestId('reset-floating-btn').click()
  }

  async expectSurfaceMode(mode: LayoutMode, scope: ScopedTarget = this.page) {
    const target = isPage(scope) ? within(scope, layoutSelectors.surface) : scope
    await expect(target).toHaveAttribute('data-mode', mode)
  }

  async expectAsideMode(placement: LayoutPlacement, mode: LayoutAsideMode, scope: ScopedTarget = this.page) {
    await expect(this.getAside(placement, scope)).toHaveAttribute('data-mode', mode)
  }

  async expectAsideState(placement: LayoutPlacement, state: LayoutAsideState, scope: ScopedTarget = this.page) {
    await expect(this.getAside(placement, scope)).toHaveAttribute('data-state', state)
  }

  async expectCollapseEffect(
    placement: LayoutPlacement,
    effect: LayoutCollapseEffect,
    scope: ScopedTarget = this.page,
  ) {
    await expect(this.getAsideContent(placement, scope)).toHaveAttribute('data-collapse-effect', effect)
  }

  async expectBackdropState(state: 'open' | 'closed', scope: ScopedTarget = this.page) {
    await expect(this.getBackdrop(scope)).toHaveAttribute('data-state', state)
  }

  async readHarness() {
    await expect.poll(async () => this.page.evaluate(() => Boolean(window.__TR_LAYOUT_HARNESS__))).toBe(true)
    return this.page.evaluate(() => window.__TR_LAYOUT_HARNESS__!) as Promise<LayoutHarnessSnapshot>
  }

  async getBox(locator: Locator) {
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing bounding box')
    }

    return box
  }

  async getWidth(locator: Locator) {
    const box = await this.getBox(locator)
    return box.width
  }

  async dragSurface(deltaX: number, deltaY: number, scope: ScopedTarget = this.page) {
    await this.dragBy(this.getSurfaceDragBar(scope), deltaX, deltaY)
  }

  async resizeSurface(edge: LayoutPlacement, deltaX: number, scope: ScopedTarget = this.page) {
    await this.dragBy(this.getSurfaceResizeTrigger(edge, scope), deltaX, 0)
  }

  async resizeAside(placement: LayoutPlacement, deltaX: number, scope: ScopedTarget = this.page) {
    await this.dragResizeHandle(this.getResizeTrigger(placement, scope), placement, deltaX)
  }

  async dragBy(locator: Locator, deltaX: number, deltaY = 0) {
    await expect(locator).toBeVisible()
    await locator.hover()
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing drag target')
    }

    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 20 })
    await this.page.mouse.up()
  }

  async dragResizeHandle(locator: Locator, side: LayoutPlacement, deltaX: number) {
    await expect(locator).toBeVisible()
    await locator.hover()
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing resize handle')
    }

    const startX = side === 'left' ? box.x + box.width - 1 : box.x + 1
    const startY = box.y + box.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY, { steps: 24 })
    await this.page.mouse.up()
  }
}
