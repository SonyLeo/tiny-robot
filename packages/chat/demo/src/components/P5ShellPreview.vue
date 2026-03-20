<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from '@opentiny/tiny-robot'
import {
  TrChat,
  TrChatWorkspacePanelHost,
  TrChatWorkspaceShell,
  useMcpManager,
  createChatAdapterFromConfig,
  createPresetChatProps,
} from '@opentiny/tiny-robot-chat'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'
import { wrapDemoRetryProviderFactories } from '../utils/demoRetryProvider'

defineEmits<{
  error: [error: Error]
}>()

const { resolvedColorMode, setColorMode } = useTheme()

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

const chatAdapter = createChatAdapterFromConfig({
  models: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', provider: 'deepseek' },
    { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  ],
  providers: {
    deepseek: {
      type: 'openai-compatible',
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
    openai: {
      type: 'openai-compatible',
      baseURL: 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
  },
  defaults: {
    model: 'deepseek-chat',
  },
  ui: {
    brand: BRAND_CONFIG,
    welcome: WELCOME_CONFIG,
    prompts: PROMPTS,
  },
  features: {
    attachments: {
      upload: {
        accept: '*',
        multiple: true,
        tooltip: 'Upload files',
      },
      list: {
        variant: 'card',
        wrap: true,
      },
    },
    senderActions: {
      voice: {
        enabled: true,
        tooltip: 'Voice input',
      },
      wordCount: true,
    },
  },
})

const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const demoProviderFactories = wrapDemoRetryProviderFactories(chatAdapter.providerFactories)

const shellPreset = createPresetChatProps(chatAdapter, {
  providerFactories: demoProviderFactories,
  mcpManager,
  plugins: [toolPluginInstance],
  showFeedback: true,
  showHistory: true,
})

const providerSummary = computed(() => chatAdapter.models.map((model) => model.label).join(' / '))
const currentColorMode = computed(() => resolvedColorMode?.value ?? 'light')

const leftCollapsed = ref(false)
const rightCollapsed = ref(false)
const fullWidth = ref(false)

const leftChangedPanel = ref('history')
const rightChangedPanel = ref('notes')

const leftRegionConfig = computed(() => ({
  width: 'md' as const,
  collapsible: true,
  defaultOpen: true,
  panels: [
    { id: 'history', kind: 'history' as const, label: 'History', description: 'Conversation timeline' },
    { id: 'sources', kind: 'sources' as const, label: 'Sources', description: 'Attached references' },
    { id: 'pinned', kind: 'custom' as const, label: 'Pinned', description: 'Reusable shortcuts' },
  ],
}))

const rightRegionConfig = computed(() => ({
  width: 'lg' as const,
  collapsible: true,
  collapseMode: 'hidden',
  defaultOpen: true,
  panels: [
    { id: 'notes', kind: 'custom' as const, label: 'Notes', description: 'Flexible content companion panel' },
    { id: 'mcp', kind: 'mcp' as const, label: 'MCP', description: 'Tool and server surface' },
    { id: 'outline', kind: 'outline' as const, label: 'Outline', description: 'Content navigation layer' },
  ],
}))

function toggleFullWidth() {
  fullWidth.value = !fullWidth.value
}

function setLightMode() {
  setColorMode('light')
}

function setDarkMode() {
  setColorMode('dark')
}
</script>

<template>
  <div class="p5-shell-page" :data-color-mode="currentColorMode">
    <main class="p5-shell-stage">
      <TrChatWorkspaceShell
        badge="P5"
        title="Workspace Shell Preview"
        description="Outer spacing, rounded shell, and clipped chat card"
        :left-collapsed="leftCollapsed"
        :right-collapsed="rightCollapsed"
        :left-region="leftRegionConfig"
        :right-region="rightRegionConfig"
        :view-state="{ fullWidth }"
        left-rail-label="History"
        right-rail-label="Tools"
        @update:left-collapsed="leftCollapsed = $event"
        @update:right-collapsed="rightCollapsed = $event"
        @left-panel-change="leftChangedPanel = $event?.id ?? leftChangedPanel"
        @right-panel-change="rightChangedPanel = $event?.id ?? rightChangedPanel"
      >
        <template
          #toolbar-actions="{
            leftCollapsed: shellLeftCollapsed,
            rightCollapsed: shellRightCollapsed,
            toggleLeft,
            toggleRight,
          }"
        >
          <div class="p5-shell-actions">
            <span class="p5-shell-pill">Preview</span>
            <div class="p5-shell-segment">
              <button
                class="p5-shell-toggle"
                :class="{ 'is-active': currentColorMode === 'light' }"
                type="button"
                @click="setLightMode"
              >
                Light
              </button>
              <button
                class="p5-shell-toggle"
                :class="{ 'is-active': currentColorMode === 'dark' }"
                type="button"
                @click="setDarkMode"
              >
                Dark
              </button>
            </div>
            <button class="p5-shell-toggle" type="button" @click="toggleFullWidth">
              {{ fullWidth ? 'Reading width' : 'Full width' }}
            </button>
            <button class="p5-shell-toggle" type="button" @click="toggleLeft()">
              {{ shellLeftCollapsed ? 'Show left' : 'Hide left' }}
            </button>
            <button class="p5-shell-toggle" type="button" @click="toggleRight()">
              {{ shellRightCollapsed ? 'Show right' : 'Hide right' }}
            </button>
          </div>
        </template>

        <template #meta>
          <span class="p5-shell-chip">Rounded shell</span>
          <span class="p5-shell-chip">Page margin</span>
          <span class="p5-shell-chip">Clipped inner layout</span>
          <span class="p5-shell-chip">Region host preview</span>
          <span class="p5-shell-chip">Mode: {{ currentColorMode }}</span>
          <span class="p5-shell-chip">{{ fullWidth ? 'Full width on' : 'Reading width on' }}</span>
          <span class="p5-shell-chip">Left active: {{ leftChangedPanel }}</span>
          <span class="p5-shell-chip">Right active: {{ rightChangedPanel }}</span>
          <span class="p5-shell-chip">{{ providerSummary }}</span>
        </template>

        <template #left="{ toggle, panelItems, activePanelId, setActivePanel }">
          <div class="p5-shell-panel">
            <TrChatWorkspacePanelHost
              title="Left Region"
              subtitle="Flexible host"
              :items="panelItems"
              :active-panel-id="activePanelId"
              @update:active-panel-id="setActivePanel"
            >
              <template #default="{ activePanel }">
                <div class="p5-shell-panel-content">
                  <div class="p5-shell-panel-title">
                    <strong>{{ activePanel?.label }}</strong>
                    <button class="p5-shell-panel-close" type="button" @click="toggle()">Collapse</button>
                  </div>
                  <p>{{ activePanel?.description }}</p>
                </div>

                <ul v-if="activePanel?.id === 'history'" class="p5-shell-list">
                  <li>Available skills overview</li>
                  <li>User sent number 2</li>
                  <li>Hello</li>
                </ul>

                <ul v-else-if="activePanel?.id === 'sources'" class="p5-shell-list">
                  <li>Artifacts skill</li>
                  <li>HTML/CSS features</li>
                  <li>React notes</li>
                </ul>

                <ul v-else class="p5-shell-list">
                  <li>Quick Q&amp;A</li>
                  <li>Document summary</li>
                  <li>Code generation</li>
                </ul>
              </template>
            </TrChatWorkspacePanelHost>
          </div>
        </template>

        <div class="p5-shell-chat">
          <TrChat v-bind="shellPreset" message-list-variant="workspace" />
        </div>

        <template #right="{ toggle, panelItems, activePanelId, setActivePanel }">
          <div class="p5-shell-panel">
            <TrChatWorkspacePanelHost
              title="Right Region"
              subtitle="Extensible host"
              :items="panelItems"
              :active-panel-id="activePanelId"
              @update:active-panel-id="setActivePanel"
            >
              <template #default="{ activePanel }">
                <div class="p5-shell-panel-content">
                  <div class="p5-shell-panel-title">
                    <strong>{{ activePanel?.label }}</strong>
                    <button class="p5-shell-panel-close" type="button" @click="toggle()">Collapse</button>
                  </div>
                  <p>{{ activePanel?.description }}</p>
                </div>

                <div v-if="activePanel?.id === 'notes'" class="p5-shell-note">
                  <span>Notes</span>
                  <strong>Flexible workspace companion</strong>
                </div>

                <div v-else-if="activePanel?.id === 'mcp'" class="p5-shell-note">
                  <span>Tooling</span>
                  <strong>Weather / Search / Database</strong>
                </div>

                <div v-else class="p5-shell-note">
                  <span>Outline</span>
                  <strong>History background / Five dynasties / Main points</strong>
                </div>
              </template>
            </TrChatWorkspacePanelHost>
          </div>
        </template>
      </TrChatWorkspaceShell>
    </main>
  </div>
</template>

<style scoped>
.p5-shell-page {
  flex: 1;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    background 0.24s ease,
    color 0.24s ease;
}

.p5-shell-page[data-color-mode='light'] {
  background:
    radial-gradient(circle at top left, rgba(219, 234, 254, 0.7), transparent 28%),
    radial-gradient(circle at bottom right, rgba(226, 232, 240, 0.7), transparent 24%),
    linear-gradient(180deg, #eef4fb 0%, #f7f9fc 100%);
}

.p5-shell-page[data-color-mode='dark'] {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 24%),
    radial-gradient(circle at bottom right, rgba(120, 113, 108, 0.16), transparent 22%),
    linear-gradient(180deg, #0f172a 0%, #111827 46%, #1f2937 100%);
  color: #e5edf7;
}

.p5-shell-stage {
  flex: 1;
  height: 100%;
  min-height: 0;
  padding: 14px 16px 12px;
  display: flex;
  overflow: hidden;
}

.p5-shell-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.p5-shell-segment {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(203, 213, 225, 0.34);
}

.p5-shell-pill {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(203, 213, 225, 0.55);
  background: rgba(255, 255, 255, 0.76);
  color: #687385;
  font-size: 11px;
  font-weight: 600;
}

.p5-shell-toggle {
  min-width: 82px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(203, 213, 225, 0.44);
  background: rgba(255, 255, 255, 0.66);
  color: #738094;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.p5-shell-toggle.is-active {
  border-color: rgba(59, 130, 246, 0.28);
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.92);
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.14);
}

.p5-shell-toggle:hover {
  border-color: rgba(59, 130, 246, 0.22);
  color: #1d4ed8;
  background: rgba(239, 246, 255, 0.72);
}

.p5-shell-toggle:active {
  transform: scale(0.98);
}

.p5-shell-chip {
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #667085;
  font-size: 11px;
  line-height: 1;
}

.p5-shell-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.p5-shell-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.56) 0%, rgba(255, 255, 255, 0.4) 100%);
  transition:
    padding 0.22s ease,
    background 0.22s ease;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-segment {
  background: rgba(15, 23, 42, 0.42);
  border-color: rgba(71, 85, 105, 0.52);
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-pill {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(71, 85, 105, 0.72);
  color: #cdd8e7;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-toggle {
  border-color: rgba(71, 85, 105, 0.56);
  background: rgba(15, 23, 42, 0.62);
  color: #d4deeb;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-toggle:hover {
  border-color: rgba(96, 165, 250, 0.42);
  color: #dbeafe;
  background: rgba(30, 41, 59, 0.9);
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-toggle.is-active {
  background: rgba(30, 64, 175, 0.56);
  border-color: rgba(96, 165, 250, 0.48);
  color: #eff6ff;
  box-shadow: 0 8px 22px rgba(30, 64, 175, 0.2);
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-chip {
  background: rgba(15, 23, 42, 0.64);
  border-color: rgba(71, 85, 105, 0.72);
  color: #cdd8e7;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-panel {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.44) 0%, rgba(30, 41, 59, 0.3) 100%);
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-panel-content strong,
.p5-shell-page[data-color-mode='dark'] .p5-shell-note strong {
  color: #eff6ff;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-panel-content p,
.p5-shell-page[data-color-mode='dark'] .p5-shell-note span,
.p5-shell-page[data-color-mode='dark'] .p5-shell-list {
  color: #cbd5e1;
}

.p5-shell-page[data-color-mode='dark'] .p5-shell-panel-close,
.p5-shell-page[data-color-mode='dark'] .p5-shell-note {
  background: rgba(15, 23, 42, 0.56);
  border-color: rgba(71, 85, 105, 0.56);
  color: #cbd5e1;
}

.p5-shell-panel-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.p5-shell-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.p5-shell-panel-content strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--chat-text-primary);
}

.p5-shell-panel-content p {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--chat-text-secondary);
}

.p5-shell-panel-close {
  padding: 5px 8px;
  border: 1px solid var(--chat-panel-border);
  border-radius: 999px;
  background: var(--chat-panel-bg);
  color: var(--chat-text-secondary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.p5-shell-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--chat-text-secondary);
  font-size: 12px;
}

.p5-shell-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--chat-panel-border);
  background: var(--chat-panel-bg);
  box-shadow: var(--chat-panel-shadow);
}

.p5-shell-note span {
  font-size: 11px;
  color: var(--chat-text-secondary);
}

.p5-shell-note strong {
  font-size: 12px;
  color: var(--chat-text-primary);
}

@media (max-width: 960px) {
  .p5-shell-stage {
    padding: 10px 10px 8px;
  }
}
</style>
