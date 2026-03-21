import type { ChatConversationTurnNavigationItem } from '../../../../types'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

function getMessageText(message: ChatMessage) {
  if (typeof message.content === 'string') {
    return message.content.trim()
  }

  return ''
}

function toTurnLabel(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized.length > 72 ? `${normalized.slice(0, 72)}...` : normalized
}

export function resolveConversationTurnNavigationItems(
  messages: ChatMessage[] | undefined,
): ChatConversationTurnNavigationItem[] {
  const items: ChatConversationTurnNavigationItem[] = []

  for (const [messageIndex, message] of (messages ?? []).entries()) {
    if (message.role !== 'user') {
      continue
    }

    const text = getMessageText(message)
    if (!text) {
      continue
    }

    items.push({
      id: `turn-${messageIndex}`,
      label: toTurnLabel(text),
      description: message.metadata?.model ? `model:${message.metadata.model}` : undefined,
      messageIndex,
      role: 'user',
    })
  }

  return items
}
