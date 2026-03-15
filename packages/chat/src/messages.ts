import type { ChatMessages } from './types'

/**
 * Centralized chat-owned copy.
 * This is a preparation step for future app-wide i18n, not a runtime locale system.
 */
export const CHAT_MESSAGES: ChatMessages = {
  header: {
    newChat: '新建对话',
    openHistory: '打开历史',
    closeHistory: '关闭历史',
    enterFullscreen: '全屏',
    exitFullscreen: '退出全屏',
    close: '关闭',
  },
  history: {
    newSession: '新建会话',
    manage: '管理',
    done: '完成',
    defaultConversationTitle: '新对话',
    searchPlaceholder: '搜索会话...',
    deleteSelected: '删除选中',
    cancel: '取消',
  },
  sender: {
    placeholder: '请输入您的问题',
  },
  feedback: {
    copy: '复制',
    edit: '编辑',
    regenerate: '重新生成',
    like: '赞',
    dislike: '踩',
  },
  editMessage: {
    placeholder: '编辑消息内容...',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
  },
  toolCall: {
    running: '正在调用',
    success: '已调用',
    failed: '调用失败',
    cancelled: '已取消',
    untitled: '未命名工具',
  },
  error: {
    defaultMessage: '发生错误',
    retry: '重试',
  },
}
