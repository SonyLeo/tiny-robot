<template>
  <div data-testid="chat-welcome-prompts" class="welcome-prompts-grid">
    <div data-testid="chat-welcome-prompts-enabled" class="chat-wrapper">
      <TrChat :config="welcomePromptsConfig" />
    </div>

    <div data-testid="chat-welcome-prompts-disabled" class="chat-wrapper">
      <TrChat :config="disabledWelcomePromptsConfig" />
    </div>

    <div data-testid="chat-welcome-prompts-override" class="chat-wrapper">
      <TrChat :config="welcomePromptsConfig" :preset-overrides="overrideWelcomePromptsBlackboxOverrides" />
    </div>

    <div data-testid="chat-welcome-prompts-slot" class="chat-wrapper">
      <TrChat :config="welcomePromptsConfig">
        <template #welcome>
          <div data-testid="welcome-slot-content">Custom welcome slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-welcome-prompts-whitebox" class="chat-wrapper">
      <TrChat.Provider :chat-kit="whiteboxWelcomePromptsChat" v-bind="whiteboxWelcomePromptsSlices.provider">
        <TrChat.Layout v-bind="{ ...whiteboxWelcomePromptsSlices.layout, ...whiteboxWelcomePromptsSlices.appearance }">
          <TrChat.Header v-bind="whiteboxWelcomePromptsSlices.header" />

          <TrChat.Welcome
            v-if="showWhiteboxWelcomePrompts && whiteboxWelcomePromptsSlices.welcome"
            v-bind="whiteboxWelcomePromptsSlices.welcome"
            @prompt-click="handleWhiteboxWelcomePromptClick"
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender
              v-bind="whiteboxWelcomePromptsSlices.sender"
              placeholder="Whitebox welcome prompts test..."
            />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  TrChat,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
} from '@opentiny/tiny-robot-chat'
import { createChatSceneConfig } from './sharedDemoFixtures'

const welcomePromptsConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Welcome Prompts Test',
    },
    welcome: {
      title: 'Welcome Prompts',
      description: 'Verify welcomePrompts feature -> preset -> TrChat flow.',
    },
    prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
  },
  features: {
    welcomePrompts: {
      welcome: [
        { label: 'feature prompt 1', description: 'feature prompt 1' },
        { label: 'feature prompt 2', description: 'feature prompt 2' },
        { label: 'feature prompt 3', description: 'feature prompt 3' },
      ],
    },
  },
})

const disabledWelcomePromptsConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Welcome Prompts Disabled Test',
    },
    welcome: {
      title: 'Welcome Prompts Disabled',
      description: 'Verify disabled welcomePrompts clears all prompts.',
    },
    prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
  },
  features: {
    welcomePrompts: false,
  },
})

const overrideWelcomePromptsBlackboxOverrides = {
  prompts: [{ label: 'override prompt', description: 'override prompt' }],
}

const whiteboxWelcomePromptsAdapter = createChatAdapterFromConfig(welcomePromptsConfig)
const whiteboxWelcomePromptsPreset = createPresetChatProps(whiteboxWelcomePromptsAdapter)
const whiteboxWelcomePromptsSlices = createPresetChatSlices(whiteboxWelcomePromptsPreset)
const whiteboxWelcomePromptsChat = useChatKit({
  responseProvider: whiteboxWelcomePromptsAdapter.createResponseProvider(),
})
const showWhiteboxWelcomePrompts = computed(() => whiteboxWelcomePromptsChat.messages.value.length === 0)

function handleWhiteboxWelcomePromptClick(description: string) {
  whiteboxWelcomePromptsChat.sendMessage(description)
}
</script>

<style scoped>
.welcome-prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}
</style>
