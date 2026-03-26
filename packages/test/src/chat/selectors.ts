/**
 * Chat 组件相关的选择器常量
 */

export const CHAT_SELECTORS = {
  // === 黑盒模式选择器 ===
  blackboxRoot: '[data-testid="chat-blackbox"]',
  blackboxChat: '[data-testid="chat-blackbox"] .tr-chat',

  // === 白盒模式选择器 ===
  whiteboxRoot: '[data-testid="chat-whitebox"]',
  whiteboxChat: '[data-testid="chat-whitebox"] .tr-chat',

  // === 布局结构 ===
  header: '.tr-chat__header',
  body: '.tr-chat__body',
  welcome: '.tr-chat__welcome',
  footer: '.tr-chat__footer',
  footerExtra: '.tr-chat__footer-extra',
  attachmentsArea: '[data-testid="chat-attachments-area"]',
  attachmentsList: '.tr-attachments__file-list',
  attachmentCard: '.tr-file-card',
  uploadActionBtn: '[data-testid="chat-attachments-upload"] .tr-action-button',
  senderVoiceActionBtn: '[data-testid="chat-sender-action-voice"] .tr-action-button',
  senderWordCounter: '.tr-sender-word-counter',

  // === Header 按钮（UI-H1/H2：改为 title 属性选择器，不依赖实现细节类名）===
  // historyBtn 选取两种状态：打开/关闭均可找到
  historyBtn: '[title="打开历史"], [title="关闭历史"]',
  newChatBtn: '[title="新建对话"]',

  // === Header 品牌（UI-B1）===
  headerBrand: '.tr-chat__header-brand',

  // === Drawer ===
  drawerOverlay: '.tr-chat-drawer-overlay',
  drawer: '.tr-chat-drawer',
  drawerOpen: '.tr-chat-drawer.is-open',

  // === Sender ===
  senderInput: '.tiptap',
  senderSubmitBtn: '.tr-sender-submit-button',
  senderCancelBtn: '.tr-sender-submit-button__cancel',
  mcpTrigger: '[data-testid="chat-mcp-trigger-button"]',
  mcpTriggerLabel: '[data-testid="chat-mcp-trigger-label"]',
  mcpTriggerCount: '[data-testid="chat-mcp-trigger-count"]',
  modelSelectorTrigger: '.tr-model-selector__trigger',
  modelSelectorOption: '.tr-model-selector__option',
  suggestionList: '.suggestion-list',
  suggestionItem: '.suggestion-list__item',

  // === BubbleList / Messages ===
  bubbleList: '.tr-bubble-list',
  bubbleItem: '.tr-bubble',
  bubbleContent: '.tr-bubble__content',
  bubbleOptimistic: '.tr-bubble__box[data-optimistic="true"]',
  feedback: '.tr-feedback',

  // === 消息气泡角色（UI-RC1：用于排布测试）===
  // Bubble 组件通过 data-placement 属性控制左右布局（注意：不是 CSS 类名）
  bubbleStart: '.tr-bubble[data-placement="start"]', // assistant 靠左
  bubbleEnd: '.tr-bubble[data-placement="end"]', // user 靠右
  bubbleAvatar: '.tr-bubble__avatar', // 头像容器

  // === Welcome / Prompts ===
  welcomeTitle: '.tr-welcome__title',
  welcomeDescription: '.tr-welcome__description',
  promptItem: '.tr-prompt',

  // === Welcome Prompt 容器（UI-W2：用于布局测试）===
  welcomePrompts: '.tr-chat__welcome-prompts',

  // === History ===
  historyItem: '.tr-history__item',
  historyItemActive: '.tr-history__item.selected',

  // === 测试 Demo 控制按钮 ===
  switchToBlackbox: '[data-testid="switch-blackbox"]',
  switchToWhitebox: '[data-testid="switch-whitebox"]',
  switchToBlackboxEdge: '[data-testid="switch-blackbox-edge"]',
  switchToSurfaceApi: '[data-testid="switch-surface-api"]',

  // === 状态指示器（白盒 Demo 中注入） ===
  statusIndicator: '[data-testid="status-indicator"]',
  messageCount: '[data-testid="message-count"]',
  onFinishLog: '[data-testid="on-finish-log"]',
  onActionLog: '[data-testid="on-action-log"]',
  variantIndicator: '[data-testid="variant-indicator"]',
  toggleMessageVariant: '[data-testid="toggle-message-variant"]',

  // === Historical workspace selectors ===
  workspaceShell: '.tr-workspace-shell',
  workspaceShellRoot: '[data-testid="p5-shell-preview"]',
  leftRegion: '.tr-workspace-shell__region--left',
  rightRegion: '.tr-workspace-shell__region--right',
  leftRail: '.tr-workspace-shell__region--left .tr-workspace-shell__rail',
  rightRail: '.tr-workspace-shell__region--right .tr-workspace-shell__rail',
  leftRegionContent: '.tr-workspace-shell__region--left .tr-workspace-shell__region-content',
  rightRegionContent: '.tr-workspace-shell__region--right .tr-workspace-shell__region-content',
  panelHost: '.tr-workspace-panel-host',
  panelTab: '.tr-workspace-panel-host__tab',
  activePanelTab: '.tr-workspace-panel-host__tab.is-active',
  panelBody: '.tr-workspace-panel-host__body',
  fullWidthToggle: '[data-testid="toggle-full-width"]',
  leftToggle: '[data-testid="toggle-left"]',
  rightToggle: '[data-testid="toggle-right"]',
  shellChat: '[data-testid="p5-shell-preview"] .tr-chat',
  shellMeta: '.tr-workspace-shell__meta',
  shellChip: '.shell-chip',
} as const

export type ChatSelectors = typeof CHAT_SELECTORS

export function getChatSelector(key: keyof ChatSelectors): string {
  return CHAT_SELECTORS[key]
}
