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
          <TrChat.Sender v-bind="slices.sender" />
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import {
  TrChat,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
} from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
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

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('adapter / preset'),
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
</style>
