import { computed, ref, watch } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { CHAT_MESSAGES, resolveChatMessages } from '@/shared/messages'
import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import type { ChatPresetSlices } from '@/runtime/config'
import { getChatMessageError } from '@/runtime/chat-kit/chatMessageState'
import type {
  ChatAttachmentsFeaturePreset,
  ChatMessagesOverrides,
  TrChatScaffoldContextValue,
  UseChatKitReturn,
} from '@/types'
import type {
  ChatConversationSummary,
  ChatRuntime,
  ChatUIMessage,
  ChatWorkspaceRegionRuntime,
  ReadonlyRef,
  TrChatRootUiConfig,
} from '@/types/root'
import type { ChatWorkspaceRegionConfig, ChatWorkspaceShellConfig } from '@/types/workspace'
import { extractMessageText, getMessageEditingState } from '@/runtime/core/normalizeRuntime'
import { getLegacyPhase1ABridgeHints } from './runtimeHints'

function toLegacyChatMessage(message: ChatUIMessage): ChatMessage {
  if (message.raw && typeof message.raw === 'object') {
    return message.raw as ChatMessage
  }

  return {
    role: message.role || 'assistant',
    content: extractMessageText(message),
  } as ChatMessage
}

function createGenericAttachmentsManager(runtime: ChatRuntime): UseChatAttachmentsReturn | undefined {
  if (!runtime.attachments) {
    return undefined
  }

  return {
    items: runtime.sender.pendingAttachments,
    addFiles(files) {
      const prepared = runtime.attachments?.prepareFiles(files) ?? []
      runtime.sender.addPendingAttachments(prepared)
    },
    setItems(items) {
      runtime.sender.setPendingAttachments(items)
    },
    removeItem(item) {
      runtime.sender.removePendingAttachment(item)
    },
    clear() {
      runtime.sender.clearPendingAttachments()
    },
  }
}

function createConversationSummary(conversation: unknown): ChatConversationSummary | null {
  if (!conversation || typeof conversation !== 'object') {
    return null
  }

  const candidate = conversation as { id?: unknown; title?: unknown }
  if (typeof candidate.id !== 'string') {
    return null
  }

  return {
    id: candidate.id,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
  }
}

function createShellRegionConfig(
  region: ChatWorkspaceRegionRuntime | undefined,
  fallback: ChatWorkspaceRegionConfig | undefined,
): ChatWorkspaceRegionConfig | undefined {
  const enabled = region?.enabled.value ?? fallback?.enabled

  if (enabled === false) {
    return {
      enabled: false,
    }
  }

  if (!region && !fallback) {
    return undefined
  }

  return {
    enabled: enabled ?? true,
    collapsible: region?.collapsible.value ?? fallback?.collapsible,
    defaultOpen: region ? region.visible.value && !region.collapsed.value : fallback?.defaultOpen,
    collapseMode: region?.collapseMode.value ?? fallback?.collapseMode,
    width: region?.width.value ?? fallback?.width,
    railLabel: region?.railLabel.value ?? fallback?.railLabel,
  }
}

function createWorkspaceShellConfig(runtime: ChatRuntime): ChatWorkspaceShellConfig | undefined {
  if (!runtime.workspace) {
    return undefined
  }

  return {
    variant: runtime.workspace.variant.value,
    leftRegion: createShellRegionConfig(runtime.workspace.left, {
      enabled: Boolean(runtime.history),
      collapseMode: 'rail',
    }),
    rightRegion: createShellRegionConfig(runtime.workspace.right, undefined),
  }
}

function createFallbackChatKit(runtimeRef: ReadonlyRef<ChatRuntime>): UseChatKitReturn {
  const messages = computed(() => runtimeRef.value.conversation.messages.value.map(toLegacyChatMessage))
  const conversations = computed(() => {
    const history = runtimeRef.value.history
    if (!history) {
      return []
    }

    return history.conversations.value
      .map((conversation) => createConversationSummary(conversation))
      .filter((conversation): conversation is ChatConversationSummary => Boolean(conversation))
  })
  const activeConversationId = computed(() => runtimeRef.value.history?.activeConversationId.value ?? null)
  const activeConversation = computed(() => {
    const currentId = activeConversationId.value
    if (!currentId) {
      return null
    }

    return conversations.value.find((conversation) => conversation.id === currentId) ?? null
  })
  const lastError = computed(() => {
    const lastMessage = [...runtimeRef.value.conversation.messages.value]
      .reverse()
      .find((message) => runtimeRef.value.message.getViewState(message.id)?.error)

    return lastMessage ? (getChatMessageError(lastMessage.raw) ?? null) : null
  })
  const placeholderRuntime = {
    activeEngine: computed(() => null),
    requestState: computed(() => 'idle'),
    processingState: computed(() => undefined),
    isProcessing: computed(() => runtimeRef.value.conversation.status.value === 'streaming'),
    clear: () => undefined,
    saveMessages: () => undefined,
  } as UseChatKitReturn['runtime']

  async function retry() {
    return runtimeRef.value.conversation.retry()
  }

  async function regenerate(messageIndex?: number) {
    const target =
      typeof messageIndex === 'number' ? runtimeRef.value.conversation.messages.value[messageIndex] : undefined
    return runtimeRef.value.conversation.regenerate(target?.id)
  }

  async function abort() {
    await runtimeRef.value.conversation.abort()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation(params?: { title?: string }) {
      const result = runtimeRef.value.history?.createConversation(params?.title ? { title: params.title } : undefined)

      if (typeof result === 'string') {
        return result
      }

      return ''
    },
    switchConversation(id: string) {
      return runtimeRef.value.history?.switchConversation(id) ?? false
    },
    deleteConversation(id: string) {
      return runtimeRef.value.history?.deleteConversation(id) ?? false
    },
    updateConversationTitle(id: string, title: string) {
      runtimeRef.value.history?.renameConversation?.(id, title)
    },
    abortActiveRequest: abort,
    messages,
    status: runtimeRef.value.conversation.status,
    lastError,
    sendMessage(content: string) {
      return runtimeRef.value.sender.send({ text: content })
    },
    startEditMessage(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        runtimeRef.value.message.startEdit(message.id)
      }
    },
    cancelEditMessage(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        runtimeRef.value.message.cancelEdit(message.id)
      }
    },
    isMessageEditing(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      return runtimeRef.value.message.getViewState(message?.id ?? '')?.editing ?? getMessageEditingState(message)
    },
    editMessage(messageIndex: number, newContent: string) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        return runtimeRef.value.message.commitEdit(message.id, newContent)
      }
    },
    updateResponseProvider(_provider: unknown) {
      // Root bootstrap does not manage a provider swap path yet.
    },
    abort,
    retry,
    regenerate,
    runtime: placeholderRuntime,
  } as unknown as UseChatKitReturn
}

function createScaffoldSlices(
  uiRef: ReadonlyRef<TrChatRootUiConfig | undefined>,
  runtimeRef: ReadonlyRef<ChatRuntime>,
) {
  return computed<ChatPresetSlices>(() => ({
    provider: {
      attachmentsFeature: runtimeRef.value.attachments
        ? {
            enabled: runtimeRef.value.attachments.enabled.value,
            upload: runtimeRef.value.attachments.uploadConfig?.value,
            list: runtimeRef.value.attachments.listConfig?.value,
          }
        : undefined,
      messages: uiRef.value?.copy,
    },
    layout: {
      contentLayout: uiRef.value?.contentLayout,
      bubbleRenderers: runtimeRef.value.message.config?.renderers,
    },
    appearance: {
      appearance: uiRef.value?.appearance,
    },
    shell: {
      shell: createWorkspaceShellConfig(runtimeRef.value),
    },
    header: {
      title: uiRef.value?.brand?.title,
      showHistory: Boolean(runtimeRef.value.history),
      showClose: false,
    },
    welcome: uiRef.value?.welcome
      ? {
          title: uiRef.value.welcome.title,
          description: uiRef.value.welcome.description,
          icon: uiRef.value.welcome.icon ?? uiRef.value.brand?.logo,
          prompts: undefined,
        }
      : undefined,
    messageList: {
      autoScroll: true,
      variant: 'bubble',
      messageActions: runtimeRef.value.message.config?.actions,
      messageActionsMode: runtimeRef.value.message.config?.actionMode,
      showFeedback: runtimeRef.value.message.config?.feedback?.enabled ?? false,
    },
    sender: {
      placeholder: runtimeRef.value.sender.defaults?.placeholder,
      mode: runtimeRef.value.sender.defaults?.mode,
      maxLength: runtimeRef.value.sender.defaults?.maxLength,
      showWordLimit: runtimeRef.value.sender.defaults?.wordCount || undefined,
    },
    history: {
      enabled: Boolean(runtimeRef.value.history),
    },
    modelSelector: {
      enabled: Boolean(runtimeRef.value.models),
      models: runtimeRef.value.models?.models.value,
      defaultModel: runtimeRef.value.models?.currentModelId.value ?? undefined,
    },
  }))
}

export function createLegacyRootBridge(
  runtimeRef: ReadonlyRef<ChatRuntime>,
  uiRef: ReadonlyRef<TrChatRootUiConfig | undefined>,
) {
  const hints = computed(() => getLegacyPhase1ABridgeHints(runtimeRef.value))
  const resolvedCopy = computed(() => {
    const overrides = uiRef.value?.copy
    return overrides ? resolveChatMessages(overrides) : CHAT_MESSAGES
  })
  const attachmentsManager = computed(
    () => createGenericAttachmentsManager(runtimeRef.value) ?? hints.value?.attachmentsManager,
  )
  const attachmentsFeature = computed<ChatAttachmentsFeaturePreset | undefined>(() => {
    if (!runtimeRef.value.attachments) {
      return undefined
    }

    return {
      enabled: runtimeRef.value.attachments.enabled.value,
      upload: runtimeRef.value.attachments.uploadConfig?.value,
      list: runtimeRef.value.attachments.listConfig?.value,
    }
  })
  const fallbackChatKit = createFallbackChatKit(runtimeRef)
  const chatKit = computed<UseChatKitReturn>(() => {
    const hinted = hints.value?.chatKit
    if (!hinted) {
      return fallbackChatKit
    }

    return {
      ...hinted,
      sendMessage(content: string) {
        return runtimeRef.value.sender.send({ text: content })
      },
      abort() {
        return Promise.resolve(runtimeRef.value.conversation.abort())
      },
      retry() {
        return Promise.resolve(runtimeRef.value.conversation.retry())
      },
      regenerate(messageIndex?: number) {
        const target =
          typeof messageIndex === 'number' ? runtimeRef.value.conversation.messages.value[messageIndex] : undefined
        return Promise.resolve(runtimeRef.value.conversation.regenerate(target?.id))
      },
      startEditMessage(messageIndex: number) {
        const message = runtimeRef.value.conversation.messages.value[messageIndex]
        if (message) {
          runtimeRef.value.message.startEdit(message.id)
        }
      },
      cancelEditMessage(messageIndex: number) {
        const message = runtimeRef.value.conversation.messages.value[messageIndex]
        if (message) {
          runtimeRef.value.message.cancelEdit(message.id)
        }
      },
      isMessageEditing(messageIndex: number) {
        const message = runtimeRef.value.conversation.messages.value[messageIndex]
        return runtimeRef.value.message.getViewState(message?.id ?? '')?.editing ?? getMessageEditingState(message)
      },
      editMessage(messageIndex: number, newContent: string) {
        const message = runtimeRef.value.conversation.messages.value[messageIndex]
        if (message) {
          return runtimeRef.value.message.commitEdit(message.id, newContent)
        }
      },
    }
  })
  const scaffoldSlices = createScaffoldSlices(uiRef, runtimeRef)
  const currentModel = ref(runtimeRef.value.models?.currentModelId.value ?? '')
  const models = computed(() => runtimeRef.value.models?.models.value ?? [])
  const defaultModel = computed(() => runtimeRef.value.models?.currentModelId.value ?? models.value[0]?.value)

  watch(
    () => runtimeRef.value.models?.currentModelId.value ?? '',
    (nextModel) => {
      currentModel.value = nextModel
    },
    { immediate: true },
  )

  const scaffoldContext: TrChatScaffoldContextValue = {
    presetProps: computed(() => ({}) as never),
    presetSlices: scaffoldSlices,
    currentModel,
    models,
    defaultModel,
    updateModel(model) {
      currentModel.value = model.value
      runtimeRef.value.models?.selectModel(model.value)
    },
  }

  return {
    chatKit,
    messages: computed<ChatMessagesOverrides | undefined>(() => uiRef.value?.copy),
    shell: computed(() => scaffoldSlices.value.shell.shell),
    attachmentsManager,
    attachmentsFeature,
    resolvedCopy,
    scaffoldContext,
  }
}
