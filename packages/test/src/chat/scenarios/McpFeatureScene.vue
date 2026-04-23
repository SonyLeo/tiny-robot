<template>
  <div class="scene-grid">
    <div data-testid="chat-mcp-feature-provider" class="chat-wrapper">
      <TrChat.Provider :response-provider="mcpProviderResponseProvider" :mcp-manager="mcpProviderManager">
        <TrChat.Layout>
          <TrChat.Header title="MCP Provider" />
          <TrChat.MessageList auto-scroll />
          <TrChat.Footer>
            <TrChat.Sender placeholder="Provider MCP sender...">
              <template #footer>
                <TrMcpTrigger />
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>

    <div data-testid="chat-mcp-feature-granular" class="chat-wrapper">
      <TrChat.Provider :response-provider="mcpGranularResponseProvider" :mcp-manager="mcpGranularManager">
        <TrChat.Layout>
          <TrChat.Header title="MCP Granular" />
          <TrChat.MessageList auto-scroll />
          <TrChat.Footer>
            <TrChat.Sender placeholder="Granular MCP sender...">
              <template #footer>
                <TrMcpTrigger />
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrChat, TrMcpTrigger, useMcpManager } from '@opentiny/tiny-robot-chat'
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

const mcpProviderManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})
const mcpGranularManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})
const mcpProviderResponseProvider = createMockProvider({
  provider: 'mcp-provider',
  model: 'mcp-provider-model',
})
const mcpGranularResponseProvider = createMockProvider({
  provider: 'mcp-granular',
  model: 'mcp-granular-model',
})
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
