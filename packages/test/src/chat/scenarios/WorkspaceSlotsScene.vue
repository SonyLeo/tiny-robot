<template>
  <div class="workspace-slots-grid">
    <div data-testid="chat-workspace-slots-default" class="chat-wrapper">
      <TrChat :config="defaultWorkspaceConfig">
        <template #left>
          <div class="workspace-panel workspace-panel--left" data-testid="workspace-left-default">
            <strong>Desktop Left Slot</strong>
            <p>Default workspace scene uses this left panel on desktop and as the mobile-left fallback.</p>
          </div>
        </template>

        <template #left-rail>
          <div class="workspace-rail" data-testid="workspace-left-rail-default">L</div>
        </template>

        <template #right>
          <div class="workspace-panel workspace-panel--right" data-testid="workspace-right-default">
            <strong>Desktop Right Slot</strong>
            <p>Open the right panel toggle to reveal this custom preview content.</p>
          </div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-workspace-slots-mobile-override" class="chat-wrapper">
      <TrChat :config="overrideWorkspaceConfig">
        <template #left>
          <div class="workspace-panel workspace-panel--left" data-testid="workspace-left-override">
            <strong>Desktop Left Slot</strong>
            <p>This desktop left slot should not appear in the mobile-left override flow.</p>
          </div>
        </template>

        <template #mobile-left>
          <div class="workspace-panel workspace-panel--left" data-testid="workspace-mobile-left-override">
            <strong>Mobile Left Override</strong>
            <p>This content should replace the desktop left slot inside the mobile drawer.</p>
          </div>
        </template>

        <template #right>
          <div class="workspace-panel workspace-panel--right" data-testid="workspace-right-override">
            <strong>Desktop Right Slot</strong>
            <p>This content is used for the desktop right panel.</p>
          </div>
        </template>

        <template #mobile-right>
          <div class="workspace-panel workspace-panel--right" data-testid="workspace-mobile-right-override">
            <strong>Mobile Right Override</strong>
            <p>This content should replace the desktop right slot inside the mobile sheet.</p>
          </div>
        </template>
      </TrChat>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const defaultWorkspaceConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Workspace Slot Default',
    welcomeTitle: 'Workspace Slot Default Welcome',
    welcomeDescription: 'Official workspace slot baseline for the blackbox path.',
    workspace: true,
    contentLayout: 'wide',
  }),
)

const overrideWorkspaceConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Workspace Slot Override',
    welcomeTitle: 'Workspace Slot Override Welcome',
    welcomeDescription: 'Official workspace slot mobile override baseline for the blackbox path.',
    workspace: true,
    contentLayout: 'wide',
  }),
)
</script>

<style scoped>
.workspace-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}

.workspace-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px 16px;
}

.workspace-panel strong {
  font-size: 15px;
}

.workspace-panel p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.workspace-panel--left {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.98) 100%);
}

.workspace-panel--right {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
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
