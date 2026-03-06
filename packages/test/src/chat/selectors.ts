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

  // === Header 按钮 ===
  historyBtn: '.tr-chat__header-left .tr-chat__header-button',
  newChatBtn: '.tr-chat__header-right .tr-chat__header-button',

  // === Drawer ===
  drawerOverlay: '.tr-chat-drawer-overlay',
  drawer: '.tr-chat-drawer',
  drawerOpen: '.tr-chat-drawer.is-open',

  // === Sender ===
  senderInput: '.tiptap',
  senderSubmitBtn: '.tr-sender-submit-button',
  senderCancelBtn: '.tr-sender-submit-button__cancel',

  // === BubbleList / Messages ===
  bubbleList: '.tr-bubble-list',
  bubbleItem: '.tr-bubble',
  bubbleContent: '.tr-bubble__content',

  // === Welcome / Prompts ===
  welcomeTitle: '.tr-welcome__title',
  welcomeDescription: '.tr-welcome__description',
  promptItem: '.tr-prompt',

  // === History ===
  historyItem: '.tr-history__item',
  historyItemActive: '.tr-history__item.selected',

  // === 测试 Demo 控制按钮 ===
  switchToBlackbox: '[data-testid="switch-blackbox"]',
  switchToWhitebox: '[data-testid="switch-whitebox"]',

  // === 状态指示器（白盒 Demo 中注入） ===
  statusIndicator: '[data-testid="status-indicator"]',
  messageCount: '[data-testid="message-count"]',
  onFinishLog: '[data-testid="on-finish-log"]',
} as const

export type ChatSelectors = typeof CHAT_SELECTORS

export function getChatSelector(key: keyof ChatSelectors): string {
  return CHAT_SELECTORS[key]
}
