<template>
  <div data-testid="chat-workspace-interaction" class="chat-wrapper">
    <TrChat :config="workspaceConfig">
      <template #left>
        <div class="workspace-panel" data-testid="wi-left-panel">
          <strong>Left Panel</strong>
        </div>
      </template>
      <template #left-rail>
        <div class="workspace-rail" data-testid="wi-left-rail">L</div>
      </template>
      <template #right>
        <div class="workspace-panel" data-testid="wi-right-panel">
          <strong>Right Panel</strong>
        </div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const workspaceConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Workspace Interaction',
    welcomeTitle: 'Workspace Interaction Scene',
    welcomeDescription: 'Single-instance workspace for interaction testing.',
    workspace: true,
    contentLayout: 'wide',
  }),
)
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}

.workspace-panel {
  height: 100%;
  padding: 18px 16px;
  background: rgba(247, 250, 255, 0.98);
}

.workspace-rail {
  width: 28px;
  height: 28px;
  margin: 18px auto 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(47, 107, 255, 0.12);
  color: #2f6bff;
  font-size: 12px;
  font-weight: 700;
}
</style>
