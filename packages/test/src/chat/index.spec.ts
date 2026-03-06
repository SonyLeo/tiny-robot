import { test, expect, type Page } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

// ═══════════════════════════════════════════════════════════
//  黑盒模式测试（TrChat 组件）
// ═══════════════════════════════════════════════════════════

test.describe('Chat 黑盒模式测试', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToBlackbox()
  })

  // --- 布局结构 ---

  test('布局: 应正确渲染 Header + Welcome + Footer 三段式结构', async () => {
    await helper.expectHeaderVisible()
    await helper.expectWelcomeVisible(true)
    await helper.expectFooterVisible()
  })

  test('布局: Header 应显示历史和新建对话按钮', async () => {
    const root = helper.selectors.blackboxChat
    const historyBtn = helper.getLocator(root).locator(helper.selectors.historyBtn)
    const newChatBtn = helper.getLocator(root).locator(helper.selectors.newChatBtn)
    await expect(historyBtn).toBeVisible()
    await expect(newChatBtn).toBeVisible()
  })

  // --- 欢迎页 ---

  test('欢迎页: 应显示标题和描述', async () => {
    await helper.expectWelcomeTitle('Chat Kit 测试')
  })

  test('欢迎页: 应显示引导词', async () => {
    await helper.expectPromptCount(2)
  })

  test('欢迎页: 点击引导词应自动发送消息并切换到消息列表', async () => {
    // 初始为欢迎页
    await helper.expectWelcomeVisible(true)

    // 点击第一个引导词
    await helper.clickPrompt(0)

    // 欢迎页消失，消息列表出现
    await helper.expectWelcomeVisible(false)
    await helper.expectMessageListVisible()
  })

  // --- 消息发送 ---

  test('发送: 输入消息并发送，应显示在消息列表中', async () => {
    await helper.sendMessage('Hello World')

    // 欢迎页消失
    await helper.expectWelcomeVisible(false)

    // 等待 assistant 回复
    await helper.waitForAssistantReply()
  })

  test('发送: 发送后输入框应自动清空', async () => {
    await helper.sendMessage('测试清空')
    await helper.expectInputEmpty()
  })

  test('发送: 流式输出完成后应有完整的回复', async () => {
    await helper.sendMessage('测试完整回复')

    // 等待流式输出完成
    await helper.waitForStreamingComplete()
    await helper.waitForAssistantReply()
  })

  // --- 中断 ---

  test('中断: 流式输出时应可点击停止按钮中断', async () => {
    await helper.sendMessage('这是一条测试消息用于中断')

    // 等待出现停止按钮并点击
    await helper.clickAbort()

    // 停止按钮消失（状态回到 ready）
    await helper.waitForStreamingComplete()
  })

  // --- History Drawer ---

  test('Drawer: 点击历史按钮应打开 Drawer', async () => {
    await helper.clickHistoryBtn()

    // 等待动画
    await helper.getLocator(helper.selectors.blackboxChat)
      .locator(helper.selectors.drawer)
      .waitFor({ state: 'visible' })

    await helper.expectDrawerOpen(true)
  })

  test('Drawer: 点击遮罩层应关闭 Drawer', async () => {
    await helper.clickHistoryBtn()
    await helper.expectDrawerOpen(true)

    await helper.clickOverlayToClose()
    await helper.expectDrawerOpen(false)
  })

  // --- 会话管理 ---

  test('会话: 新建对话应清空消息并回到欢迎页', async () => {
    // 先发送一条消息
    await helper.sendMessage('建立第一个对话')
    await helper.waitForStreamingComplete()

    // 点击新建对话
    await helper.clickNewChat()

    // 应回到欢迎页
    await helper.expectWelcomeVisible(true)
  })

  test('会话: 发送消息后应能在历史中看到对话记录', async () => {
    // 发送消息建立会话
    await helper.sendMessage('第一个对话')
    await helper.waitForStreamingComplete()

    // 打开历史查看
    await helper.clickHistoryBtn()
    await helper.expectDrawerOpen(true)

    // 应至少有 1 条历史记录
    const items = helper.getLocator(helper.selectors.blackboxChat)
      .locator(helper.selectors.historyItem)
    await expect(items).toHaveCount(1, { timeout: 5000 })
  })

  // --- 样式验证 ---

  test('样式: .tr-chat 应有正确的 flex 列布局', async ({ page }) => {
    const chat = page.locator(helper.selectors.blackboxChat)
    const display = await chat.evaluate((el) => getComputedStyle(el).display)
    const direction = await chat.evaluate((el) => getComputedStyle(el).flexDirection)
    expect(display).toBe('flex')
    expect(direction).toBe('column')
  })

  test('样式: .tr-chat 应有 position: relative（Drawer 定位基准）', async ({ page }) => {
    const chat = page.locator(helper.selectors.blackboxChat)
    const position = await chat.evaluate((el) => getComputedStyle(el).position)
    expect(position).toBe('relative')
  })

  test('样式: Drawer 关闭时应有 translateX(-100%)', async ({ page }) => {
    const drawer = page.locator(helper.selectors.blackboxChat).locator(helper.selectors.drawer)
    const transform = await drawer.evaluate((el) => getComputedStyle(el).transform)
    // matrix(-1, 0, 0, 1, 0, 0) 或包含 translateX(-100%) 的变换
    expect(transform).not.toBe('none')
  })
})

// ═══════════════════════════════════════════════════════════
//  白盒模式测试（TrChat.Root + 子组件）
// ═══════════════════════════════════════════════════════════

test.describe('Chat 白盒模式测试', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Chat 组件')
    await expect(page.locator('h2')).toContainText('Chat 组件测试')
    helper = createChatTestHelper(page)
    await helper.switchToWhitebox()
  })

  // --- 状态流转 ---

  test('状态: 初始状态应为 ready', async () => {
    await helper.expectStatus('ready')
  })

  test('状态: 初始消息数应为 0', async () => {
    await helper.expectStatusMessageCount('0')
  })

  test('状态: 发送消息后应经历 submitted → streaming → ready', async ({ page }) => {
    const root = helper.selectors.whiteboxChat

    // 初始 ready
    await helper.expectStatus('ready')

    // 发送消息
    await helper.sendMessage('测试状态流转', root)

    // 应经过 submitted 或 streaming（submitted 可能很短暂）
    // 等待流式完成后回到 ready
    await helper.waitForStreamingComplete(root)
    await helper.expectStatus('ready')
  })

  test('状态: 发送后消息数应增加', async ({ page }) => {
    const root = helper.selectors.whiteboxChat

    await helper.expectStatusMessageCount('0')

    await helper.sendMessage('测试消息计数', root)

    await helper.waitForStreamingComplete(root)

    // 至少有 2 条消息（用户 + assistant）
    const messageCount = page.locator(helper.selectors.messageCount)
    const countText = await messageCount.textContent()
    expect(Number(countText)).toBeGreaterThanOrEqual(2)
  })

  // --- 生命周期回调 ---

  test('回调: onFinish 应在流式完成后触发', async () => {
    const root = helper.selectors.whiteboxChat

    await helper.sendMessage('测试 onFinish', root)
    await helper.waitForStreamingComplete(root)

    // onFinish 日志应包含 "finish:"
    await helper.expectFinishLog('finish:')
  })

  // --- 白盒布局 ---

  test('布局: Root 注入后子组件应正确渲染', async () => {
    const root = helper.selectors.whiteboxChat
    await helper.expectHeaderVisible(root)
    await helper.expectWelcomeVisible(true, root)
    await helper.expectFooterVisible(root)
  })

  test('布局: Welcome 和 MessageList 应互斥显示', async () => {
    const root = helper.selectors.whiteboxChat

    // 初始：Welcome 可见
    await helper.expectWelcomeVisible(true, root)

    // 发送消息
    await helper.sendMessage('切换到消息列表', root)

    // Welcome 消失，MessageList 出现
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
  })

  // --- inject/provide 链路 ---

  test('inject: Header 的新建对话按钮应能正常工作', async () => {
    const root = helper.selectors.whiteboxChat

    // 发送消息
    await helper.sendMessage('白盒会话', root)
    await helper.waitForStreamingComplete(root)

    // 点击新建对话
    await helper.clickNewChat(root)

    // 回到欢迎页，消息数重置
    await helper.expectWelcomeVisible(true, root)
  })

  test('inject: History Drawer 应正常打开和关闭', async () => {
    const root = helper.selectors.whiteboxChat

    await helper.clickHistoryBtn(root)
    await helper.expectDrawerOpen(true, root)

    await helper.clickOverlayToClose(root)
    await helper.expectDrawerOpen(false, root)
  })

  test('inject: 引导词点击应通过 emit 工作', async () => {
    const root = helper.selectors.whiteboxChat

    // 初始为欢迎页
    await helper.expectWelcomeVisible(true, root)

    // 点击引导词
    await helper.clickPrompt(0, root)

    // 应切换到消息列表
    await helper.expectWelcomeVisible(false, root)
    await helper.expectMessageListVisible(root)
  })
})
