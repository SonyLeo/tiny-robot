import { expect, test } from '../helpers'

test.describe('Layout 组件测试 - Floating', () => {
  test('Props: mode - 应支持 normal 与 floating 切换', async ({ layout }) => {
    await layout.setMode('floating')
    let harness = await layout.readHarness()
    expect(harness.metrics.modeToggleActions).toBe(1)
    await layout.expectSurfaceMode('floating')

    await layout.setMode('normal')
    harness = await layout.readHarness()
    expect(harness.metrics.modeToggleActions).toBe(2)
    await layout.expectSurfaceMode('normal')
  })

  test('Props: draggable - floating 拖拽应更新位置', async ({ layout }) => {
    await layout.setMode('floating')
    const before = await layout.getBox(layout.surface)

    await layout.dragSurface(80, 40)
    const after = await layout.getBox(layout.surface)

    expect(after.x).toBeGreaterThan(before.x)
    expect(after.y).toBeGreaterThan(before.y)
  })

  test('Events: floating-drag* - 拖拽应公开三阶段事件，并保证 end 与最后一次 progress 对齐', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.dragSurface(80, 40)

    const harness = await layout.readHarness()
    const phases = harness.logs.floatingDrag.map((entry) => entry.phase)
    const progressLogs = harness.logs.floatingDrag.filter((entry) => entry.phase === 'progress')
    const endLog = harness.logs.floatingDrag.at(-1)

    expect(phases[0]).toBe('start')
    expect(progressLogs.length).toBeGreaterThan(0)
    expect(endLog?.phase).toBe('end')
    expect(harness.metrics.floatingDragStart).toBe(1)
    expect(harness.metrics.floatingDragEnd).toBe(1)
    expect(harness.metrics.floatingDrag).toBeGreaterThan(0)
    expect(endLog?.x).toBe(progressLogs.at(-1)?.x)
    expect(endLog?.y).toBe(progressLogs.at(-1)?.y)
  })

  test('Props: draggable=false - drag bar 不应再移动 surface', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.disableFloatingDraggable()

    const before = await layout.getBox(layout.surface)
    await layout.dragSurface(80, 0)
    const after = await layout.getBox(layout.surface)

    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
  })

  test('Props: resizable / floating-resize* - 左右改宽应生效，并保证 end 与最后一次 progress 对齐', async ({
    layout,
  }) => {
    await layout.setMode('floating')

    const before = (await layout.readHarness()).widths.floating
    await layout.resizeSurface('right', 80)

    let harness = await layout.readHarness()
    const rightLogs = harness.logs.floatingResize.filter((entry) => entry.edge === 'right')
    const rightProgressLogs = rightLogs.filter((entry) => entry.phase === 'progress')
    const rightEndLog = rightLogs.at(-1)

    expect(harness.widths.floating).toBeGreaterThan(before)
    expect(harness.metrics.floatingRightResizeStart).toBe(1)
    expect(harness.metrics.floatingRightResizeEnd).toBe(1)
    expect(rightLogs[0]?.phase).toBe('start')
    expect(rightEndLog?.phase).toBe('end')
    expect(rightEndLog?.width).toBe(rightProgressLogs.at(-1)?.width)

    await layout.resizeSurface('left', 60)

    harness = await layout.readHarness()
    const leftLogs = harness.logs.floatingResize.filter((entry) => entry.edge === 'left')
    const leftProgressLogs = leftLogs.filter((entry) => entry.phase === 'progress')
    const leftEndLog = leftLogs.at(-1)

    expect(harness.metrics.floatingLeftResizeStart).toBe(1)
    expect(harness.metrics.floatingLeftResizeEnd).toBe(1)
    expect(leftLogs[0]?.phase).toBe('start')
    expect(leftEndLog?.phase).toBe('end')
    expect(leftEndLog?.width).toBe(leftProgressLogs.at(-1)?.width)
  })

  test('Props: resizable=false - 应隐藏 floating resize trigger', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.disableFloatingResizable()

    await expect(layout.getSurfaceResizeTrigger('left')).toHaveCount(0)
    await expect(layout.getSurfaceResizeTrigger('right')).toHaveCount(0)
  })

  test('viewport clamp - 超界拖拽后应被限制在视口内', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.dragSurface(-2000, -2000)

    await expect
      .poll(async () => {
        const box = await layout.surface.boundingBox()
        return box ? box.x >= 0 && box.y >= 0 : false
      })
      .toBe(true)
  })

  test('Controlled props: floating - 受控父级不回写时应只发事件，不自改位置和宽度', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.blockedFloatingSurface
    const before = await layout.getBox(surface)

    await layout.dragSurface(140, 40, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-updates').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-last-x').textContent()))
      .toBeGreaterThan(64)

    const afterDrag = await layout.getBox(surface)
    expect(Math.abs(afterDrag.x - before.x)).toBeLessThan(2)
    expect(Math.abs(afterDrag.y - before.y)).toBeLessThan(2)

    await layout.resizeSurface('right', 160, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-last-width').textContent()))
      .toBeGreaterThan(420)

    const afterResize = await layout.getBox(surface)
    expect(Math.abs(afterResize.width - before.width)).toBeLessThan(2)
  })

  test('Default props: defaultMode / defaultFloating - 非受控 floating 应按默认几何值启动', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface
    const box = await layout.getBox(surface)

    await layout.expectSurfaceMode('floating', surface)
    expect(box.x).toBeGreaterThanOrEqual(556)
    expect(box.x).toBeLessThanOrEqual(564)
    expect(box.y).toBeGreaterThanOrEqual(92)
    expect(box.y).toBeLessThanOrEqual(100)
    expect(box.width).toBeGreaterThanOrEqual(416)
    expect(box.width).toBeLessThanOrEqual(424)
    expect(box.height).toBeGreaterThanOrEqual(296)
    expect(box.height).toBeLessThanOrEqual(304)
  })

  test('Default props: defaultFloating - 非受控 floating 拖拽后应更新内部位置', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface
    const before = await layout.getBox(surface)

    await layout.dragSurface(-120, 60, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-updates').textContent()))
      .toBeGreaterThan(0)

    const after = await layout.getBox(surface)
    expect(after.x).toBeLessThan(before.x - 40)
    expect(after.y).toBeGreaterThan(before.y + 20)
  })

  test('Default props: 初始化后更新 defaultFloating 不应重新同步', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface
    const before = await layout.getBox(surface)

    await layout.page.getByTestId('uncontrolled-default-floating-update-btn').click()

    const after = await layout.getBox(surface)
    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
    expect(Math.abs(after.y - before.y)).toBeLessThan(2)
    expect(Math.abs(after.width - before.width)).toBeLessThan(2)
  })

  test('Default props: minWidth / maxWidth - 非受控 floating resize 应 obey clamp', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface

    await layout.resizeSurface('right', 240, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-last-width').textContent()))
      .toBeGreaterThan(420)

    const expanded = await layout.getBox(surface)
    expect(expanded.width).toBeGreaterThanOrEqual(476)
    expect(expanded.width).toBeLessThanOrEqual(484)

    await layout.resizeSurface('left', 400, surface)
    const shrunk = await layout.getBox(surface)
    expect(shrunk.width).toBeGreaterThanOrEqual(316)
    expect(shrunk.width).toBeLessThanOrEqual(324)
  })
})
