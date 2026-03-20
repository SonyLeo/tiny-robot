<template>
  <div data-testid="p5-shell-preview-root" class="p5-shell-wrapper">
    <TrChatWorkspaceShell
      data-testid="p5-shell-preview"
      badge="P5"
      title="Workspace Shell Preview"
      :left-collapsed="shellLeftCollapsed"
      :right-collapsed="shellRightCollapsed"
      :appearance="darkAppearance"
      :left-region="shellLeftRegion"
      :right-region="shellRightRegion"
      :view-state="{ fullWidth: shellFullWidth }"
      left-rail-label="History"
      right-rail-label="Tools"
      @update:left-collapsed="shellLeftCollapsed = $event"
      @update:right-collapsed="shellRightCollapsed = $event"
      @left-panel-change="shellLeftActivePanel = $event?.id ?? shellLeftActivePanel"
      @right-panel-change="shellRightActivePanel = $event?.id ?? shellRightActivePanel"
    >
      <template #toolbar-actions="{ toggleLeft, toggleRight }">
        <button data-testid="toggle-full-width" type="button" @click="shellFullWidth = !shellFullWidth">
          {{ shellFullWidth ? 'Reading width' : 'Full width' }}
        </button>
        <button data-testid="toggle-left" type="button" @click="toggleLeft()">Toggle Left</button>
        <button data-testid="toggle-right" type="button" @click="toggleRight()">Toggle Right</button>
      </template>

      <template #meta>
        <span class="shell-chip">Rounded shell</span>
        <span class="shell-chip">Page margin</span>
        <span class="shell-chip">Clipped inner layout</span>
        <span class="shell-chip">Region host preview</span>
        <span class="shell-chip">{{ shellFullWidth ? 'Full width on' : 'Reading width on' }}</span>
        <span class="shell-chip">Left active: {{ shellLeftActivePanel }}</span>
        <span class="shell-chip">Right active: {{ shellRightActivePanel }}</span>
      </template>

      <template #left="{ toggle, panelItems, activePanelId, setActivePanel }">
        <div class="shell-panel">
          <TrChatWorkspacePanelHost
            :items="panelItems"
            :active-panel-id="activePanelId"
            @update:active-panel-id="setActivePanel"
          >
            <template #default="{ activePanel }">
              <div>
                <button type="button" @click="toggle()">Collapse</button>
                <p>{{ activePanel?.label }}</p>
              </div>
            </template>
          </TrChatWorkspacePanelHost>
        </div>
      </template>

      <div class="shell-chat-area">
        <TrChat :response-provider="shellChatProvider" :appearance="darkAppearance" message-list-variant="workspace" />
      </div>

      <template #right="{ toggle, panelItems, activePanelId, setActivePanel }">
        <div class="shell-panel">
          <TrChatWorkspacePanelHost
            :items="panelItems"
            :active-panel-id="activePanelId"
            @update:active-panel-id="setActivePanel"
          >
            <template #default="{ activePanel }">
              <div>
                <button type="button" @click="toggle()">Collapse</button>
                <p>{{ activePanel?.label }}</p>
              </div>
            </template>
          </TrChatWorkspacePanelHost>
        </div>
      </template>
    </TrChatWorkspaceShell>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, TrChatWorkspacePanelHost, TrChatWorkspaceShell } from '../../../../chat/src'
import { createMockProvider } from '../mockProvider'

const darkAppearance = { mode: 'dark' } as const

const shellLeftCollapsed = ref(false)
const shellRightCollapsed = ref(false)
const shellFullWidth = ref(false)
const shellLeftActivePanel = ref('history')
const shellRightActivePanel = ref('notes')

const shellLeftRegion = {
  width: 'md' as const,
  collapsible: true,
  defaultOpen: true,
  collapseMode: 'rail' as const,
  panels: [
    { id: 'history', label: 'History', description: 'Conversation timeline' },
    { id: 'sources', label: 'Sources', description: 'Attached references' },
    { id: 'pinned', label: 'Pinned', description: 'Reusable shortcuts' },
  ],
}

const shellRightRegion = {
  width: 'lg' as const,
  collapsible: true,
  defaultOpen: true,
  collapseMode: 'rail' as const,
  panels: [
    { id: 'notes', label: 'Notes', description: 'Flexible content companion panel' },
    { id: 'mcp', label: 'MCP', description: 'Tool and server surface' },
    { id: 'outline', label: 'Outline', description: 'Content navigation layer' },
  ],
}

const shellChatProvider = createMockProvider({ provider: 'openai', model: 'shell-model' })
</script>

<style scoped>
.p5-shell-wrapper {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.shell-panel {
  height: 100%;
  padding: 12px;
}

.shell-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.shell-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8eefb;
  font-size: 11px;
}
</style>
