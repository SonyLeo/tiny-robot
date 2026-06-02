<template>
  <div class="layout-assistant-demo">
    <TrLayout
      class="layout-assistant-demo__layout"
      :left-aside="leftAside"
      :right-aside="rightAside"
      @update:left-aside="updateLeftAside"
      @update:right-aside="updateRightAside"
    >
      <template #header>
        <Header :context="context" />
      </template>

      <template #left-aside>
        <TrLayout.Aside placement="left" v-slot="{ isExpanded }">
          <Sidebar :context="context" :is-expanded="isExpanded" />
        </TrLayout.Aside>
      </template>

      <template #main>
        <TrLayout.Main :scroll-host="scrollHostRef">
          <Main :context="context" />
        </TrLayout.Main>
      </template>

      <template #footer>
        <Footer :context="context" />
      </template>

      <template #right-aside>
        <TrLayout.Aside placement="right">
          <Panel :context="context" />
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>

<script setup lang="ts">
import type { BubbleRoleConfig, PromptProps, SuggestionItem, UserItem } from '@opentiny/tiny-robot'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideConfig, LayoutMainScrollHost } from '@opentiny/tiny-robot'
import type { ConversationInfo, UseMessageOptions } from '@opentiny/tiny-robot-kit'
import { toolPlugin, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconEdit, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, markRaw, nextTick, onMounted, ref } from 'vue'
import {
  DROPDOWN_MENU_ITEMS,
  PILL_ITEMS_CONFIG,
  PROMPT_ITEMS_DATA,
  suggestionPopoverData,
  templateSuggestions,
} from '../assistantConstants'
import { callMcpTool, MCP_TOOLS } from '../mockMcp'
import { assistantResponseProvider } from '../responseProvider'
import Footer from './Footer.vue'
import Header from './Header.vue'
import Main from './Main.vue'
import Panel from './Panel.vue'
import Sidebar from './Sidebar.vue'
import type { LayoutAssistantContext } from './context'

const leftAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 260,
  collapsedWidth: 52,
  resizable: true,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
})

const rightAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 288,
  collapsedWidth: 0,
  resizable: true,
  minExpandedWidth: 240,
  maxExpandedWidth: 380,
})

const scrollHostRef = ref<LayoutMainScrollHost>(null)

const aiAvatar = h(IconAi, { class: 'layout-assistant-demo__bubble-avatar' })
const userAvatar = h(IconUser, { class: 'layout-assistant-demo__bubble-avatar' })
const promptItems: PromptProps[] = PROMPT_ITEMS_DATA.map((item, index) => ({
  id: `prompt-${index + 1}`,
  ...item,
  icon: h('span', { class: 'layout-assistant-demo__prompt-emoji' }, item.emoji),
}))

const dropdownMenuItems = DROPDOWN_MENU_ITEMS
const popoverData = suggestionPopoverData

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  sendMessage: sendToActiveConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: assistantResponseProvider as UseMessageOptions['responseProvider'],
    plugins: [
      toolPlugin({
        getTools: async () => MCP_TOOLS,
        callTool: async (toolCall) => {
          const args = JSON.parse(toolCall.function?.arguments || '{}')
          return callMcpTool(toolCall.function?.name || '', args)
        },
      }),
    ],
  },
})

const historyData = computed(() =>
  conversations.value.map((item) => ({
    ...item,
    title: item.title || '',
  })),
)

const currentConversationTitle = computed(() => activeConversation.value?.title || '新会话')
const messageEngine = computed(() => activeConversation.value?.engine)
const messages = computed(() => messageEngine.value?.messages.value || [])
const isProcessing = computed(() => messageEngine.value?.isProcessing.value ?? false)

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}

const inputMessage = ref('')
const currentTemplate = ref<UserItem[]>([])
const senderRef = ref<{ focus?: () => void; activateTemplateFirstField?: () => void } | null>(null)

const sendMessage = (content: string) => {
  if (!activeConversationId.value) {
    createConversation({ title: content.slice(0, 10) })
  }
  sendToActiveConversation(content)
}

const handlePromptItemClick = (_event: unknown, item: { description?: string }) => {
  if (!item.description) return
  sendMessage(item.description)
}

const handleNewConversation = () => {
  activeConversationId.value = null
}

const handleHistorySelect = (item: ConversationInfo) => {
  switchConversation(item.id)
}

const updateLeftAside = (next?: LayoutAsideConfig) => {
  leftAside.value = next ?? {}
}

const updateRightAside = (next?: LayoutAsideConfig) => {
  rightAside.value = next ?? {}
}

const handleSendMessage = (textContent: string) => {
  sendMessage(textContent)
  inputMessage.value = ''
  clearTemplate()
}

const clearTemplate = () => {
  currentTemplate.value = []
  nextTick(() => {
    senderRef.value?.focus()
  })
}

const handleFillTemplate = (template: UserItem[]) => {
  currentTemplate.value = template
  inputMessage.value = ''
  nextTick(() => {
    senderRef.value?.activateTemplateFirstField()
  })
}

const handlePopoverItemClick = (item: SuggestionItem) => {
  sendMessage(item.text)
}

const pillItems = computed(() =>
  PILL_ITEMS_CONFIG.map((config) => {
    const base = { text: config.text, icon: markRaw(IconEdit) }
    if (config.type === 'dropdown') {
      return {
        ...base,
        menu: {
          items: dropdownMenuItems,
          onItemClick: (item: unknown) => sendMessage((item as { text: string }).text),
        },
      }
    }
    const [start, end] = config.range
    const items = end !== undefined ? templateSuggestions.slice(start, end) : templateSuggestions.slice(start)
    return {
      ...base,
      menu: {
        items,
        onItemClick: (item: unknown) => handleFillTemplate((item as { template: UserItem[] }).template),
      },
    }
  }),
)

onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})

const context: LayoutAssistantContext = {
  promptItems,
  popoverData,
  get pillItems() {
    return pillItems.value
  },
  roles,
  get historyData() {
    return historyData.value
  },
  get activeConversationId() {
    return activeConversationId.value
  },
  set activeConversationId(value) {
    activeConversationId.value = value
  },
  get currentConversationTitle() {
    return currentConversationTitle.value
  },
  get messages() {
    return messages.value
  },
  get isProcessing() {
    return isProcessing.value
  },
  get inputMessage() {
    return inputMessage.value
  },
  get currentTemplate() {
    return currentTemplate.value
  },
  setInputMessage(value) {
    inputMessage.value = value
  },
  setCurrentTemplate(value) {
    currentTemplate.value = value
  },
  senderRef,
  scrollHostRef,
  handlePromptItemClick,
  handleNewConversation,
  handleHistorySelect,
  handleSendMessage,
  handlePopoverItemClick,
  abortActiveRequest,
  clearTemplate,
}
</script>

<style src="./layout-workspace.css"></style>
