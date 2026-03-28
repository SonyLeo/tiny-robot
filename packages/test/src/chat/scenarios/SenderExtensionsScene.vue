<template>
  <div class="sender-extensions-grid">
    <div data-testid="chat-sender-extensions-blackbox" class="chat-wrapper">
      <TrChat :config="senderExtensionsConfig" :preset-overrides="senderExtensionsBlackboxOverrides" />
    </div>

    <div data-testid="chat-sender-extensions-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="senderExtensionsWhiteboxChat">
        <TrChat.Layout>
          <TrChat.Header title="Sender Extensions Whitebox" />

          <TrChat.Welcome
            v-if="showSenderExtensionsWhiteboxWelcome"
            title="Sender Extensions"
            description="White-box passthrough verification for senderProps.extensions."
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender :extensions="senderSuggestionExtensions" placeholder="Type ECS to trigger suggestions..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { TrChat, createChatAdapterFromConfig, useChatKit } from '@opentiny/tiny-robot-chat'
import { createChatSceneConfig } from './sharedDemoFixtures'

const senderExtensionSuggestions = [
  { content: 'ECS instance startup issue' },
  { content: 'ECS backup restore workflow' },
  { content: 'ECS monitoring alert setup' },
]

const senderSuggestionExtensions = [TrSender.suggestion(senderExtensionSuggestions)]

const senderExtensionsConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Sender Extensions Blackbox',
    },
    welcome: {
      title: 'Sender Extensions',
      description: 'Type ECS in the sender to verify senderProps.extensions passthrough.',
    },
  },
})

const senderExtensionsBlackboxOverrides = {
  senderProps: {
    extensions: senderSuggestionExtensions,
    placeholder: 'Type ECS to trigger suggestions...',
  },
}

const senderExtensionsAdapter = createChatAdapterFromConfig(senderExtensionsConfig)
const senderExtensionsWhiteboxChat = useChatKit({
  responseProvider: senderExtensionsAdapter.createResponseProvider(),
})
const showSenderExtensionsWhiteboxWelcome = computed(() => senderExtensionsWhiteboxChat.messages.value.length === 0)
</script>

<style scoped>
.sender-extensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}
</style>
