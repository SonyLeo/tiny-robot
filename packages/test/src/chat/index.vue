<template>
  <div class="chat-demo">
    <h2>Chat 组件测试</h2>

    <div class="mode-switcher">
      <button
        v-for="modeOption in modeOptions"
        :key="modeOption.value"
        :data-testid="modeOption.testId"
        :class="{ active: mode === modeOption.value }"
        @click="mode = modeOption.value"
      >
        {{ modeOption.label }}
      </button>
    </div>

    <component :is="activeScene" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import BlackboxEdgeScene from './scenarios/BlackboxEdgeScene.vue'
import BlackboxScene from './scenarios/BlackboxScene.vue'
import LayoutConfigScene from './scenarios/LayoutConfigScene.vue'
import McpFeatureScene from './scenarios/McpFeatureScene.vue'
import SenderExtensionsScene from './scenarios/SenderExtensionsScene.vue'
import WelcomePromptsScene from './scenarios/WelcomePromptsScene.vue'
import WhiteboxScene from './scenarios/WhiteboxScene.vue'

type ChatMode =
  | 'blackbox'
  | 'whitebox'
  | 'blackbox-edge'
  | 'welcome-prompts'
  | 'sender-extensions'
  | 'mcp-feature'
  | 'layout-config'

const modeOptions: ReadonlyArray<{ value: ChatMode; label: string; testId: string }> = [
  { value: 'blackbox', label: '黑盒模式', testId: 'switch-blackbox' },
  { value: 'whitebox', label: '白盒模式', testId: 'switch-whitebox' },
  { value: 'blackbox-edge', label: '边界场景', testId: 'switch-blackbox-edge' },
  { value: 'welcome-prompts', label: 'Welcome Prompts', testId: 'switch-welcome-prompts' },
  { value: 'sender-extensions', label: 'Sender Extensions', testId: 'switch-sender-extensions' },
  { value: 'mcp-feature', label: 'MCP Feature', testId: 'switch-mcp-feature' },
  { value: 'layout-config', label: 'Layout Config', testId: 'switch-layout-config' },
]

const sceneByMode: Record<ChatMode, Component> = {
  blackbox: BlackboxScene,
  whitebox: WhiteboxScene,
  'blackbox-edge': BlackboxEdgeScene,
  'welcome-prompts': WelcomePromptsScene,
  'sender-extensions': SenderExtensionsScene,
  'mcp-feature': McpFeatureScene,
  'layout-config': LayoutConfigScene,
}

function isChatMode(value: string | null): value is ChatMode {
  return modeOptions.some((modeOption) => modeOption.value === value)
}

function getInitialMode(): ChatMode {
  if (typeof window === 'undefined') {
    return 'blackbox'
  }

  const mode = new URLSearchParams(window.location.search).get('chatMode')
  if (isChatMode(mode)) {
    return mode
  }

  return 'blackbox'
}

const mode = ref<ChatMode>(getInitialMode())
const activeScene = computed(() => sceneByMode[mode.value])
</script>

<style scoped>
.chat-demo {
  max-width: 100%;
  margin: 0 auto;
}

.mode-switcher {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 0 20px;
}

.mode-switcher button {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-switcher button.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}
</style>
