import {
  localStorageStrategyFactory,
  sseStreamToGenerator,
  toolPlugin,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { computed, ref, watch } from 'vue'
import { useMcp } from './useMcp'
import { useModel } from './useModel'

const CONVERSATION_STORAGE_KEY = 'tiny-robot-assistant-panel-conversations'
const ACTIVE_CONVERSATION_STORAGE_KEY = 'tiny-robot-assistant-panel-active-conversation'
const DEFAULT_CONVERSATION_TITLE = 'New conversation'
const SYSTEM_PROMPT = 'You are a helpful assistant.'

function loadStoredActiveConversationId() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY)
}

function createConversationTitle(content: string) {
  const trimmed = content.trim()
  return trimmed ? trimmed.slice(0, 32) : DEFAULT_CONVERSATION_TITLE
}

function hasVisibleMessages(messages: { role?: string }[]) {
  return messages.some((item) => item.role !== 'system')
}

function createChatStore() {
  const inputMessage = ref('')
  const modelStore = useModel()
  const mcpStore = useMcp()
  const storedActiveConversationId = loadStoredActiveConversationId()
  const { selectedModel, getSelectedModelParams } = modelStore

  const responseProvider = async (requestBody: Record<string, unknown>, abortSignal: AbortSignal) => {
    const currentModel = selectedModel.value
    if (!currentModel) {
      throw new Error('No model selected.')
    }
    if (!currentModel.apiKey) {
      throw new Error(`Missing API key for provider "${currentModel.provider}".`)
    }

    const response = await fetch(currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentModel.apiKey}`,
      },
      body: JSON.stringify({
        ...requestBody,
        ...getSelectedModelParams(),
        stream: true,
      }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
    }

    return sseStreamToGenerator(response, { signal: abortSignal })
  }

  const conversationApi = useConversation({
    storage: localStorageStrategyFactory({ key: CONVERSATION_STORAGE_KEY }),
    autoSaveMessages: true,
    useMessageOptions: {
      responseProvider,
      initialMessages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
      ],
      plugins: [
        toolPlugin({
          getTools: async () => {
            const tools = await mcpStore.getEnabledTools()
            return tools.map((tool) => ({
              type: 'function' as const,
              function: {
                name: tool.fullName,
                description: tool.description,
                parameters: tool.inputSchema,
              },
            }))
          },
          callTool: async (toolCall) => {
            const toolName = toolCall.function?.name
            if (!toolName) {
              throw new Error('Missing MCP tool name.')
            }

            let args: Record<string, unknown> = {}
            try {
              args = JSON.parse(toolCall.function?.arguments || '{}') as Record<string, unknown>
            } catch {
              throw new Error(`Invalid tool arguments for "${toolName}".`)
            }

            return await mcpStore.callTool(toolName, args)
          },
        }),
        {
          onError({ currentTurn, error }) {
            console.error(error)
            currentTurn[currentTurn.length - 1].content = String(error)
          },
        },
      ],
    },
    onLoad(loadedConversations) {
      if (conversationApi.activeConversationId.value) {
        return
      }

      const nextConversationId =
        storedActiveConversationId && loadedConversations.some((item) => item.id === storedActiveConversationId)
          ? storedActiveConversationId
          : loadedConversations[0]?.id

      if (nextConversationId) {
        void conversationApi.switchConversation(nextConversationId)
      }
    },
  })

  const messages = computed(() => conversationApi.activeConversation.value?.engine.messages.value || [])
  const visibleMessages = computed(() => messages.value.filter((item) => item.role !== 'system'))
  const isProcessing = computed(() => conversationApi.activeConversation.value?.engine.isProcessing.value ?? false)
  const currentConversationTitle = computed(
    () => conversationApi.activeConversation.value?.title || DEFAULT_CONVERSATION_TITLE,
  )

  watch(conversationApi.activeConversationId, (conversationId) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!conversationId) {
      window.localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, conversationId)
  })

  async function startNewConversation() {
    await conversationApi.abortActiveRequest().catch(() => {})
    conversationApi.activeConversationId.value = null
    inputMessage.value = ''
  }

  function syncConversationTitle(content: string) {
    const activeConversation = conversationApi.activeConversation.value
    if (!activeConversation) {
      return
    }

    const hasMessages = hasVisibleMessages(activeConversation.engine.messages.value)
    if (!hasMessages || activeConversation.title === DEFAULT_CONVERSATION_TITLE) {
      conversationApi.updateConversationTitle(activeConversation.id, createConversationTitle(content))
    }
  }

  async function sendMessage(content: string) {
    const value = content.trim()
    if (!value || isProcessing.value || !modelStore.hasApiConfig.value) {
      return
    }

    let targetConversationId = conversationApi.activeConversationId.value
    if (!targetConversationId) {
      const conversation = conversationApi.createConversation({
        title: createConversationTitle(value),
      })
      targetConversationId = conversation.id
      await conversationApi.switchConversation(conversation.id)
    } else {
      syncConversationTitle(value)
    }

    if (!targetConversationId) {
      return
    }

    conversationApi.sendMessage(value)
    inputMessage.value = ''
  }

  async function abortRequest() {
    await conversationApi.abortActiveRequest()
  }

  return {
    ...conversationApi,
    inputMessage,
    messages,
    visibleMessages,
    isProcessing,
    currentConversationTitle,
    sendMessage,
    abortRequest,
    startNewConversation,
    ...modelStore,
  }
}

type ChatStore = ReturnType<typeof createChatStore>
let chatStore: ChatStore | null = null

export function useChat() {
  if (!chatStore) {
    chatStore = createChatStore()
  }

  return chatStore
}
