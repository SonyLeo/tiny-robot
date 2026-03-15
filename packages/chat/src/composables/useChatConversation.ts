import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { BasePluginContext, UseMessagePlugin, UseMessageOptions } from '@opentiny/tiny-robot-kit'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ShallowRef } from 'vue'
import type { UseChatKitOptions, UseMessageResponseProvider } from '../types'

type UseChatConversationOptions = Pick<
  UseChatKitOptions,
  'plugins' | 'storage' | 'initialMessages' | 'onFinish' | 'onError'
> & {
  responseProviderRef: ShallowRef<UseMessageResponseProvider>
  onTurnError?: (payload: { context: BasePluginContext & { error: unknown }; error: unknown }) => void
}

function createLifecyclePlugin(
  options: Pick<UseChatKitOptions, 'onFinish' | 'onError'> & Pick<UseChatConversationOptions, 'onTurnError'>,
): UseMessagePlugin {
  return {
    name: 'chatkit-lifecycle',
    onTurnEnd(ctx: BasePluginContext) {
      if (!options.onFinish) return

      const lastAssistantMessage = [...ctx.currentTurn]
        .reverse()
        .find((message: ChatMessage) => message.role === 'assistant')
      if (lastAssistantMessage) {
        options.onFinish(lastAssistantMessage)
      }
    },
    onError(ctx: BasePluginContext & { error: unknown }) {
      options.onTurnError?.({ context: ctx, error: ctx.error })
      options.onError?.(ctx.error instanceof Error ? ctx.error : new Error(String(ctx.error)))
    },
  }
}

export function useChatConversation(options: UseChatConversationOptions): Pick<
  UseConversationReturn,
  | 'conversations'
  | 'activeConversationId'
  | 'activeConversation'
  | 'switchConversation'
  | 'deleteConversation'
  | 'updateConversationTitle'
  | 'abortActiveRequest'
> & {
  createConversation: (
    params?: Parameters<UseConversationReturn['createConversation']>[0],
  ) => ReturnType<UseConversationReturn['createConversation']>
  sendMessage: (content: string) => void
} {
  const { plugins = [], storage, initialMessages = [], onFinish, onError, onTurnError, responseProviderRef } = options

  const conversation = useConversation({
    useMessageOptions: {
      responseProvider: responseProviderRef.value as UseMessageOptions['responseProvider'],
      plugins: [...plugins, createLifecyclePlugin({ onFinish, onError, onTurnError })] as UseMessagePlugin[],
    },
    autoSaveMessages: !!storage,
    storage,
  })

  function createConversation(params?: Parameters<UseConversationReturn['createConversation']>[0]) {
    return conversation.createConversation({
      ...params,
      useMessageOptions: {
        ...params?.useMessageOptions,
        initialMessages: [],
      },
    })
  }

  function sendMessage(content: string): void {
    if (!content.trim()) return

    if (!conversation.activeConversationId.value) {
      conversation.createConversation({
        title: content.slice(0, 20),
        useMessageOptions: { initialMessages: [...initialMessages] },
      })
    }

    const engine = conversation.activeConversation.value?.engine
    if (!engine) {
      console.warn('[useChatConversation] sendMessage: no active engine after createConversation')
      return
    }

    engine.sendMessage(content)
  }

  return {
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    createConversation,
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    abortActiveRequest: conversation.abortActiveRequest,
    sendMessage,
  }
}
