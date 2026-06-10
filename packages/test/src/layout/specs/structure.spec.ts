import { expect, test } from '../helpers'

test.describe('Layout 组件测试 - 结构', () => {
  test('Slots: header / footer / left-aside / right-aside - 应正确渲染', async ({ layout }) => {
    await expect(layout.page.getByTestId('layout-header-slot')).toBeVisible()
    await expect(layout.page.getByTestId('layout-footer-slot')).toBeVisible()
    await expect(layout.page.getByTestId('left-aside-slot')).toBeVisible()
    await expect(layout.page.getByTestId('right-aside-slot')).toBeHidden()

    await layout.toggleAside('right')
    await expect(layout.page.getByTestId('right-aside-slot')).toBeVisible()
  })

  test('Stable structure - 应能稳定识别关键区域和侧栏状态', async ({ layout }) => {
    await expect(layout.surface).toBeVisible()
    await expect(layout.main).toBeVisible()
    await expect(layout.getAside('left')).toHaveClass(/tr-layout__aside--left/)
    await expect(layout.getAside('right')).toHaveClass(/tr-layout__aside--right/)
    await expect(layout.getAsideContent('left')).toHaveClass(/tr-layout-aside--left/)
    await expect(layout.getAsideContent('right')).toHaveClass(/tr-layout-aside--right/)
    await layout.expectAsideState('left', 'open')
    await layout.expectAsideState('right', 'closed')
  })

  test('Layout.AsideToggle slot - 应能拿到 isOpen', async ({ layout }) => {
    await expect(layout.page.getByTestId('left-toggle-slot')).toHaveText('left-open')
    await layout.page.getByTestId('left-aside-toggle').click()
    await expect(layout.page.getByTestId('left-toggle-slot')).toHaveText('left-close')
  })

  test('Props: ariaLabel - right toggle 应使用默认 aria-label', async ({ layout }) => {
    await expect(layout.page.getByTestId('right-aside-toggle')).toHaveAttribute('aria-label', 'Toggle right panel')
  })

  test('Fallthrough attrs: class / id / data-* - 应始终落在 surface', async ({ layout }) => {
    const { surface } = layout

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)

    await layout.setMode('floating')

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)
  })

  test('Layout.Aside attrs: 自定义 class 应落在 aside-content，而不是外层 shell', async ({ layout }) => {
    const leftAside = layout.getAside('left')
    const leftAsideContent = layout.getAsideContent('left')
    const rightAside = layout.getAside('right')
    const rightAsideContent = layout.getAsideContent('right')

    await expect(leftAside).not.toHaveClass(/layout-demo__aside--left/)
    await expect(leftAsideContent).toHaveClass(/layout-demo__aside--left/)
    await expect(rightAside).not.toHaveClass(/layout-demo__aside--right/)
    await expect(rightAsideContent).toHaveClass(/layout-demo__aside--right/)
  })

  test('Conditional slots: empty header / left-aside - should not keep empty shell or resize trigger', async ({
    layout,
  }) => {
    await layout.emptyConditionalSlots()

    await expect(layout.page.locator('.tr-layout__header-shell')).toHaveCount(0)
    await expect(layout.getAside('left')).toHaveClass(/tr-layout__aside--hidden/)
    await expect(layout.getResizeTrigger('left')).toHaveCount(0)
  })
})
