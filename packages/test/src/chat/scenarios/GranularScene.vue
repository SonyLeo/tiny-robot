<template>
  <div data-testid="chat-granular" class="chat-wrapper">
    <TrChat.Root :runtime="granularResolution.runtime" :ui="granularResolution.ui">
      <TrChat.WorkspaceLayout
        :appearance="granularResolution.ui.appearance"
        :sidebar-title="granularResolution.ui.brand?.title"
      >
        <template #left>
          <TrChat.HistorySurface />
        </template>

        <template #right>
          <aside class="granular-panel" data-testid="granular-panel">
            <strong>Root + primitives</strong>
            <p>Granular scene keeps the official public building blocks visible for end-to-end proof.</p>
          </aside>
        </template>

        <TrChat.Layout
          :appearance="granularResolution.ui.appearance"
          :content-layout="granularResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularResolution.ui.brand?.title" :show-history="true" />

          <TrChat.Welcome
            v-if="showWelcome"
            :compatibility-relay="false"
            :title="granularResolution.ui.welcome?.title"
            :description="granularResolution.ui.welcome?.description"
            :prompts="granularResolution.ui.welcome?.prompts"
            @prompt-click="granularResolution.runtime.conversation.send({ text: $event })"
          />
          <TrChat.MessageList v-else :compatibility-relay="false" variant="workspace" />

          <TrChat.Footer>
            <TrChat.Attachments />
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.WorkspaceLayout>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const granularConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Root + primitives',
    welcomeTitle: 'Official Root + primitives entry',
    welcomeDescription: 'Compose the public building blocks directly when you want to own page structure yourself.',
    workspace: true,
    contentLayout: 'wide',
  }),
)

const granularResolution = computed(() => createRuntimeFromConfig(granularConfig.value))
const showWelcome = computed(() => granularResolution.value.runtime.conversation.messages.value.length === 0)
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
}

.granular-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.granular-panel p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}
</style>
