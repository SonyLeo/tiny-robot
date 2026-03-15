import { computed, h } from 'vue'
import { useClipboard } from '@vueuse/core'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import { IconButton } from '@opentiny/tiny-robot'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import { CHAT_MESSAGES } from '../messages'
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

  const lastContent = computed(() => {
    const last = [...messages].reverse().find((message) => message.role === 'assistant' || !message.role)
    if (!last?.content) {
      return ''
    }
    return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
  })

  const lastUserContent = computed(() => {
    if (!chatKit) {
      return ''
    }

    const allMessages = chatKit.messages.value
    const firstIndex = messageIndexes[0] ?? 0
    for (let index = firstIndex - 1; index >= 0; index--) {
      if (allMessages[index]?.role === 'user') {
        const content = allMessages[index].content
        return typeof content === 'string' ? content : ''
      }
    }

    return ''
  })

  const userContent = computed(() => {
    const userMessage = messages.find((message) => message.role === 'user')
    if (!userMessage?.content) {
      return ''
    }
    return typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content)
  })

  const isStreaming = computed(() =>
    chatKit ? chatKit.status.value === 'streaming' || chatKit.status.value === 'submitted' : false,
  )

  const feedbackActions = computed<FeedbackProps['actions']>(() => {
    if (role === 'user') {
      return [
        { name: 'copy', label: CHAT_MESSAGES.feedback.copy, icon: 'copy' },
        { name: 'edit', label: CHAT_MESSAGES.feedback.edit, icon: h(IconButton, { icon: IconEditPen }) },
      ]
    }

    return [
      { name: 'copy', label: CHAT_MESSAGES.feedback.copy, icon: 'copy' },
      { name: 'refresh', label: CHAT_MESSAGES.feedback.regenerate, icon: 'refresh' },
      { name: 'like', label: CHAT_MESSAGES.feedback.like, icon: 'like' },
      { name: 'dislike', label: CHAT_MESSAGES.feedback.dislike, icon: 'dislike' },
    ]
  })

  function handleCopyAction() {
    const content = role === 'user' ? userContent.value : lastContent.value
    copy(content)
  }

  function handleRefreshAction(): boolean {
    if (role === 'user') {
      return true
    }

    if (!chatKit || isStreaming.value || !lastUserContent.value) {
      return false
    }

    if (chatKit.lastError.value?.retryable) {
      void chatKit.retry()
      return false
    }

    chatKit.sendMessage(lastUserContent.value)
    return false
  }

  return {
    feedbackActions,
    handleCopyAction,
    handleRefreshAction,
    userContent,
  }
}
