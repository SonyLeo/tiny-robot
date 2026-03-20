<template>
  <div class="scene-grid">
    <div data-testid="chat-mcp-feature-blackbox" class="chat-wrapper">
      <TrChat v-bind="mcpBlackboxPreset">
        <template #header-extra>
          <button data-testid="mcp-feature-blackbox-open" @click="mcpBlackboxPanelVisible = true">Open MCP</button>
          <TrChatMcpPanel :visible="mcpBlackboxPanelVisible" @update:visible="mcpBlackboxPanelVisible = $event" />
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-mcp-feature-whitebox" class="chat-wrapper">
      <TrChat.Root :chat-kit="mcpWhiteboxChat" v-bind="mcpWhiteboxSlices.root">
        <TrChat.Layout v-bind="{ ...mcpWhiteboxSlices.layout, ...mcpWhiteboxSlices.appearance }">
          <TrChat.Header v-bind="mcpWhiteboxSlices.header">
            <template #extra>
              <button data-testid="mcp-feature-whitebox-open" @click="mcpWhiteboxPanelVisible = true">Open MCP</button>
            </template>
          </TrChat.Header>
          <TrChat.Welcome
            v-if="showMcpWhiteboxWelcome && mcpWhiteboxSlices.welcome"
            v-bind="mcpWhiteboxSlices.welcome"
          />
          <TrChat.MessageList v-else v-bind="mcpWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="mcpWhiteboxSlices.sender" />
          </TrChat.Footer>
          <TrChatMcpPanel :visible="mcpWhiteboxPanelVisible" @update:visible="mcpWhiteboxPanelVisible = $event" />
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TrChat,
  TrChatMcpPanel,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
  useMcpManager,
} from '../../../../chat/src'
import { createMockProvider } from '../mockProvider'

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

const mcpFeatureBaseConfig = {
  models: [{ id: 'mcp-feature-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'MCP Feature',
    },
    welcome: {
      title: 'MCP Feature Welcome',
      description: 'MCP manager should travel through feature -> preset -> root.',
    },
  },
}

const mcpBlackboxAdapter = createChatAdapterFromConfig({
  ...mcpFeatureBaseConfig,
  features: {
    mcp: {
      manager: mcpBlackboxManager,
    },
  },
})
const mcpBlackboxPreset = createPresetChatProps(mcpBlackboxAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'mcp-feature-model',
  }),
})

const mcpWhiteboxAdapter = createChatAdapterFromConfig({
  ...mcpFeatureBaseConfig,
  features: {
    mcp: {
      manager: mcpWhiteboxManager,
    },
  },
})
const mcpWhiteboxPreset = createPresetChatProps(mcpWhiteboxAdapter)
const mcpWhiteboxSlices = createPresetChatSlices(mcpWhiteboxPreset)
const mcpWhiteboxChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'mcp-feature-model',
  }),
})

const showMcpWhiteboxWelcome = computed(() => mcpWhiteboxChat.messages.value.length === 0)
const mcpBlackboxPanelVisible = ref(false)
const mcpWhiteboxPanelVisible = ref(false)
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
