import type { ComputedRef } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

interface UseChatMessagesOptions {
  messages: ComputedRef<ChatMessage[]>
  resendMessage: (content: string) => void
}

export function useChatMessages(options: UseChatMessagesOptions) {
  function startEditMessage(messageIndex: number): void {
    const message = options.messages.value[messageIndex]
    if (!message) {
      console.warn(`[useChatMessages] startEditMessage: invalid messageIndex ${messageIndex}`)
      return
    }

    if (!message.state) {
      message.state = {}
    }

    message.state.isEditing = true
  }

  function cancelEditMessage(messageIndex: number): void {
    const message = options.messages.value[messageIndex]
    if (message?.state) {
      message.state.isEditing = false
    }
  }

  function isMessageEditing(messageIndex: number): boolean {
    return options.messages.value[messageIndex]?.state?.isEditing === true
  }

  function editMessage(messageIndex: number, newContent: string): void {
    const currentMessages = options.messages.value
    if (messageIndex < 0 || messageIndex >= currentMessages.length) {
      console.warn(`[useChatMessages] editMessage: invalid messageIndex ${messageIndex}`)
      return
    }

    currentMessages.splice(messageIndex)
    options.resendMessage(newContent)
  }

  return {
    startEditMessage,
    cancelEditMessage,
    isMessageEditing,
    editMessage,
  }
}
