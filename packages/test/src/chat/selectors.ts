/**
 * Chat 组件相关的选择器常量
 */

export const CHAT_SELECTORS = {
  // === 黑盒模式选择器 ===
  trChatRoot: '[data-testid="chat-trchat"]',
  trChatChat: '[data-testid="chat-trchat"] .tr-chat',

  // === 白盒模式选择器 ===
  whiteboxRoot: '[data-testid="chat-whitebox"]',
  whiteboxChat: '[data-testid="chat-whitebox"] .tr-chat',

  // === 细粒度模式选择器 ===
  granularRoot: '[data-testid="chat-granular"]',
  granularChat: '[data-testid="chat-granular"] .tr-chat',

  // === 布局结构 ===
  header: '.tr-chat__header',
  body: '.tr-chat__body',
  welcome: '.tr-chat__welcome',
  footer: '.tr-chat__footer',
  attachmentsArea: '[data-testid="chat-attachments-area"]',
  attachmentCard: '.tr-file-card',
  uploadActionBtn: '[data-testid="chat-attachments-upload"] .tr-action-button',
  senderVoiceActionBtn: '[data-testid="chat-sender-action-voice"] .tr-action-button',
  senderWordCounter: '.tr-sender-word-counter',

  // === Header 按钮（title 属性选择器，稳定且 accessible）===
  historyBtn: '[title="打开历史"], [title="关闭历史"]',
  newChatBtn: '[title="新建对话"]',
  closeBtn: '[title="关闭"]',

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
  bubbleItem: '.tr-bubble',
  bubbleContent: '.tr-bubble__content',
  bubbleOptimistic: '.tr-bubble__box[data-optimistic="true"]',

  // === 消息气泡角色（UI-RC1：用于排布测试）===
  // Bubble 组件通过 data-placement 属性控制左右布局（注意：不是 CSS 类名）
  bubbleStart: '.tr-bubble[data-placement="start"]', // assistant 靠左
  bubbleEnd: '.tr-bubble[data-placement="end"]', // user 靠右

  // === Welcome / Prompts ===
  welcomeTitle: '.tr-welcome__title',
  promptItem: '.tr-prompt',

  // === History ===
  historyItem: '.tr-history__item',

  // === 测试 Demo 控制按钮 ===
  switchToTrChat: '[data-testid="switch-trchat"]',
  switchToWhitebox: '[data-testid="switch-whitebox"]',
  switchToGranular: '[data-testid="switch-granular"]',

  // === 状态指示器（白盒 Demo 中注入） ===
  statusIndicator: '[data-testid="status-indicator"]',
  messageCount: '[data-testid="message-count"]',
  onFinishLog: '[data-testid="on-finish-log"]',
  onActionLog: '[data-testid="on-action-log"]',
} as const

export type ChatSelectors = typeof CHAT_SELECTORS
