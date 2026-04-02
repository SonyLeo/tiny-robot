<template>
  <div class="chat-demo-container">
    <TrChat.Scaffold :config="chatConfig" :runtime="{ mcpManager }" v-slot="{ chatKit: runtime, presetSlices }">
      <TrChat.Layout>
        <div class="scaffold-banner">当默认页面结构不够用时，仍然可以复用现成配置和默认能力。</div>
        <TrChat.Header v-bind="presetSlices.header" />

        <TrChat.Welcome
          v-if="runtime.messages.value.length === 0 && presetSlices.welcome"
          v-bind="presetSlices.welcome"
          @prompt-click="runtime.sendMessage($event)"
        />

        <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

        <TrChat.Footer>
          <template #extra>
            <div class="scaffold-footer-tip">这里是页面自己决定的 footer extra。</div>
          </template>
          <TrChat.Sender v-bind="presetSlices.sender">
            <template #footer>
              <div class="scaffold-footer-tools">
                <TrModelSelector />
                <TrMcpTrigger />
              </div>
            </template>
          </TrChat.Sender>
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.Scaffold>
  </div>
</template>

<script setup lang="ts">
import { TrChat, TrMcpTrigger, TrModelSelector, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { PluginInfo } from '@opentiny/tiny-robot'

const initialPlugins: PluginInfo[] = [
  {
    id: 'docs-knowledge',
    name: 'Docs Knowledge',
    icon: 'DK',
    description: 'Provide lightweight documentation lookup tools for the docs chat demos.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'search_docs',
        name: 'Search Docs',
        description: 'Search demo documentation content by keyword.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]

const mcpManager = useMcpManager({ initialPlugins })

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: '重排页面结构示例',
    },
    welcome: {
      title: '当默认布局不够用时',
      description: '你可以自己控制 banner、header、welcome、footer，以及工具区的排布。',
    },
  },
}
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.scaffold-banner {
  padding: 12px 16px 0;
  color: #175cd3;
  font-size: 13px;
}

.scaffold-footer-tip {
  padding: 8px 12px 0;
  color: #475467;
  font-size: 12px;
}

.scaffold-footer-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
