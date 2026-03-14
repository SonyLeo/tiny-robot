import { computed, shallowRef, watchEffect } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { BasePluginContext, UseMessagePlugin, UseMessageOptions } from '@opentiny/tiny-robot-kit'
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
      const last = [...ctx.currentTurn].reverse().find((message: ChatMessage) => message.role === 'assistant')
      if (last) onFinish(last)
    },
    onError(ctx: BasePluginContext & { error: unknown }) {
      onError?.(ctx.error instanceof Error ? ctx.error : new Error(String(ctx.error)))
    },
  }

  const conversation = useConversation({
    useMessageOptions: {
      responseProvider: responseProviderRef.value as UseMessageOptions['responseProvider'],
      plugins: [...plugins, lifecyclePlugin] as UseMessagePlugin[],
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
  /**
   * 发送消息
   * @param data - 结构化数据（预留，底层 engine 暂未支持）
   */
  function sendMessage(content: string, _data?: StructuredData): void {
    if (!content.trim()) return
    if (!conversation.activeConversationId.value) {
      // 首次自动建会话：传入 initialMessages 的浅拷贝。
      // 浅拷贝确保后续 push 操作不会污染原始 initialMessages 引用，
      // 从而保证下次 createConversation 时新会话始终从空消息启动。
      conversation.createConversation({
        title: content.slice(0, 20),
        useMessageOptions: { initialMessages: [...initialMessages] },
      })
    }
    const engine = conversation.activeConversation.value?.engine
    if (!engine) {
      console.warn('[useChatKit] sendMessage: no active engine after createConversation')
      return
    }
    engine.sendMessage(content)
  }

  // ===== updateResponseProvider：动态更新所有已创建引擎的 provider =====
  function updateResponseProvider(provider: UseChatKitOptions['responseProvider']): void {
    responseProviderRef.value = provider as UseMessageResponseProvider
  }

  // 当 responseProviderRef 变化或 activeConversation 切换时，
  // 自动同步当前活跃引擎的 provider。
  // 注意：非活跃会话的引擎不会立即更新，但切换到该会话时 watchEffect 会触发更新。
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

  // ===== startEditMessage：进入编辑态 =====
  /**
   * 将指定索引的消息置为编辑态
   * @param messageIndex - 消息在列表中的索引
   */
  function startEditMessage(messageIndex: number): void {
    const msg = messages.value[messageIndex]
    if (!msg) {
      console.warn(`[useChatKit] startEditMessage: invalid messageIndex ${messageIndex}`)
      return
    }
    if (!msg.state) msg.state = {}
    msg.state.isEditing = true
  }

  // ===== cancelEditMessage：退出编辑态 =====
  /**
   * 取消指定索引消息的编辑态
   * @param messageIndex - 消息在列表中的索引
   */
  function cancelEditMessage(messageIndex: number): void {
    const msg = messages.value[messageIndex]
    if (msg?.state) {
      msg.state.isEditing = false
    }
  }

  // ===== isMessageEditing：检查消息是否在编辑态 =====
  /**
   * 检查指定索引的消息是否处于编辑状态
   * @param messageIndex - 消息在列表中的索引
   * @returns 是否在编辑态
   */
  function isMessageEditing(messageIndex: number): boolean {
    return messages.value[messageIndex]?.state?.isEditing === true
  }

  // ===== editMessage：编辑消息 =====
  /**
   * 编辑指定索引的消息
   * 删除该消息及之后的所有消息，然后以新内容重新发送
   * @param messageIndex - 消息在列表中的索引
   * @param newContent - 编辑后的消息内容
   */
  function editMessage(messageIndex: number, newContent: string): void {
    const msgs = messages.value
    if (messageIndex < 0 || messageIndex >= msgs.length) {
      console.warn(`[useChatKit] editMessage: invalid messageIndex ${messageIndex}`)
      return
    }

    // 删除该消息及之后的所有消息
    msgs.splice(messageIndex)

    // 以编辑后的内容重新发送
    sendMessage(newContent)
  }

  return {
    // 透传 useConversation 的会话管理 API
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    // 包一层：用户手动新建对话时始终传空的 initialMessages，
    // 避免底层 useConversation 复用 options 里的初始消息引用。
    createConversation: (params?: Parameters<typeof conversation.createConversation>[0]) =>
      conversation.createConversation({
        ...params,
        useMessageOptions: { ...params?.useMessageOptions, initialMessages: [] },
      }),
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    abortActiveRequest: conversation.abortActiveRequest,
    // 套件层新增
    messages,
    status,
    sendMessage,
    updateResponseProvider,
    abort,
    startEditMessage,
    cancelEditMessage,
    isMessageEditing,
    editMessage,
  }
}
