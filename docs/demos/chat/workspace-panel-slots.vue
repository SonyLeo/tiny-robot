<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit, mcpManager }" :callbacks="{ onModelChange }">
      <template #left>
        <div class="workspace-left-panel">
          <header class="workspace-left-panel__brand">
            <strong>GenUI</strong>
            <span>Workspace Slots</span>
          </header>

          <button type="button" class="workspace-left-panel__action" @click="chatKit.createConversation()">
            + 新建会话
          </button>

          <div class="workspace-left-panel__note">
            这里直接替换了黑盒 `TrChat` 的左侧面板内容，但中间会话区、模型切换、MCP 和默认运行时仍然保持不变。
          </div>

          <TrChat.HistorySurface class="workspace-left-panel__history" />
        </div>
      </template>

      <template #left-rail>
        <div class="workspace-left-rail">
          <span class="workspace-left-rail__mark">G</span>
          <span class="workspace-left-rail__text">Panel</span>
        </div>
      </template>

      <template #right>
        <div class="workspace-right-panel">
          <div class="workspace-right-panel__eyebrow">Preview Slot</div>
          <h3>右侧面板也可以直接替换</h3>
          <p>
            如果你只想替换 workspace 左右面板，而不想重排整个 Header / Body / Footer，继续用 `TrChat` 黑盒写法就够了。
          </p>
          <button type="button" class="workspace-right-panel__button">模拟预览动作</button>
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
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createDemoMcpManager, createMockResponseProvider, seededMessages } from './shared'

const chatConfig = createDemoChatConfig({
  shell: {
    variant: 'workspace',
    leftRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: true,
      collapseMode: 'rail',
      railLabel: 'Control',
    },
    rightRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: false,
      collapseMode: 'hidden',
      railLabel: 'Preview',
    },
  },
  layout: {
    variant: 'workspace',
    contentLayout: 'wide',
  },
  ui: {
    brand: {
      title: 'workspace 面板级定制',
    },
    welcome: {
      title: '黑盒下也能替换 workspace 面板',
      description: '保留默认聊天主区，只替换左侧控制台和右侧预览区。',
    },
  },
})

const selectedModel = ref(chatConfig.defaults?.model ?? chatConfig.models[0]?.id ?? 'deepseek-chat')
const mcpManager = createDemoMcpManager()
const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('workspace panel slots', {
    getModelId: () => selectedModel.value,
  }),
  initialMessages: seededMessages,
})

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
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

.workspace-right-panel__button {
  justify-self: start;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: var(--tr-text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
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
