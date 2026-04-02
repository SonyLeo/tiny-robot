<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit, mcpManager }" :callbacks="{ onModelChange }">
      <template #left>
        <div class="workspace-left-panel">
          <header class="workspace-left-panel__brand">
            <strong>左侧占位面板</strong>
            <span>Workspace Slot 示例</span>
          </header>

          <button type="button" class="workspace-left-panel__action" @click="chatKit.createConversation()">
            + 新建会话
          </button>

          <div class="workspace-left-panel__note">
            这里直接替换了 `TrChat` 的左侧面板内容，但中间会话区、模型切换和默认运行时仍然保持不变。
          </div>

          <TrChat.HistorySurface class="workspace-left-panel__history" />
        </div>
      </template>

      <template #left-rail>
        <div class="workspace-left-rail">
          <span class="workspace-left-rail__mark">L</span>
          <span class="workspace-left-rail__text">Panel</span>
        </div>
      </template>

      <template #right>
        <div class="workspace-right-panel">
          <div class="workspace-right-panel__eyebrow">Right Slot</div>
          <h3>右侧占位内容</h3>
          <p>这个区域用于演示：继续使用 `TrChat` 时，也可以单独替换 workspace 右侧面板。</p>
          <div class="workspace-right-panel__placeholder">这里可以放预览、说明、详情，或者任何你自己的占位内容。</div>
        </div>
      </template>

      <template #mobile-right>
        <div class="workspace-mobile-sheet">
          <strong>移动端右侧内容</strong>
          <p>这里是 `mobile-right`，没有提供时会自动回退到 `right`。</p>
        </div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, createChatAdapterFromConfig, useChatKit, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import type { PluginInfo } from '@opentiny/tiny-robot'

const initialMessages = [
  {
    role: 'assistant',
    content: '你好，我是文档里的演示助手，已经为你准备好一组初始消息。',
  },
  {
    role: 'user',
    content: '请展示一下当前页面的定制效果。',
  },
  {
    role: 'assistant',
    content: '没问题，我们会直接把对应的 UI 差异渲染出来。',
  },
]

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
  shell: {
    variant: 'workspace' as const,
    leftRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: true,
      collapseMode: 'rail' as const,
      railLabel: 'Control',
    },
    rightRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: false,
      collapseMode: 'hidden' as const,
      railLabel: 'Preview',
    },
  },
  layout: {
    variant: 'workspace' as const,
    contentLayout: 'wide' as const,
  },
  ui: {
    brand: {
      title: 'workspace 面板级定制',
    },
    welcome: {
      title: '也能直接替换 workspace 面板',
      description: '保留默认聊天主区，只替换左侧控制台和右侧预览区。',
    },
  },
}

const adapter = createChatAdapterFromConfig(chatConfig)
const selectedModel = ref(adapter.defaultModel ?? adapter.models[0]?.value ?? 'gpt-4o-mini')
const mcpManager = useMcpManager({ initialPlugins })
const chatKit = useChatKit({
  responseProvider: adapter.createResponseProvider(selectedModel.value),
  initialMessages,
})

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
  chatKit.updateResponseProvider(adapter.createResponseProvider(model.value))
}
</script>

<style scoped>
.chat-demo-container {
  height: 620px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.workspace-left-panel {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 12px;
  padding: 18px 16px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.98) 100%);
}

.workspace-left-panel__brand {
  display: grid;
  gap: 2px;
}

.workspace-left-panel__brand strong {
  font-size: 15px;
}

.workspace-left-panel__brand span {
  color: var(--tr-text-secondary);
  font-size: 12px;
}

.workspace-left-panel__action {
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(180deg, #3670f3 0%, #2456d8 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.workspace-left-panel__note {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.55;
}

.workspace-left-panel__history {
  min-height: 0;
}

.workspace-left-rail {
  height: 100%;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 8px;
  padding: 18px 0;
  color: var(--tr-text-secondary);
}

.workspace-left-rail__mark {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(47, 107, 255, 0.12);
  color: #2f6bff;
  font-size: 12px;
  font-weight: 700;
}

.workspace-left-rail__text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-right-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 18px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.workspace-right-panel__eyebrow {
  color: var(--tr-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-right-panel h3,
.workspace-mobile-sheet strong {
  margin: 0;
  font-size: 16px;
}

.workspace-right-panel p,
.workspace-mobile-sheet p {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.workspace-right-panel__placeholder {
  padding: 14px 12px;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.workspace-mobile-sheet {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 20px 16px;
  background: #fff;
}
</style>
