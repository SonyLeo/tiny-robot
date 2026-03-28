<template>
  <div class="scene-grid">
    <div data-testid="chat-layout-config-blackbox" class="chat-wrapper">
      <TrChat :config="layoutConfigConfig" />
    </div>

    <div data-testid="chat-layout-config-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="layoutConfigWhiteboxChat" v-bind="layoutConfigWhiteboxSlices.root">
        <TrChat.Layout v-bind="{ ...layoutConfigWhiteboxSlices.layout, ...layoutConfigWhiteboxSlices.appearance }">
          <TrChat.Header v-bind="layoutConfigWhiteboxSlices.header" />
          <TrChat.Welcome
            v-if="showLayoutConfigWhiteboxWelcome && layoutConfigWhiteboxSlices.welcome"
            v-bind="layoutConfigWhiteboxSlices.welcome"
            @prompt-click="handleLayoutConfigWhiteboxPromptClick"
          />
          <TrChat.MessageList v-else v-bind="layoutConfigWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="layoutConfigWhiteboxSlices.sender" />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-layout-workspace-blackbox" class="chat-wrapper">
      <TrChat :config="workspaceLayoutConfig" />
    </div>

    <div data-testid="chat-layout-workspace-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="workspaceLayoutWhiteboxChat" v-bind="workspaceLayoutWhiteboxSlices.root">
        <TrChat.Layout
          v-bind="{ ...workspaceLayoutWhiteboxSlices.layout, ...workspaceLayoutWhiteboxSlices.appearance }"
        >
          <TrChat.Header v-bind="workspaceLayoutWhiteboxSlices.header" />
          <TrChat.Welcome
            v-if="showWorkspaceLayoutWhiteboxWelcome && workspaceLayoutWhiteboxSlices.welcome"
            v-bind="workspaceLayoutWhiteboxSlices.welcome"
            @prompt-click="handleWorkspaceLayoutWhiteboxPromptClick"
          />
          <TrChat.MessageList v-else v-bind="workspaceLayoutWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="workspaceLayoutWhiteboxSlices.sender" />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
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

const darkAppearance = { mode: 'dark' } as const

const layoutConfigConfig = createChatSceneConfig({
  appearance: {
    mode: darkAppearance.mode,
  },
  ui: {
    brand: {
      title: 'Layout Config',
    },
    welcome: {
      title: 'Layout Config Welcome',
      description: 'Layout variant and placements should be driven by config.',
    },
    prompts: [{ label: 'layout prompt', description: 'layout prompt' }],
  },
  layout: {
    variant: 'docs',
    placements: {
      assistant: 'end',
      user: 'start',
    },
  },
})

const layoutConfigAdapter = createChatAdapterFromConfig(layoutConfigConfig)
const layoutConfigWhiteboxPreset = createPresetChatProps(layoutConfigAdapter)
const layoutConfigWhiteboxSlices = createPresetChatSlices(layoutConfigWhiteboxPreset)
const layoutConfigWhiteboxChat = useChatKit({
  responseProvider: layoutConfigAdapter.createResponseProvider(),
})
const showLayoutConfigWhiteboxWelcome = computed(() => layoutConfigWhiteboxChat.messages.value.length === 0)

const workspaceLayoutConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Workspace Layout',
    },
    welcome: {
      title: 'Workspace Layout Welcome',
      description: 'Workspace variant should remain a pure layout choice.',
    },
    prompts: [{ label: 'workspace prompt', description: 'workspace prompt' }],
  },
  layout: {
    variant: 'workspace',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  },
})

const workspaceLayoutAdapter = createChatAdapterFromConfig(workspaceLayoutConfig)
const workspaceLayoutWhiteboxPreset = createPresetChatProps(workspaceLayoutAdapter)
const workspaceLayoutWhiteboxSlices = createPresetChatSlices(workspaceLayoutWhiteboxPreset)
const workspaceLayoutWhiteboxChat = useChatKit({
  responseProvider: workspaceLayoutAdapter.createResponseProvider(),
})
const showWorkspaceLayoutWhiteboxWelcome = computed(() => workspaceLayoutWhiteboxChat.messages.value.length === 0)

function handleLayoutConfigWhiteboxPromptClick(description: string) {
  layoutConfigWhiteboxChat.sendMessage(description)
}

function handleWorkspaceLayoutWhiteboxPromptClick(description: string) {
  workspaceLayoutWhiteboxChat.sendMessage(description)
}
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
}
</style>
