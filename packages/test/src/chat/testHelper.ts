import { Page, expect } from '@playwright/test'
import { createTestUtils, TestUtilsOptions } from '../test-utils'
import { CHAT_SELECTORS, type ChatSelectors } from './selectors'

export interface ChatTestHelperOptions extends TestUtilsOptions {
  chatSelectors?: Partial<ChatSelectors>
}

/**
 * 创建 Chat 组件专用测试辅助工具
 *
 * 遵循项目现有 Container testHelper 的设计约定：
 * - 封装常用操作（发送消息、打开Drawer、切换对话等）
 * - 封装断言方法（expectXxx）
 * - 暴露 selectors 供灵活使用
 */
export function createChatTestHelper(page: Page, options: ChatTestHelperOptions = {}) {
  const { defaultTimeout = 5000, chatSelectors = {}, ...restTestUtilsOptions } = options

  const selectors = {
    ...CHAT_SELECTORS,
    ...chatSelectors,
  }

  const testUtils = createTestUtils(page, { defaultTimeout, ...restTestUtilsOptions })

  // =====================
  //  模式切换
  // =====================

  /** 切换到黑盒模式 */
  const switchToBlackbox = async () => {
    await testUtils.clickWhenVisible(selectors.switchToBlackbox)
    await page.locator(selectors.blackboxRoot).waitFor({ state: 'visible', timeout: defaultTimeout })
  }

  /** 切换到白盒模式 */
  const switchToWhitebox = async () => {
    await testUtils.clickWhenVisible(selectors.switchToWhitebox)
    await page.locator(selectors.whiteboxRoot).waitFor({ state: 'visible', timeout: defaultTimeout })
  }

  /** 切换到细粒度模式 */
  const switchToGranular = async () => {
    await testUtils.clickWhenVisible(selectors.switchToGranular)
    await page.locator(selectors.granularRoot).waitFor({ state: 'visible', timeout: defaultTimeout })
  }

  const switchToSurfaceApi = async () => {
    await testUtils.clickWhenVisible(selectors.switchToSurfaceApi)
    await page.locator('[data-testid="chat-surface-slots-default"]').waitFor({
      state: 'visible',
      timeout: defaultTimeout,
    })
  }

  // =====================
  //  消息发送
  // =====================

  /** 在输入框中输入内容 */
  const typeMessage = async (text: string, root: string = selectors.blackboxChat) => {
    const input = page.locator(root).locator(selectors.senderInput)
    await input.waitFor({ state: 'visible', timeout: defaultTimeout })
    await input.fill(text)
  }

  /** 点击发送按钮 */
  const clickSend = async (root: string = selectors.blackboxChat) => {
    const btn = page.locator(root).locator(selectors.senderSubmitBtn)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 输入并发送消息 */
  const sendMessage = async (text: string, root: string = selectors.blackboxChat) => {
    await typeMessage(text, root)
    await clickSend(root)
  }

  /** 通过默认上传入口选择文件 */
  const uploadAttachment = async (
    files:
      | { name: string; mimeType: string; buffer: Buffer }
      | Array<{ name: string; mimeType: string; buffer: Buffer }>,
    root: string = selectors.blackboxChat,
  ) => {
    const uploadButton = page.locator(root).locator(selectors.uploadActionBtn)
    await uploadButton.waitFor({ state: 'visible', timeout: defaultTimeout })

    const fileChooserPromise = page.waitForEvent('filechooser')
    await uploadButton.click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(files)
  }

  /** 点击停止按钮 */
  const clickAbort = async (root: string = selectors.blackboxChat) => {
    const btn = page.locator(root).locator(selectors.senderCancelBtn)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 打开模型选择器 */
  const openModelSelector = async (root: string = selectors.blackboxChat) => {
    const trigger = page.locator(root).locator(selectors.modelSelectorTrigger)
    await trigger.waitFor({ state: 'visible', timeout: defaultTimeout })
    await trigger.click()
  }

  /** 打开 MCP 面板触发器 */
  const openMcpTrigger = async (root: string = selectors.blackboxChat) => {
    const trigger = page.locator(root).locator(selectors.mcpTrigger)
    await trigger.waitFor({ state: 'visible', timeout: defaultTimeout })
    await trigger.click()
  }

  /** 选择模型 */
  const selectModel = async (label: string, root: string = selectors.blackboxChat) => {
    await openModelSelector(root)
    const dropdown = page.locator('.tr-model-selector__dropdown-wrapper')
    const option = dropdown.locator(selectors.modelSelectorOption, {
      hasText: label,
    })
    await option.waitFor({ state: 'visible', timeout: defaultTimeout })
    await option.dispatchEvent('click')
    await expect(dropdown).toHaveCount(0, { timeout: defaultTimeout })
  }

  // =====================
  //  欢迎页 & 引导词
  // =====================

  /** 检查欢迎页是否可见 */
  const expectWelcomeVisible = async (visible: boolean, root: string = selectors.blackboxChat) => {
    const welcome = page.locator(root).locator(selectors.welcome)
    if (visible) {
      await expect(welcome).toBeVisible({ timeout: defaultTimeout })
    } else {
      await expect(welcome).not.toBeVisible({ timeout: defaultTimeout })
    }
  }

  /** 检查欢迎标题文本 */
  const expectWelcomeTitle = async (text: string, root: string = selectors.blackboxChat) => {
    const title = page.locator(root).locator(selectors.welcomeTitle)
    await expect(title).toContainText(text, { timeout: defaultTimeout })
  }

  /** 点击引导词 */
  const clickPrompt = async (index: number, root: string = selectors.blackboxChat) => {
    const promptItems = page.locator(root).locator(selectors.promptItem)
    await promptItems.nth(index).click()
  }

  /** 检查引导词数量 */
  const expectPromptCount = async (count: number, root: string = selectors.blackboxChat) => {
    const promptItems = page.locator(root).locator(selectors.promptItem)
    await expect(promptItems).toHaveCount(count, { timeout: defaultTimeout })
  }

  const expectSuggestionListVisible = async (visible: boolean) => {
    const suggestionList = page.locator(selectors.suggestionList)
    if (visible) {
      await expect(suggestionList).toBeVisible({ timeout: defaultTimeout })
    } else {
      await expect(suggestionList).toHaveCount(0)
    }
  }

  const clickSuggestionItem = async (index: number = 0) => {
    const items = page.locator(selectors.suggestionItem)
    await items.nth(index).waitFor({ state: 'visible', timeout: defaultTimeout })
    await items.nth(index).click()
  }

  // =====================
  //  消息列表
  // =====================

  /** 等待消息列表出现 */
  const expectMessageListVisible = async (root: string = selectors.blackboxChat) => {
    const body = page.locator(root).locator(selectors.body)
    await expect(body).toBeVisible({ timeout: defaultTimeout })
  }

  /** 检查消息数量（至少 N 条） */
  const expectMinMessageCount = async (minCount: number, root: string = selectors.blackboxChat) => {
    const messages = page.locator(root).locator(selectors.bubbleItem)
    await expect(messages).toHaveCount(minCount, { timeout: defaultTimeout * 2 })
  }

  /** 等待 assistant 回复出现 */
  const waitForAssistantReply = async (root: string = selectors.blackboxChat) => {
    // 等待至少 2 条消息（用户 + assistant）
    const messages = page.locator(root).locator(selectors.bubbleItem)
    await expect(messages.nth(1)).toBeVisible({ timeout: defaultTimeout * 3 })
  }

  /** 等待流式输出完成（消息内容稳定） */
  const waitForStreamingComplete = async (root: string = selectors.blackboxChat) => {
    // 通过检查 sender 按钮回到"发送"状态来判断流式输出完成
    // 流式结束后 cancel 按钮消失，submit 按钮恢复
    const cancelBtn = page.locator(root).locator(selectors.senderCancelBtn)
    await expect(cancelBtn).not.toBeVisible({ timeout: defaultTimeout * 4 })
  }

  // =====================
  //  发送后输入框
  // =====================

  /** 检查输入框是否已清空 */
  const expectInputEmpty = async (root: string = selectors.blackboxChat) => {
    const input = page.locator(root).locator(selectors.senderInput)
    await expect(input).toHaveText('', { timeout: defaultTimeout })
  }

  // =====================
  //  History Drawer
  // =====================

  /** 点击历史按钮 */
  const clickHistoryBtn = async (root: string = selectors.blackboxChat) => {
    // historyBtn 是联合选择器，优先找"打开历史"态按钮
    const btn = page.locator(root).locator('[title="打开历史"]')
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 检查 Drawer 是否打开 */
  const expectDrawerOpen = async (isOpen: boolean, root: string = selectors.blackboxChat) => {
    const drawer = page.locator(root).locator(selectors.drawer)
    if (isOpen) {
      await expect(drawer).toHaveClass(/is-open/, { timeout: defaultTimeout })
    } else {
      await expect(drawer).not.toHaveClass(/is-open/, { timeout: defaultTimeout })
    }
  }

  /** 点击遮罩层关闭 Drawer */
  const clickOverlayToClose = async (root: string = selectors.blackboxChat) => {
    const overlay = page.locator(root).locator(selectors.drawerOverlay)
    await overlay.dispatchEvent('click')
  }

  /** 点击新建对话按钮 */
  const clickNewChat = async (root: string = selectors.blackboxChat) => {
    const btn = page.locator(root).locator(selectors.newChatBtn)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 检查历史条目数量 */
  const expectHistoryItemCount = async (count: number, root: string = selectors.blackboxChat) => {
    await clickHistoryBtn(root)
    await page.waitForTimeout(300) // 等待 Drawer 动画
    const items = page.locator(root).locator(selectors.historyItem)
    await expect(items).toHaveCount(count, { timeout: defaultTimeout })
    await clickOverlayToClose(root)
    await page.waitForTimeout(300)
  }

  /** 点击历史条目 */
  const clickHistoryItem = async (index: number, root: string = selectors.blackboxChat) => {
    const items = page.locator(root).locator(selectors.historyItem)
    await items.nth(index).click()
  }

  // =====================
  //  白盒状态断言
  // =====================

  /** 检查白盒模式下的 status 值 */
  const expectStatus = async (status: string) => {
    const indicator = page.locator(selectors.statusIndicator)
    await expect(indicator).toContainText(status, { timeout: defaultTimeout })
  }

  /** 检查白盒模式下的消息数量 */
  const expectStatusMessageCount = async (count: string) => {
    const msgCount = page.locator(selectors.messageCount)
    await expect(msgCount).toContainText(count, { timeout: defaultTimeout })
  }

  /** 检查 onFinish 回调日志 */
  const expectFinishLog = async (contains: string) => {
    const log = page.locator(selectors.onFinishLog)
    await expect(log).toContainText(contains, { timeout: defaultTimeout * 4 })
  }

  // =====================
  //  布局断言
  // =====================

  /** 检查 Header 是否可见 */
  const expectHeaderVisible = async (root: string = selectors.blackboxChat) => {
    const header = page.locator(root).locator(selectors.header)
    await expect(header).toBeVisible({ timeout: defaultTimeout })
  }

  /** 检查 Footer 是否可见 */
  const expectFooterVisible = async (root: string = selectors.blackboxChat) => {
    const footer = page.locator(root).locator(selectors.footer)
    await expect(footer).toBeVisible({ timeout: defaultTimeout })
  }

  /** 检查默认上传入口是否可见 */
  const expectUploadActionVisible = async (visible: boolean, root: string = selectors.blackboxChat) => {
    const uploadButton = page.locator(root).locator(selectors.uploadActionBtn)
    if (visible) {
      await expect(uploadButton).toBeVisible({ timeout: defaultTimeout })
    } else {
      await expect(uploadButton).toHaveCount(0)
    }
  }

  /** 检查默认语音入口是否可见 */
  const expectVoiceActionVisible = async (visible: boolean, root: string = selectors.blackboxChat) => {
    const voiceButton = page.locator(root).locator(selectors.senderVoiceActionBtn)
    if (visible) {
      await expect(voiceButton).toBeVisible({ timeout: defaultTimeout })
    } else {
      await expect(voiceButton).toHaveCount(0)
    }
  }

  /** 检查附件区是否可见 */
  const expectAttachmentsAreaVisible = async (visible: boolean, root: string = selectors.blackboxChat) => {
    const attachmentsArea = page.locator(root).locator(selectors.attachmentsArea)
    if (visible) {
      await expect(attachmentsArea).toBeVisible({ timeout: defaultTimeout })
    } else {
      await expect(attachmentsArea).toHaveCount(0)
    }
  }

  /** 检查附件卡片数量 */
  const expectAttachmentCount = async (count: number, root: string = selectors.blackboxChat) => {
    const attachments = page.locator(root).locator(selectors.attachmentCard)
    await expect(attachments).toHaveCount(count, { timeout: defaultTimeout })
  }

  // =====================
  //  品牌区断言（UI-B1）
  // =====================

  /** 检查 Header 品牌标题文本 */
  const expectBrandTitle = async (text: string, root: string = selectors.blackboxChat) => {
    const brand = page.locator(root).locator(selectors.headerBrand)
    await expect(brand).toContainText(text, { timeout: defaultTimeout })
  }

  /** 检查 Header 品牌标题不存在（未配置 brand.title 时） */
  const expectNoBrandTitle = async (root: string = selectors.blackboxChat) => {
    const brand = page.locator(root).locator(selectors.headerBrand)
    await expect(brand).not.toBeVisible({ timeout: defaultTimeout })
  }

  // =====================
  //  消息角色断言（UI-RC1）
  // =====================

  /** 检查 assistant 消息是否靠左（placement: start） */
  const expectAssistantOnLeft = async (root: string = selectors.blackboxChat) => {
    const bubble = page.locator(root).locator(selectors.bubbleStart)
    await expect(bubble.first()).toBeVisible({ timeout: defaultTimeout * 2 })
  }

  /** 检查 user 消息是否靠右（placement: end） */
  const expectUserOnRight = async (root: string = selectors.blackboxChat) => {
    const bubble = page.locator(root).locator(selectors.bubbleEnd)
    await expect(bubble.first()).toBeVisible({ timeout: defaultTimeout })
  }

  /** 检查第 N 条消息是否有头像 */
  const expectBubbleHasAvatar = async (index: number, root: string = selectors.blackboxChat) => {
    const bubble = page.locator(root).locator(selectors.bubbleItem).nth(index)
    const avatar = bubble.locator(selectors.bubbleAvatar)
    await expect(avatar).toBeVisible({ timeout: defaultTimeout })
  }

  // =====================
  //  Prompt 布局断言（UI-W2）
  // =====================

  /** 检查 Prompt 是否在 wrap 容器(.tr-chat__welcome-prompts)中渲染 */
  const expectPromptContainerVisible = async (root: string = selectors.blackboxChat) => {
    const container = page.locator(root).locator(selectors.welcomePrompts)
    await expect(container).toBeVisible({ timeout: defaultTimeout })
  }

  /**
   * 检查宽屏下 Prompt 是否为双列布局
   * 原理：单个 prompt 宽度应小于容器宽度的 60%（双列时约 50%）
   */
  const expectPromptsDoubleColumn = async (root: string = selectors.blackboxChat) => {
    const container = page.locator(root).locator(selectors.welcomePrompts)
    const promptItem = page.locator(root).locator(selectors.promptItem).first()
    const containerBox = await container.boundingBox()
    const promptBox = await promptItem.boundingBox()
    if (containerBox && promptBox) {
      expect(promptBox.width).toBeLessThan(containerBox.width * 0.6)
    }
  }

  // =====================
  //  可访问性断言（UI-H2）
  // =====================

  /**
   * 检查历史按钮的 title / aria-label
   * @param label 期望值，如 "打开历史" 或 "关闭历史"
   */
  const expectHistoryBtnTitle = async (label: string, root: string = selectors.blackboxChat) => {
    const btn = page.locator(root).locator(`[title="${label}"]`)
    await expect(btn).toBeVisible({ timeout: defaultTimeout })
  }

  // =====================
  //  Workspace Shell (P5-B)
  // =====================

  /** 点击左侧区域折叠按钮 */
  const clickLeftToggle = async () => {
    const btn = page.locator(selectors.leftToggle)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 点击右侧区域折叠按钮 */
  const clickRightToggle = async () => {
    const btn = page.locator(selectors.rightToggle)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 点击 fullWidth 切换按钮 */
  const clickFullWidthToggle = async () => {
    const btn = page.locator(selectors.fullWidthToggle)
    await btn.waitFor({ state: 'visible', timeout: defaultTimeout })
    await btn.click()
  }

  /** 检查左侧区域是否折叠 */
  const expectLeftCollapsed = async (collapsed: boolean) => {
    const region = page.locator(selectors.leftRegion)
    if (collapsed) {
      await expect(region).toHaveClass(/is-collapsed/, { timeout: defaultTimeout })
    } else {
      await expect(region).not.toHaveClass(/is-collapsed/, { timeout: defaultTimeout })
    }
  }

  /** 检查右侧区域是否折叠 */
  const expectRightCollapsed = async (collapsed: boolean) => {
    const region = page.locator(selectors.rightRegion)
    if (collapsed) {
      await expect(region).toHaveClass(/is-collapsed/, { timeout: defaultTimeout })
    } else {
      await expect(region).not.toHaveClass(/is-collapsed/, { timeout: defaultTimeout })
    }
  }

  /** 检查左侧 rail 是否可见 */
  const expectLeftRailVisible = async (visible: boolean) => {
    const rail = page.locator(selectors.leftRail)
    if (visible) {
      await expect(rail).toHaveClass(/is-visible/, { timeout: defaultTimeout })
    } else {
      await expect(rail).not.toHaveClass(/is-visible/, { timeout: defaultTimeout })
    }
  }

  /** 检查右侧 rail 是否可见 */
  const expectRightRailVisible = async (visible: boolean) => {
    const rail = page.locator(selectors.rightRail)
    if (visible) {
      await expect(rail).toHaveClass(/is-visible/, { timeout: defaultTimeout })
    } else {
      await expect(rail).not.toHaveClass(/is-visible/, { timeout: defaultTimeout })
    }
  }

  /** 点击左侧 rail 恢复区域 */
  const clickLeftRail = async () => {
    const rail = page.locator(selectors.leftRail)
    await expect(rail).toHaveClass(/is-visible/, { timeout: defaultTimeout })
    await rail.click()
  }

  /** 点击右侧 rail 恢复区域 */
  const clickRightRail = async () => {
    const rail = page.locator(selectors.rightRail)
    await expect(rail).toHaveClass(/is-visible/, { timeout: defaultTimeout })
    await rail.click()
  }

  /** 点击面板标签切换激活面板（若区域已折叠则先展开，切换后恢复折叠状态） */
  const clickPanelTab = async (panelId: string, region: 'left' | 'right' = 'left') => {
    const regionSelector = region === 'left' ? selectors.leftRegion : selectors.rightRegion
    const regionEl = page.locator(regionSelector)

    // 若区域已折叠，先展开，切换后再折叠回去
    const isCollapsed = await regionEl.evaluate((el) => el.classList.contains('is-collapsed'))
    if (isCollapsed) {
      if (region === 'left') {
        await clickLeftToggle()
      } else {
        await clickRightToggle()
      }
    }

    const tab = page.locator(regionSelector).locator(selectors.panelTab, { hasText: new RegExp(panelId, 'i') })
    await tab.waitFor({ state: 'visible', timeout: defaultTimeout })
    await tab.click()

    // 若原来是折叠状态，切换面板后重新折叠
    if (isCollapsed) {
      if (region === 'left') {
        await clickLeftToggle()
      } else {
        await clickRightToggle()
      }
    }
  }

  /** 检查激活的面板 ID */
  const expectActivePanelId = async (panelId: string, region: 'left' | 'right' = 'left') => {
    const regionSelector = region === 'left' ? selectors.leftRegion : selectors.rightRegion
    const activeTab = page.locator(regionSelector).locator(selectors.activePanelTab)
    await expect(activeTab).toContainText(panelId, { timeout: defaultTimeout })
  }

  /** 检查 fullWidth 模式是否启用 */
  const expectFullWidthMode = async (enabled: boolean) => {
    const shell = page.locator(selectors.workspaceShell)
    if (enabled) {
      await expect(shell).toHaveAttribute('data-full-width', 'true', { timeout: defaultTimeout })
    } else {
      await expect(shell).toHaveAttribute('data-full-width', 'false', { timeout: defaultTimeout })
    }
  }

  /** 检查 shell 内的 chat 是否可见 */
  const expectShellChatVisible = async () => {
    const chat = page.locator(selectors.shellChat)
    await expect(chat).toBeVisible({ timeout: defaultTimeout })
  }

  /** 在 shell 内发送消息 */
  const sendMessageInShell = async (text: string) => {
    const input = page.locator(selectors.shellChat).locator(selectors.senderInput)
    await input.waitFor({ state: 'visible', timeout: defaultTimeout })
    await input.fill(text)
    const btn = page.locator(selectors.shellChat).locator(selectors.senderSubmitBtn)
    await btn.click()
  }

  /** 等待 shell 内的 assistant 回复，可指定最少消息数，并等待流式完成 */
  const waitForShellAssistantReply = async (minCount: number = 2) => {
    const messages = page.locator(selectors.shellChat).locator(selectors.bubbleItem)
    await expect(messages.nth(minCount - 1)).toBeVisible({ timeout: defaultTimeout * 3 })
    // 等待流式完成（cancel 按钮消失，submit 按钮恢复）
    const cancelBtn = page.locator(selectors.shellChat).locator(selectors.senderCancelBtn)
    await expect(cancelBtn).not.toBeVisible({ timeout: defaultTimeout * 4 })
  }

  /** 检查左侧区域内容是否隐藏 */
  const expectLeftRegionContentHidden = async (hidden: boolean) => {
    const content = page.locator(selectors.leftRegionContent)
    if (hidden) {
      await expect(content).toHaveClass(/is-hidden/, { timeout: defaultTimeout })
    } else {
      await expect(content).not.toHaveClass(/is-hidden/, { timeout: defaultTimeout })
    }
  }

  /** 检查右侧区域内容是否隐藏 */
  const expectRightRegionContentHidden = async (hidden: boolean) => {
    const content = page.locator(selectors.rightRegionContent)
    if (hidden) {
      await expect(content).toHaveClass(/is-hidden/, { timeout: defaultTimeout })
    } else {
      await expect(content).not.toHaveClass(/is-hidden/, { timeout: defaultTimeout })
    }
  }

  return {
    // 模式切换
    switchToBlackbox,
    switchToWhitebox,
    switchToGranular,
    switchToSurfaceApi,

    // 消息交互
    typeMessage,
    clickSend,
    sendMessage,
    uploadAttachment,
    clickAbort,
    openModelSelector,
    openMcpTrigger,
    selectModel,

    // 欢迎页
    expectWelcomeVisible,
    expectWelcomeTitle,
    clickPrompt,
    expectPromptCount,
    expectSuggestionListVisible,
    clickSuggestionItem,

    // 消息列表
    expectMessageListVisible,
    expectMinMessageCount,
    waitForAssistantReply,
    waitForStreamingComplete,

    // 输入框
    expectInputEmpty,

    // 历史 Drawer
    clickHistoryBtn,
    expectDrawerOpen,
    clickOverlayToClose,
    clickNewChat,
    expectHistoryItemCount,
    clickHistoryItem,

    // 白盒状态
    expectStatus,
    expectStatusMessageCount,
    expectFinishLog,

    // 布局
    expectHeaderVisible,
    expectFooterVisible,
    expectUploadActionVisible,
    expectVoiceActionVisible,
    expectAttachmentsAreaVisible,
    expectAttachmentCount,

    // 品牌区（UI-B1）
    expectBrandTitle,
    expectNoBrandTitle,

    // 消息角色（UI-RC1）
    expectAssistantOnLeft,
    expectUserOnRight,
    expectBubbleHasAvatar,

    // Prompt 布局（UI-W2）
    expectPromptContainerVisible,
    expectPromptsDoubleColumn,

    // 可访问性（UI-H2）
    expectHistoryBtnTitle,

    // Workspace Shell (P5-B)
    clickLeftToggle,
    clickRightToggle,
    clickFullWidthToggle,
    expectLeftCollapsed,
    expectRightCollapsed,
    expectLeftRailVisible,
    expectRightRailVisible,
    clickLeftRail,
    clickRightRail,
    clickPanelTab,
    expectActivePanelId,
    expectFullWidthMode,
    expectShellChatVisible,
    sendMessageInShell,
    waitForShellAssistantReply,
    expectLeftRegionContentHidden,
    expectRightRegionContentHidden,

    // 基础工具
    ...testUtils,

    // 选择器
    selectors,
  }
}
