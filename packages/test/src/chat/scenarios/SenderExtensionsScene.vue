<template>
  <div class="sender-extensions-grid">
    <div data-testid="chat-sender-extensions-blackbox" class="chat-wrapper">
      <TrChat
        :brand="{ title: 'Sender Extensions Blackbox' }"
        :welcome="senderExtensionsWelcome"
        :response-provider="senderExtensionsProvider"
        :sender-props="{
          extensions: senderSuggestionExtensions,
          placeholder: 'Type ECS to trigger suggestions...',
        }"
      />
    </div>

    <div data-testid="chat-sender-extensions-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="senderExtensionsWhiteboxChat">
        <TrChat.Layout :fullscreen="false">
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
import { TrChat, useChatKit } from '../../../../chat/src'
import { createMockProvider } from '../mockProvider'

const senderExtensionSuggestions = [
  { content: 'ECS instance startup issue' },
  { content: 'ECS backup restore workflow' },
  { content: 'ECS monitoring alert setup' },
]

const senderSuggestionExtensions = [TrSender.suggestion(senderExtensionSuggestions)]

const senderExtensionsWelcome = {
  title: 'Sender Extensions',
  description: 'Type ECS in the sender to verify senderProps.extensions passthrough.',
}

const senderExtensionsProvider = createMockProvider({
  provider: 'openai',
  model: 'sender-extensions-model',
})

const senderExtensionsWhiteboxChat = useChatKit({
  responseProvider: senderExtensionsProvider,
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
