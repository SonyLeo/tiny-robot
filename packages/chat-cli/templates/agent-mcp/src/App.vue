<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TrChat,
  TrChatFeedback,
  TrChatMcpPanel,
  TrModelSelector,
  useChatKit,
  useModelSelector,
} from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import { chatAdapter, chatCapabilitySurface, chatPlugins, chatStorage } from './lib/chat'

const slices = chatCapabilitySurface.presetSlices
const initialModel = slices.modelSelector.defaultModel ?? slices.modelSelector.models?.[0]?.value ?? ''
const selectedModel = ref(initialModel)
const mcpPanelVisible = ref(false)

const chatKit = useChatKit({
  responseProvider: chatAdapter.createResponseProvider(initialModel || undefined),
  plugins: chatPlugins,
  storage: chatStorage,
})

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models: computed(() => slices.modelSelector.models ?? []),
  providerFactories: computed(() => slices.modelSelector.providerFactories ?? []),
  chatKit,
})

const showWelcome = computed(() => chatKit.messages.value.length === 0)

function handlePromptClick(description: string) {
  chatKit.sendMessage(description)
}

function handleModelChange(model: ModelOption) {
  selectModel(model)
}
</script>

<template>
  <div class="app-shell">
    <TrChat.Root :chat-kit="chatKit" v-bind="slices.root">
      <TrChat.Layout v-bind="slices.layout">
        <TrChat.Header v-bind="slices.header">
          <template #extra>
            <button class="mcp-toggle" type="button" @click="mcpPanelVisible = true">MCP</button>
          </template>
        </TrChat.Header>

        <TrChat.Welcome
          v-if="showWelcome && slices.welcome"
          v-bind="slices.welcome"
          @prompt-click="handlePromptClick"
        />

        <TrChat.MessageList v-else v-bind="slices.messageList">
          <template v-if="slices.messageList.showFeedback" #after="slotProps">
            <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
          </template>
        </TrChat.MessageList>

        <TrChat.Footer>
          <template v-if="slices.modelSelector.enabled && slices.modelSelector.models?.length" #extra>
            <div class="app-footer-tools">
              <TrModelSelector
                v-model="selectedModel"
                :models="slices.modelSelector.models"
                :provider-factories="slices.modelSelector.providerFactories"
                @change="handleModelChange"
              />
            </div>
          </template>

          <div class="app-footer-stack">
            <TrChat.Attachments />
            <TrChat.Sender v-bind="slices.sender" />
          </div>
        </TrChat.Footer>

        <TrChat.History v-if="slices.history.enabled" v-bind="slices.history.props" />
        <TrChatMcpPanel :visible="mcpPanelVisible" @update:visible="mcpPanelVisible = $event" />
      </TrChat.Layout>
    </TrChat.Root>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
}

.app-footer-tools {
  display: flex;
  justify-content: flex-end;
}

.app-footer-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mcp-toggle {
  border: 1px solid #d0d7e2;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 6px 12px;
}
</style>
