<template>
  <div class="chat-demo-container">
    <TrChat.Root :chat-kit="chatKit" v-bind="slices.root">
      <TrChat.Layout v-bind="{ ...slices.layout, ...slices.appearance }">
        <TrChat.Header v-bind="slices.header" />

        <TrChat.Welcome
          v-if="chatKit.messages.value.length === 0 && slices.welcome"
          v-bind="slices.welcome"
          @prompt-click="chatKit.sendMessage($event)"
        />

        <TrChat.MessageList v-else v-bind="slices.messageList" />

        <TrChat.Footer>
          <TrChat.Sender v-bind="slices.sender">
            <template #footer>
              <div class="advanced-footer-tools">
                <TrModelSelector
                  v-if="slices.modelSelector.enabled"
                  v-model="selectedModel"
                  :models="slices.modelSelector.models"
                />
                <TrMcpTrigger />
              </div>
            </template>
          </TrChat.Sender>
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  TrChat,
  TrMcpTrigger,
  TrModelSelector,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
} from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider } from './shared'

const mcpManager = createDemoMcpManager()
const chatConfig = createDemoChatConfig({
  runtime: {
    mcpManager,
  },
  ui: {
    brand: {
      title: 'adapter / preset 工具链',
    },
    welcome: {
      title: '先生成 slices，再自己装配页面',
      description: '这个示例直接消费 createChatAdapterFromConfig / createPresetChatProps / createPresetChatSlices。',
    },
  },
})

const adapter = createChatAdapterFromConfig(chatConfig)
const presetProps = createPresetChatProps(adapter)
const slices = createPresetChatSlices(presetProps)
const selectedModel = ref(slices.modelSelector.defaultModel ?? chatConfig.defaults?.model ?? 'deepseek-chat')

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('adapter / preset', {
    getModelId: () => selectedModel.value,
  }),
})

watch(selectedModel, (value) => {
  if (!value) {
    return
  }

  chatKit.updateResponseProvider(
    createMockResponseProvider('adapter / preset', {
      getModelId: () => value,
    }),
  )
})
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.advanced-footer-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
