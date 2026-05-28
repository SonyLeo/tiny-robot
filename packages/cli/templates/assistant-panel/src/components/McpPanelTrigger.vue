<script setup lang="ts">
import { McpServerPicker, TrIconButton } from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import { useMcp } from '../composables/useMcp'

defineProps<{
  compact?: boolean
}>()

const {
  pickerVisible,
  installedPlugins,
  marketPlugins,
  activePluginCount,
  handlePluginAdd,
  handlePluginToggle,
  handlePluginDelete,
  handleToolToggle,
} = useMcp()

const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}
</script>

<template>
  <div>
    <div
      class="mcp-trigger"
      :class="{ 'is-active': pickerVisible || activePluginCount > 0, 'mcp-trigger--compact': compact }"
      @click="pickerVisible = true"
    >
      <TrIconButton :icon="IconPlugin" size="28" svgSize="20" title="扩展" aria-label="Open MCP plugins" />
      <span v-if="!compact" class="mcp-trigger__text">扩展</span>
      <span v-if="activePluginCount > 0" class="mcp-trigger__badge">{{ activePluginCount }}</span>
    </div>

    <McpServerPicker
      v-model:visible="pickerVisible"
      :active-count="activePluginCount"
      :popup-config="pickerPopupConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :title="'MCP Plugins'"
      :installed-tab-title="'Installed'"
      :market-tab-title="'Market'"
      :search-placeholder="'Search plugins'"
      :market-category-placeholder="'Filter by category'"
      :enable-market-category-filter="false"
      :show-custom-add-button="false"
      :allow-plugin-delete="true"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
    />
  </div>
</template>

<style scoped>
.mcp-trigger {
  min-width: 88px;
  height: 32px;
  padding: 0 10px 0 2px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.mcp-trigger--compact {
  min-width: 0;
  padding: 0 8px 0 2px;
}

.mcp-trigger:hover {
  color: var(--tr-text-primary);
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.mcp-trigger.is-active {
  color: var(--tr-color-primary);
  border-color: var(--tr-color-primary);
  background: color-mix(in srgb, var(--tr-color-primary) 8%, var(--tr-container-bg-default));
}

.mcp-trigger__text {
  font-size: 12px;
  font-weight: var(--tr-font-weight-medium);
}

.mcp-trigger__badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--tr-radius-full);
  background: var(--tr-color-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
}

:deep(.tr-icon-button) {
  background: transparent;
}

.mcp-trigger.is-active :deep(.tr-icon-button) {
  color: var(--tr-color-primary);
}

:deep(.mcp-server-picker.popup-type-drawer) {
  width: min(420px, 100vw);
  max-width: none;
  z-index: var(--tr-z-index-modal);
}
</style>
