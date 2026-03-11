<script setup lang="ts">
import { inject } from 'vue'
import { TrMcpServerPicker } from '@opentiny/tiny-robot'
import type { PluginInfo } from '@opentiny/tiny-robot'
import type { UseMcpManagerReturn } from '../composables/useMcpManager'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// Inject 共享的 mcpManager 实例
const mcpManager = inject<UseMcpManagerReturn>('mcpManager')
if (!mcpManager) {
  throw new Error('mcpManager not provided')
}

const { installedPlugins, handlePluginToggle, handleToolToggle, handlePluginDelete, activeCount } = mcpManager

const handlePluginToggleEvent = (plugin: PluginInfo, enabled: boolean) => {
  handlePluginToggle(plugin, enabled)
}

const handleToolToggleEvent = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  handleToolToggle(plugin, toolId, enabled)
}

const handlePluginDeleteEvent = (plugin: PluginInfo) => {
  handlePluginDelete(plugin)
}
</script>

<template>
  <div>
    <!-- Overlay Mask -->
    <Transition name="fade">
      <div v-if="visible" class="mcp-panel-overlay" @click="emit('update:visible', false)" />
    </Transition>

    <!-- MCP Server Picker -->
    <TrMcpServerPicker
      :visible="visible"
      :installed-plugins="installedPlugins"
      :active-count="activeCount"
      show-installed-tab
      :allow-plugin-toggle="true"
      :allow-tool-toggle="true"
      :allow-plugin-delete="true"
      :popup-config="{
        type: 'drawer',
        drawer: { direction: 'right' },
      }"
      @update:visible="emit('update:visible', $event)"
      @plugin-toggle="(plugin, enabled) => handlePluginToggleEvent(plugin, enabled)"
      @tool-toggle="(plugin, toolId, enabled) => handleToolToggleEvent(plugin, toolId, enabled)"
      @plugin-delete="handlePluginDeleteEvent"
    />
  </div>
</template>

<style scoped>
.mcp-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
