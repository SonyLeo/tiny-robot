import type {
  BubbleRoleConfig,
  LayoutMainScrollHost,
  PromptProps,
  SuggestionGroup,
  UserItem,
} from '@opentiny/tiny-robot'
import type { ConversationInfo } from '@opentiny/tiny-robot-kit'
import type { Ref } from 'vue'

export interface LayoutAssistantContext {
  promptItems: PromptProps[]
  popoverData: SuggestionGroup[]
  pillItems: Array<{
    text: string
    menu: {
      items: unknown[]
      onItemClick: (item: unknown) => void
    }
  }>
  roles: Record<string, BubbleRoleConfig>
  historyData: Array<ConversationInfo & { title: string }>
  activeConversationId: string | null
  currentConversationTitle: string
  messages: unknown[]
  isProcessing: boolean
  inputMessage: string
  currentTemplate: UserItem[]
  setInputMessage: (value: string) => void
  setCurrentTemplate: (value: UserItem[]) => void
  senderRef: Ref<{ focus?: () => void; activateTemplateFirstField?: () => void } | null>
  scrollHostRef: Ref<LayoutMainScrollHost>
  handlePromptItemClick: (ev: unknown, item: { description?: string }) => void
  handleNewConversation: () => void
  handleHistorySelect: (item: ConversationInfo) => void
  handleSendMessage: (textContent: string) => void
  handlePopoverItemClick: (item: { text: string }) => void
  abortActiveRequest: () => void
  clearTemplate: () => void
}
