import { computed, h } from 'vue'
import { useClipboard } from '@vueuse/core'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import { IconButton } from '@opentiny/tiny-robot'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import type { UseChatKitReturn } from '../types'

export interface UseChatFeedbackOptions {
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
  chatKit?: UseChatKitReturn | null
}

export function useChatFeedback(options: UseChatFeedbackOptions) {
  const { messages, messageIndexes, role, chatKit = null } = options
  const { copy } = useClipboard()

  // 取该组最后一条 assistant 消息的文本内容（用于复制）
  const lastContent = computed(() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant' || !m.role)
    if (!last?.content) return ''
    return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
  })

  // 取触发本轮回答的最后一条 user 消息内容（用于重新生成）
  const lastUserContent = computed(() => {
    if (!chatKit) return ''
    const allMessages = chatKit.messages.value
    // 找到本组第一条消息之前最近的 user 消息
    const firstIndex = messageIndexes[0] ?? 0
    for (let i = firstIndex - 1; i >= 0; i--) {
      if (allMessages[i]?.role === 'user') {
        const content = allMessages[i].content
        return typeof content === 'string' ? content : ''
      }
    }
    return ''
  })

  // 取 user 消息的文本内容（用于复制和编辑）
  const userContent = computed(() => {
    const userMsg = messages.find((m) => m.role === 'user')
    if (!userMsg?.content) return ''
    return typeof userMsg.content === 'string' ? userMsg.content : JSON.stringify(userMsg.content)
  })

  const isStreaming = computed(() =>
    chatKit ? chatKit.status.value === 'streaming' || chatKit.status.value === 'submitted' : false,
  )

  // 根据角色生成对应的 actions
  const feedbackActions = computed<FeedbackProps['actions']>(() => {
    if (role === 'user') {
      // User 消息：复制和编辑
      return [
        { name: 'copy', label: '复制', icon: 'copy' },
        { name: 'edit', label: '编辑', icon: h(IconButton, { icon: IconEditPen }) },
      ]
    } else {
      // Assistant 消息：复制、重新生成、赞、踩
      return [
        { name: 'copy', label: '复制', icon: 'copy' },
        { name: 'refresh', label: '重新生成', icon: 'refresh' },
        { name: 'like', label: '赞', icon: 'like' },
        { name: 'dislike', label: '踩', icon: 'dislike' },
      ]
    }
  })

  function handleCopyAction() {
    const content = role === 'user' ? userContent.value : lastContent.value
    copy(content)
  }

  function handleRefreshAction(): boolean {
    if (role === 'user') {
      // User 消息的编辑 - 返回 true 表示需要触发 edit 事件
      return true
    } else {
      // Assistant 消息的重新生成
      if (!chatKit || isStreaming.value || !lastUserContent.value) return false
      chatKit.sendMessage(lastUserContent.value)
      return false
    }
  }

  return {
    feedbackActions,
    handleCopyAction,
    handleRefreshAction,
    userContent,
  }
}
