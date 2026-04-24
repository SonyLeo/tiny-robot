<template>
  <div class="sender-extensions-grid">
    <div data-testid="chat-sender-extensions-granular" class="chat-wrapper">
      <TrChat.Root :runtime="granularResolution.runtime" :ui="granularResolution.ui">
        <TrChat.Layout
          :appearance="granularResolution.ui.appearance"
          :content-layout="granularResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularResolution.ui.brand?.title" />

          <TrChat.Welcome
            v-if="showSenderExtensionsGranularWelcome"
            :compatibility-relay="false"
            :title="granularResolution.ui.welcome?.title"
            :description="granularResolution.ui.welcome?.description"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender :extensions="senderSuggestionExtensions" placeholder="Type ECS to trigger suggestions..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-sender-extensions-provider" class="chat-wrapper">
      <TrChat.Provider :response-provider="senderExtensionsProviderResponseProvider">
        <TrChat.Layout>
          <TrChat.Header title="Sender Extensions Provider" />

          <TrChat.MessageList auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender :extensions="senderSuggestionExtensions" placeholder="Type ECS to trigger suggestions..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createMockProvider } from '../mockProvider'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'
import { useSceneWelcomeState } from './useSceneWelcomeState'

const senderExtensionSuggestions = [
  { content: 'ECS instance startup issue' },
  { content: 'ECS backup restore workflow' },
  { content: 'ECS monitoring alert setup' },
]

const senderSuggestionExtensions = [TrSender.suggestion(senderExtensionSuggestions)]

const senderExtensionsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Sender Extensions Granular',
    welcomeTitle: 'Sender Extensions',
    welcomeDescription: 'Type ECS in the sender to verify TrChat.Sender extensions on the granular path.',
  }),
)

const granularResolution = useStableSceneRuntime(senderExtensionsConfig)
const senderExtensionsProviderResponseProvider = createMockProvider({
  provider: 'sender-extensions-provider',
  model: 'sender-extensions-model',
})
const showSenderExtensionsGranularWelcome = useSceneWelcomeState(granularResolution)
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
