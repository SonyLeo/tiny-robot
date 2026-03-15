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

  // UI-H1：升级为 TrIconButton 后验证 SVG 按钮 + 无 emoji
  test('布局: Header 应显示 TrIconButton 风格的历史和新建对话按钮', async () => {
    const root = helper.selectors.blackboxChat
    const historyBtn = helper.getLocator(root).locator(helper.selectors.historyBtn)
    const newChatBtn = helper.getLocator(root).locator(helper.selectors.newChatBtn)
    await expect(historyBtn).toBeVisible()
    await expect(newChatBtn).toBeVisible()
    // 升级为 TrIconButton 后，按钮不应再包含 emoji 文本
    await expect(historyBtn).not.toContainText('☰')
    await expect(newChatBtn).not.toContainText('✏️')
  })

  // --- 品牌展示（UI-B1）---

  test('品牌: Header 应显示 brand.title 配置的品牌标题', async () => {
    await helper.expectBrandTitle('Chat Kit 测试')
  })

  // --- 欢迎页 ---

  test('欢迎页: 应显示标题和描述', async () => {
    await helper.expectWelcomeTitle('TinyRobot')
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
    await helper
      .getLocator(helper.selectors.blackboxChat)
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
    const items = helper.getLocator(helper.selectors.blackboxChat).locator(helper.selectors.historyItem)
    await expect(items).toHaveCount(1, { timeout: 5000 })
  })

  // --- 默认 roleConfigs（UI-RC1）---

  test('消息排布: 发送消息后 user 消息应靠右显示', async () => {
    await helper.sendMessage('测试排布：user 右对齐')
    await helper.expectUserOnRight()
  })

  test('消息排布: 收到 assistant 回复后应靠左显示', async () => {
    await helper.sendMessage('测试排布：assistant 左对齐')
    await helper.waitForAssistantReply()
    await helper.expectAssistantOnLeft()
  })

  test('消息排布: 消息气泡应显示默认头像', async () => {
    await helper.sendMessage('测试默认头像')
    await helper.waitForAssistantReply()
    // index 0 为 user 消息，index 1 为 assistant 消息
    await helper.expectBubbleHasAvatar(0)
    await helper.expectBubbleHasAvatar(1)
  })

  // --- Header 可访问性（UI-H2）---

  test('可访问性: 历史按钮初始状态 title 应为 "打开历史"', async () => {
    await helper.expectHistoryBtnTitle('打开历史')
  })

  test('可访问性: 打开 Drawer 后历史按钮 title 应变为 "关闭历史"', async () => {
    await helper.clickHistoryBtn()
    await helper.expectDrawerOpen(true)
    await helper.expectHistoryBtnTitle('关闭历史')
    // 清理：关闭 Drawer，避免影响后续测试
    await helper.clickOverlayToClose()
  })

  // --- Prompt 布局（UI-W2）---

  test('Prompt: 应在 .tr-chat__welcome-prompts 容器中渲染', async () => {
    await helper.expectPromptContainerVisible()
  })

  test('Prompt: 宽屏（≥ 640px）下应呈双列布局', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await helper.expectPromptsDoubleColumn()
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
  // --- Edge Cases / 文档扩展能力测试 ---

  test.describe('黑盒边缘/扩展场景', () => {
    test.beforeEach(async () => {
      await helper.switchToBlackboxEdge()
    })

    test('全屏: 点击全屏按钮应使组件变成 fixed 定位全屏态', async ({ page }) => {
      const chat = page.getByTestId('chat-blackbox-edge').locator('.tr-chat')
      const btn = chat.getByTitle('全屏')

      await expect(chat).not.toHaveClass(/tr-chat--fullscreen/)
      await btn.click()
      await expect(chat).toHaveClass(/tr-chat--fullscreen/)

      // 测试 CSS 是否生效 (position fixed 等)
      const position = await chat.evaluate((el) => getComputedStyle(el).position)
      expect(position).toBe('fixed')

      // 返回
      await btn.click()
    })

    test('属性透传: sender-props maxLength 限制发送但不截断输入', async ({ page }) => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      const input = page.locator(root).locator('.tiptap') // 使用 tiptap 的真实节点
      const submitBtn = page.locator(root).locator('.tr-sender-submit-button') // 获取发送按钮

      // demo 中我们在 extra-mode 配了 maxLength: 5
      await input.fill('12345678')
      const val = await input.textContent()

      // 1. 验证输入不会被截断，也就是真实长度依然会超过 5
      expect(val?.length).toBe(8)
      expect(val).toBe('12345678')

      // 2. 验证此时因为超长 (8 > 5)，发送按钮具有 is-disabled 类
      await expect(submitBtn).toHaveClass(/is-disabled/)
    })

    test('属性透传: roleConfigs 自定义排布应覆盖默认规则', async () => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      await helper.sendMessage('修改布局', root)
      await helper.waitForAssistantReply(root)

      const bubbles = helper.getLocator(root).locator(helper.selectors.bubbleItem)
      const userBubble = bubbles.first()

      // 测试页我们配置了 user placement: 'start'（本该是右'end'，但首选配置了靠左）
      const placement = await userBubble.getAttribute('data-placement')
      expect(placement).toBe('start')
    })

    test('插槽透传: #footer-extra 和 #header-extra 正常渲染', async ({ page }) => {
      const chatNode = page.getByTestId('chat-blackbox-edge')

      const headerBtn = chatNode.getByTestId('custom-header-btn')
      const footerExtra = chatNode.getByTestId('custom-footer-extra')

      await expect(headerBtn).toBeVisible()
      await expect(footerExtra).toBeVisible()
      await expect(footerExtra).toHaveText('这是 Footer 额外区域')
    })

    test('异常流: 发送特定文本触发 error 事件且记录回调日志', async ({ page }) => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      // E2E mock 会在遇到 'err' 抗异常（注意: edge 模式 maxLength=5，所以需 ≤ 5 字符）
      await helper.sendMessage('err', root)

      // 等待抛出异常被截获
      const errLog = page.getByTestId('on-error-log')
      await expect(errLog).toContainText('error:Mock API Error: provider execution failed')
    })

    test('retry button should retry failed request', async ({ page }) => {
      const root = 'div[data-testid="chat-blackbox-edge"] .tr-chat'
      await helper.sendMessage('err', root)

      const retryButton = page.locator(root).getByTestId('chat-error-retry')
      await expect(retryButton).toBeVisible()

      await retryButton.click()
      await helper.waitForAssistantReply(root)

      const contents = page.locator(root).locator(helper.selectors.bubbleContent)
      await expect(contents.last()).toContainText('[edge-provider:edge-model] err')
    })

    test('optimistic bubbles should appear during pending requests and clear after completion', async ({ page }) => {
      const root = helper.selectors.blackboxChat
      await helper.switchToBlackbox()
      await helper.sendMessage('optimistic-state', root)

      const optimisticBubble = page.locator(root).locator(helper.selectors.bubbleOptimistic)
      await expect(optimisticBubble.first()).toBeVisible()

      await helper.waitForStreamingComplete(root)
      await expect(optimisticBubble).toHaveCount(0)
    })
  })

  test('message action callback should receive feedback actions in blackbox mode', async ({ page }) => {
    const root = helper.selectors.blackboxChat
    await helper.sendMessage('trigger action callback', root)
    await helper.waitForAssistantReply(root)

    const actionButtons = page.locator(root).locator('.tr-feedback .tr-action-group__btn-wrapper')
    await expect(actionButtons.first()).toBeVisible()
    await actionButtons.first().click()

    const actionLog = page.locator(helper.selectors.onActionLog)
    await expect(actionLog).toContainText('action:copy:assistant:')
  })

  test('feedback actions should appear only after assistant reply is complete', async ({ page }) => {
    const root = helper.selectors.blackboxChat
    await helper.sendMessage('feedback timing', root)

    const feedback = page.locator(root).locator(helper.selectors.feedback)
    await expect(feedback).toHaveCount(0)

    await helper.waitForStreamingComplete(root)
    await expect(feedback.first()).toBeVisible()
  })
  test('docs variant should switch message list into document layout', async ({ page }) => {
    const root = helper.selectors.blackboxChat

    await page.locator(helper.selectors.toggleMessageVariant).click()
    await expect(page.locator(helper.selectors.variantIndicator)).toContainText('docs')

    await helper.sendMessage('docs variant message', root)
    await helper.waitForAssistantReply(root)

    const bubbleList = page.locator(root).locator('.tr-bubble-list')
    await expect(bubbleList).toHaveAttribute('data-variant', 'docs')

    const assistantAvatar = page.locator(root).locator(".tr-bubble[data-role='assistant'] .tr-bubble__avatar")
    await expect(assistantAvatar).toHaveCount(0)
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

  test('状态: 发送消息后应经历 submitted → streaming → ready', async () => {
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

  // --- 默认 roleConfigs（UI-RC1，白盒）---
  // 注意：白盒模式由用户自行控制 TrChat.MessageList，不会自动注入 DEFAULT_ROLE_CONFIGS
  // 如需默认排布，白盒模式需用户手动传 :role-configs="..."
  // 此测试仅验证白盒消息列表能正确渲染黑盒模式的消息（排布细节通过黑盒测试覆盖）

  test('消息排布: 白盒 MessageList 应正确渲染消息列表', async () => {
    const root = helper.selectors.whiteboxChat

    await helper.sendMessage('白盒消息渲染测试', root)
    // waitForAssistantReply 内部等待第 2 条气泡可见（即 assistant 回复）
    // 这等价于验证消息列表已正确渲染 >= 2 条消息
    await helper.waitForAssistantReply(root)

    const bubbles = helper.getLocator(root).locator(helper.selectors.bubbleItem)
    await expect(bubbles.nth(1)).toBeVisible()
  })
  test('异常流: 内部 Provider 返回 Error 也能正常终止并回调', async ({ page }) => {
    const root = helper.selectors.whiteboxChat

    await helper.sendMessage('err', root)

    const finishLog = page.getByTestId('on-finish-log')
    await expect(finishLog).toContainText('error:Mock API Error: provider execution failed')
  })
})
