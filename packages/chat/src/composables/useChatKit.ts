import { computed, shallowRef, watchEffect } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { BasePluginContext } from '@opentiny/tiny-robot-kit'
import type { ChatStatus, UseChatKitOptions, UseChatKitReturn, UseMessageResponseProvider } from '../types'
import type { StructuredData } from '@opentiny/tiny-robot'

export function useChatKit(options: UseChatKitOptions): UseChatKitReturn {
  const { plugins = [], storage, initialMessages = [], onFinish, onError } = options

  // 用 shallowRef 包装 responseProvider，使所有引擎可以动态跟随更新
  const responseProviderRef = shallowRef<UseMessageResponseProvider>(
    options.responseProvider as UseMessageResponseProvider,
  )

  // onFinish / onError 通过插件机制注入到 useMessage 生命周期
  const lifecyclePlugin = {
    name: 'chatkit-lifecycle',
    onTurnEnd(ctx: BasePluginContext) {
      if (!onFinish) return
      // 取本轮最后一条 assistant 消息作为完成消息
      const last = [...ctx.currentTurn].reverse().find((m) => m.role === 'assistant')
      if (last) onFinish(last)
    },
    onError(ctx: BasePluginContext & { error: unknown }) {
      onError?.(ctx.error instanceof Error ? ctx.error : new Error(String(ctx.error)))
    },
  }

  const conversation = useConversation({
    useMessageOptions: {
      responseProvider: responseProviderRef.value,
      plugins: [...plugins, lifecyclePlugin],
      initialMessages,
    },
    autoSaveMessages: !!storage,
    storage,
  })

  // ===== ChatStatus 四态推导 =====
  // 从 activeConversation.engine.requestState + processingState 推导
  const status = computed<ChatStatus>(() => {
    const engine = conversation.activeConversation.value?.engine
    if (!engine) return 'ready'

    const rs = engine.requestState.value
    const ps = engine.processingState.value

    if (rs === 'error') return 'error'
    if (rs === 'processing') {
      return ps === 'completing' ? 'streaming' : 'submitted'
    }
    return 'ready' // idle / completed / aborted 均视为 ready
  })

  // ===== messages 从 activeConversation 派生 =====
  const messages = computed<ChatMessage[]>(() => conversation.activeConversation.value?.engine.messages.value ?? [])

  // ===== sendMessage：首次发送自动创建会话 =====
  function sendMessage(content: string, _data?: StructuredData): void {
    if (!content.trim()) return
    if (!conversation.activeConversationId.value) {
      conversation.createConversation({ title: content.slice(0, 20) })
    }
    conversation.activeConversation.value?.engine.sendMessage(content)
  }

  // ===== updateResponseProvider：动态更新所有已创建引擎的 provider =====
  function updateResponseProvider(provider: UseChatKitOptions['responseProvider']): void {
    responseProviderRef.value = provider as UseMessageResponseProvider
  }

  // 当 responseProviderRef 变化时，同步更新所有会话的引擎
  watchEffect(() => {
    const engine = conversation.activeConversation.value?.engine
    if (engine) {
      engine.responseProvider.value = responseProviderRef.value
    }
  })

  // ===== abort：立即置 ready，网络层异步关闭 =====
  async function abort(): Promise<void> {
    await conversation.abortActiveRequest()
  }

  return {
    // 透传 useConversation 的会话管理 API
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    createConversation: conversation.createConversation,
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    // 套件层新增
    messages,
    status,
    sendMessage,
    updateResponseProvider,
    abort,
  }
}
