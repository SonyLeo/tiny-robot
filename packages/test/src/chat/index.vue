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
import GranularScene from './scenarios/GranularScene.vue'
import ErrorRetryScene from './scenarios/ErrorRetryScene.vue'
import FeedbackScene from './scenarios/FeedbackScene.vue'
import LayoutConfigScene from './scenarios/LayoutConfigScene.vue'
import McpFeatureScene from './scenarios/McpFeatureScene.vue'
import MessageEditScene from './scenarios/MessageEditScene.vue'
import MessageListConfigScene from './scenarios/MessageListConfigScene.vue'
import MessageTransformsScene from './scenarios/MessageTransformsScene.vue'
import RendererRegistryScene from './scenarios/RendererRegistryScene.vue'
import SenderExtensionsScene from './scenarios/SenderExtensionsScene.vue'
import SurfaceApiScene from './scenarios/SurfaceApiScene.vue'
import TrChatScene from './scenarios/TrChatScene.vue'
import WelcomePromptsScene from './scenarios/WelcomePromptsScene.vue'
import WhiteboxScene from './scenarios/WhiteboxScene.vue'
import WhiteboxSlotsScene from './scenarios/WhiteboxSlotsScene.vue'
import WorkspaceInteractionScene from './scenarios/WorkspaceInteractionScene.vue'
import WorkspaceSlotsScene from './scenarios/WorkspaceSlotsScene.vue'

type ChatMode =
  | 'trchat'
  | 'whitebox'
  | 'granular'
  | 'welcome-prompts'
  | 'sender-extensions'
  | 'mcp-feature'
  | 'layout-config'
  | 'message-transforms'
  | 'renderer-registry'
  | 'surface-api'
  | 'workspace-slots'
  | 'workspace-interaction'
  | 'whitebox-slots'
  | 'error-retry'
  | 'message-edit'
  | 'message-list-config'
  | 'feedback'

const modeOptions: ReadonlyArray<{ value: ChatMode; label: string; testId: string }> = [
  { value: 'trchat', label: 'TrChat 入口', testId: 'switch-trchat' },
  { value: 'whitebox', label: 'Root + Page', testId: 'switch-whitebox' },
  { value: 'granular', label: 'Root + primitives', testId: 'switch-granular' },
  { value: 'welcome-prompts', label: 'Welcome Prompts', testId: 'switch-welcome-prompts' },
  { value: 'sender-extensions', label: 'Sender Extensions', testId: 'switch-sender-extensions' },
  { value: 'mcp-feature', label: 'MCP Feature', testId: 'switch-mcp-feature' },
  { value: 'layout-config', label: 'Layout Config', testId: 'switch-layout-config' },
  { value: 'message-transforms', label: 'Message Transforms', testId: 'switch-message-transforms' },
  { value: 'renderer-registry', label: 'Renderer Registry', testId: 'switch-renderer-registry' },
  { value: 'surface-api', label: 'Surface API', testId: 'switch-surface-api' },
  { value: 'workspace-slots', label: 'Workspace Slots', testId: 'switch-workspace-slots' },
  { value: 'workspace-interaction', label: 'Workspace Interaction', testId: 'switch-workspace-interaction' },
  { value: 'whitebox-slots', label: 'Whitebox Slots', testId: 'switch-whitebox-slots' },
  { value: 'error-retry', label: 'Error Retry', testId: 'switch-error-retry' },
  { value: 'message-edit', label: 'Message Edit', testId: 'switch-message-edit' },
  { value: 'message-list-config', label: 'MessageList Config', testId: 'switch-message-list-config' },
  { value: 'feedback', label: 'Feedback', testId: 'switch-feedback' },
]

const sceneByMode: Record<ChatMode, Component> = {
  trchat: TrChatScene,
  whitebox: WhiteboxScene,
  granular: GranularScene,
  'welcome-prompts': WelcomePromptsScene,
  'sender-extensions': SenderExtensionsScene,
  'mcp-feature': McpFeatureScene,
  'layout-config': LayoutConfigScene,
  'message-transforms': MessageTransformsScene,
  'renderer-registry': RendererRegistryScene,
  'surface-api': SurfaceApiScene,
  'workspace-slots': WorkspaceSlotsScene,
  'workspace-interaction': WorkspaceInteractionScene,
  'whitebox-slots': WhiteboxSlotsScene,
  'error-retry': ErrorRetryScene,
  'message-edit': MessageEditScene,
  'message-list-config': MessageListConfigScene,
  feedback: FeedbackScene,
}

function isChatMode(value: string | null): value is ChatMode {
  return modeOptions.some((modeOption) => modeOption.value === value)
}

function getInitialMode(): ChatMode {
  if (typeof window === 'undefined') {
    return 'trchat'
  }

  const mode = new URLSearchParams(window.location.search).get('chatMode')
  if (isChatMode(mode)) {
    return mode
  }

  return 'trchat'
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
