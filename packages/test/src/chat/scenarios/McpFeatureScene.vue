<template>
  <div class="scene-grid">
    <div data-testid="chat-mcp-feature-blackbox" class="chat-wrapper">
      <TrChat
        :config="mcpFeatureConfig"
        :runtime="{ mcpManager: mcpBlackboxManager }"
        :preset-overrides="mcpBlackboxPresetOverrides"
      />
    </div>

    <div data-testid="chat-mcp-feature-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="mcpWhiteboxChat" v-bind="mcpWhiteboxSlices.root">
        <TrChat.Layout v-bind="{ ...mcpWhiteboxSlices.layout, ...mcpWhiteboxSlices.appearance }">
          <TrChat.Header v-bind="mcpWhiteboxSlices.header" />
          <TrChat.Welcome
            v-if="showMcpWhiteboxWelcome && mcpWhiteboxSlices.welcome"
            v-bind="mcpWhiteboxSlices.welcome"
          />
          <TrChat.MessageList v-else v-bind="mcpWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="mcpWhiteboxSlices.sender">
              <template #footer>
                <TrMcpTrigger />
              </template>
            </TrChat.Sender>
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
  TrMcpTrigger,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
  useMcpManager,
} from '../../../../chat/src'
import { createMockProvider } from '../mockProvider'
import { createChatSceneConfig, sharedProviderFactories } from './sharedDemoFixtures'

const mcpFeaturePlugins = [
  {
    id: 'weather-service',
    name: 'Weather Service',
    icon: 'W',
    description: 'Get weather information for any location',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'get-weather',
        name: 'Get Weather',
        description: 'Get current weather for a location',
        enabled: true,
      },
    ],
    category: 'utilities',
  },
]

const mcpBlackboxManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})
const mcpWhiteboxManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})

const mcpFeatureConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'MCP Feature',
    },
    welcome: {
      title: 'MCP Feature Welcome',
      description: 'MCP manager should travel through runtime / preset / root.',
    },
  },
})

const mcpBlackboxPresetOverrides = {
  providerFactories: sharedProviderFactories,
}

const mcpWhiteboxAdapter = createChatAdapterFromConfig({
  ...mcpFeatureConfig,
  runtime: {
    mcpManager: mcpWhiteboxManager,
  },
})
const mcpWhiteboxPreset = createPresetChatProps(mcpWhiteboxAdapter)
const mcpWhiteboxSlices = createPresetChatSlices(mcpWhiteboxPreset)
const mcpWhiteboxChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'openai-test',
  }),
})

const showMcpWhiteboxWelcome = computed(() => mcpWhiteboxChat.messages.value.length === 0)
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
