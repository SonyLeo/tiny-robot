<script setup lang="ts">
import { inject, computed, Component, h, ref } from 'vue'
import { TrChat, TrChatFeedback, TrModelSelector, CHAT_KIT_KEY } from '@opentiny/tiny-robot-chat'
import { BubbleProvider, TrAttachments, UploadButton } from '@opentiny/tiny-robot'
import type { PromptProps, BubbleListProps, Attachment } from '@opentiny/tiny-robot'
import { boxRendererMatches, contentRendererMatches, roles as baseRoles } from '../composables/useBubbleConfig'

interface Props {
  title: string
  welcomeIcon: Component
  welcomeTitle: string
  welcomeDescription: string
  prompts: PromptProps[]
  selectedModel: string
  availableModels: string[]
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  bubbleListProps?: Record<string, unknown>
  mcpPanelVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  groupStrategy: () => 'consecutive' as const,
  mcpPanelVisible: false,
})

const mergedRoleConfigs = computed(() => {
  const configs = props.roleConfigs || {}
  return {
    assistant: {
      ...baseRoles.assistant,
      ...configs.assistant,
    },
    user: {
      ...baseRoles.user,
      ...configs.user,
    },
  }
})

const renderWelcomeIcon = () => {
  return h(props.welcomeIcon, { style: { fontSize: '38px' } })
}

const emit = defineEmits<{
  'update:selectedModel': [value: string]
  'toggle-mcp-panel': []
}>()

const chatKit = inject(CHAT_KIT_KEY)!
const showWelcome = computed(() => chatKit.messages.value.length === 0)

// Attachments state
const attachments = ref<Attachment[]>([])

function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

function handleFileSelect(files: File[]) {
  files.forEach((file) => {
    attachments.value.push({ rawFile: file, url: URL.createObjectURL(file) })
  })
}

function handleEditMessage(messageIndexes: number[]) {
  if (!messageIndexes?.length) return
  const message = chatKit.messages.value[messageIndexes[0]]
  if (message) {
    if (!message.state) message.state = {}
    message.state.isEditing = true
  }
}

function isMessageEditing(messageIndexes: number[]): boolean {
  if (!messageIndexes?.length) return false
  const message = chatKit.messages.value[messageIndexes[0]]
  return message?.state?.isEditing === true
}

function handleToggleMcpPanel() {
  emit('toggle-mcp-panel')
}
</script>

<template>
  <div class="tr-chat">
    <TrChat.Header :title="props.title" show-history>
      <template #extra>
        <div class="header-controls">
          <button
            class="mcp-toggle-btn"
            :title="props.mcpPanelVisible ? 'Hide MCP Panel' : 'Show MCP Panel'"
            @click="handleToggleMcpPanel"
          >
            <svg
              fill="currentColor"
              fill-rule="evenodd"
              height="1em"
              style="flex: none; line-height: 1"
              viewBox="0 0 24 24"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>ModelContextProtocol</title>
              <path
                d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z"
              ></path>
              <path
                d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z"
              ></path>
            </svg>
          </button>
          <TrModelSelector
            :model-value="props.selectedModel"
            :models="props.availableModels"
            @update:model-value="emit('update:selectedModel', $event)"
          />
        </div>
      </template>
    </TrChat.Header>

    <div v-if="showWelcome" class="tr-chat__welcome-area">
      <TrChat.Welcome
        :title="props.welcomeTitle"
        :icon="renderWelcomeIcon"
        :description="props.welcomeDescription"
        :prompts="props.prompts"
        @prompt-click="handlePromptClick"
      />
    </div>
    <BubbleProvider
      v-else
      :box-renderer-matches="boxRendererMatches"
      :content-renderer-matches="contentRendererMatches"
    >
      <TrChat.MessageList :role-configs="mergedRoleConfigs" :group-strategy="props.groupStrategy" auto-scroll>
        <template #after="slotProps">
          <TrChatFeedback
            v-if="!isMessageEditing(slotProps.messageIndexes)"
            v-bind="slotProps"
            @edit="handleEditMessage(slotProps.messageIndexes)"
            style="margin-top: 6px"
          />
        </template>
      </TrChat.MessageList>
    </BubbleProvider>

    <TrChat.Footer>
      <div class="tr-chat-footer-wrapper">
        <!-- Attachments display area -->
        <div v-if="attachments.length > 0" class="tr-chat-attachments-area">
          <TrAttachments v-model:items="attachments" variant="card" :wrap="true" />
        </div>
        <!-- Sender with upload button -->
        <TrChat.Sender>
          <template #footer-right>
            <UploadButton
              tooltip="上传文件"
              tooltip-placement="top"
              :multiple="true"
              accept="*"
              @select="handleFileSelect"
            />
          </template>
        </TrChat.Sender>
      </div>
    </TrChat.Footer>
    <TrChat.History />
  </div>
</template>
<style>
.tr-bubble__box[data-role='user'] {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

.tr-bubble__box[data-editing='true'] {
  --tr-bubble-box-bg: transparent;
  width: 50% !important;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcp-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--tr-color-border);
  border-radius: 4px;
  background: var(--tr-color-bg-default);
  color: var(--tr-color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mcp-toggle-btn:hover {
  background: var(--tr-color-bg-hover);
  border-color: var(--tr-color-border-hover);
}

.mcp-toggle-btn:active {
  background: var(--tr-color-bg-active);
}

.tr-chat-footer-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-chat-attachments-area {
  padding: 8px 12px;
  border-top: 1px solid var(--tr-color-border);
  background: var(--tr-color-bg-default);
}
</style>
