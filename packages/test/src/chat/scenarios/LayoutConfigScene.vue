<template>
  <div class="scene-grid">
    <div data-testid="chat-layout-config-trchat" class="chat-wrapper">
      <TrChat :config="wideTrChatConfig" />
    </div>

    <div data-testid="chat-layout-config-whitebox" class="chat-wrapper">
      <TrChat.Root :runtime="wideWhiteboxResolution.runtime" :ui="wideWhiteboxResolution.ui">
        <TrChat.Page />
      </TrChat.Root>
    </div>

    <div data-testid="chat-layout-workspace-trchat" class="chat-wrapper">
      <TrChat :config="centeredTrChatConfig" />
    </div>

    <div data-testid="chat-layout-workspace-whitebox" class="chat-wrapper">
      <TrChat.Root :runtime="centeredGranularResolution.runtime" :ui="centeredGranularResolution.ui">
        <TrChat.Layout
          :appearance="centeredGranularResolution.ui.appearance"
          :content-layout="centeredGranularResolution.ui.contentLayout"
        >
          <TrChat.Header :title="centeredGranularResolution.ui.brand?.title" />
          <TrChat.Welcome
            v-if="showCenteredGranularWelcome"
            :title="centeredGranularResolution.ui.welcome?.title"
            :description="centeredGranularResolution.ui.welcome?.description"
            :prompts="centeredGranularResolution.ui.welcome?.prompts"
            @prompt-click="centeredGranularResolution.runtime.conversation.send({ text: $event })"
          />
          <TrChat.MessageList v-else variant="bubble" />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <!-- 7.5: light mode -->
    <div data-testid="chat-layout-appearance-light" class="chat-wrapper">
      <TrChat :config="lightTrChatConfig" />
    </div>

    <!-- 7.5: system mode -->
    <div data-testid="chat-layout-appearance-system" class="chat-wrapper">
      <TrChat :config="systemTrChatConfig" />
    </div>

    <!-- 7.5: no appearance mode (no ThemeProvider) -->
    <div data-testid="chat-layout-appearance-none" class="chat-wrapper">
      <TrChat :config="noAppearanceTrChatConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'
import { useSceneWelcomeState } from './useSceneWelcomeState'

const wideTrChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout Wide TrChat',
    welcomeTitle: 'Layout Wide TrChat',
    welcomeDescription: 'Official TrChat path should honor wide content layout and explicit appearance mode.',
    contentLayout: 'wide',
    appearanceMode: 'dark',
  }),
)

const wideWhiteboxConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout Wide Root + Page',
    welcomeTitle: 'Layout Wide Root + Page',
    welcomeDescription: 'Official Root + Page path should honor the same wide content layout.',
    contentLayout: 'wide',
    appearanceMode: 'dark',
  }),
)

const centeredTrChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout Centered TrChat',
    welcomeTitle: 'Layout Centered TrChat',
    welcomeDescription: 'Official TrChat path should keep centered layout as the default content boundary.',
    contentLayout: 'centered',
  }),
)

const centeredGranularConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout Centered Root + primitives',
    welcomeTitle: 'Layout Centered Root + primitives',
    welcomeDescription: 'Official granular path should keep centered layout without old layout.variant or placements.',
    contentLayout: 'centered',
  }),
)

const wideWhiteboxResolution = useStableSceneRuntime(wideWhiteboxConfig)
const centeredGranularResolution = useStableSceneRuntime(centeredGranularConfig)
const showCenteredGranularWelcome = useSceneWelcomeState(centeredGranularResolution)

const lightTrChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout Light TrChat',
    welcomeTitle: 'Layout Light TrChat',
    welcomeDescription: 'Official TrChat path should honor explicit light appearance mode.',
    appearanceMode: 'light',
  }),
)

const systemTrChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout System TrChat',
    welcomeTitle: 'Layout System TrChat',
    welcomeDescription: 'Official TrChat path should honor system appearance mode (auto).',
    appearanceMode: 'system',
  }),
)

const noAppearanceTrChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Layout No Appearance TrChat',
    welcomeTitle: 'Layout No Appearance TrChat',
    welcomeDescription: 'Without an appearance mode, no ThemeProvider should be rendered.',
  }),
)
</script>

<style scoped>
.scene-grid {
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
