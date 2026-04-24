<template>
  <div data-testid="chat-welcome-prompts" class="welcome-prompts-grid">
    <div data-testid="chat-welcome-prompts-enabled" class="chat-wrapper">
      <TrChat :config="enabledPromptsConfig" />
    </div>

    <div data-testid="chat-welcome-prompts-disabled" class="chat-wrapper">
      <TrChat :config="disabledPromptsConfig" />
    </div>

    <div data-testid="chat-welcome-prompts-override" class="chat-wrapper">
      <TrChat :config="overridePromptsConfig" />
    </div>

    <div data-testid="chat-welcome-prompts-slot" class="chat-wrapper">
      <TrChat :config="enabledPromptsConfig">
        <template #welcome>
          <div data-testid="welcome-slot-content">Custom welcome slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-welcome-prompts-whitebox" class="chat-wrapper">
      <TrChat.Root :runtime="whiteboxResolution.runtime" :ui="whiteboxResolution.ui">
        <TrChat.Page />
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'

const enabledPrompts = [
  { label: 'feature prompt 1', description: 'feature prompt 1' },
  { label: 'feature prompt 2', description: 'feature prompt 2' },
  { label: 'feature prompt 3', description: 'feature prompt 3' },
]

const enabledPromptsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Welcome Prompts Official',
    welcomeTitle: 'Welcome Prompts Official',
    welcomeDescription: 'Official ui.welcome.prompts should render on the TrChat path.',
    welcomePrompts: enabledPrompts,
  }),
)

const disabledPromptsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Welcome Prompts Disabled',
    welcomeTitle: 'Welcome Prompts Disabled',
    welcomeDescription: 'An empty official prompt list should leave the welcome surface without prompt items.',
    welcomePrompts: [],
  }),
)

const overridePromptsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Welcome Prompts Override',
    welcomeTitle: 'Welcome Prompts Override',
    welcomeDescription: 'A scene-local official prompt set should replace the default prompt list.',
    welcomePrompts: [{ label: 'override prompt', description: 'override prompt' }],
  }),
)

const whiteboxConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Welcome Prompts Root + Page',
    welcomeTitle: 'Welcome Prompts Root + Page',
    welcomeDescription: 'Official Root + Page should preserve ui.welcome.prompts and welcome transition behavior.',
    welcomePrompts: enabledPrompts,
  }),
)

const whiteboxResolution = useStableSceneRuntime(whiteboxConfig)
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
