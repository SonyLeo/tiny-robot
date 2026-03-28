<template>
  <div v-if="isShow" data-testid="chat-blackbox-edge" class="chat-wrapper">
    <div class="status-bar">
      <span data-testid="on-error-log">{{ errorLog }}</span>
    </div>

    <TrChat.Scaffold :config="edgeConfig" :callbacks="edgeCallbacks" :preset-overrides="edgePresetOverrides">
      <template #default="{ chatKit, presetSlices }">
        <TrChat.Layout
          :show="isShow"
          :appearance="presetSlices.appearance.appearance"
          :role-configs="presetSlices.layout.roleConfigs"
        >
          <TrChat.Header
            :title="presetSlices.header.title"
            :show-history="presetSlices.header.showHistory"
            :show-new-chat="false"
            show-close
            @close="isShow = false"
          >
            <template #extra>
              <button data-testid="custom-header-btn">自定义按钮</button>
            </template>
          </TrChat.Header>

          <TrChat.Welcome
            v-if="chatKit.messages.value.length === 0 && presetSlices.welcome"
            v-bind="presetSlices.welcome"
            @prompt-click="chatKit.sendMessage($event)"
          />

          <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

          <TrChat.Footer>
            <template #extra>
              <div data-testid="custom-footer-extra">这是 Footer 额外区域</div>
            </template>
            <TrChat.Attachments />
            <TrChat.Sender v-bind="presetSlices.sender" />
          </TrChat.Footer>

          <TrChat.History :enabled="presetSlices.history.enabled" />
        </TrChat.Layout>
      </template>
    </TrChat.Scaffold>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import {
  createChatSceneConfig,
  edgeAttachmentsFeature,
  edgeSenderActionsFeature,
  sharedBrand,
  sharedPrompts,
  sharedWelcome,
} from './sharedDemoFixtures'

const errorLog = ref('')
const isShow = ref(true)

const edgeConfig = createChatSceneConfig({
  models: [{ id: 'edge-model', label: 'Edge Model', providerId: 'edge' }],
  ui: {
    brand: sharedBrand,
    welcome: sharedWelcome,
    prompts: sharedPrompts,
  },
  features: {
    attachments: edgeAttachmentsFeature,
    senderActions: edgeSenderActionsFeature,
    history: true,
  },
})

const edgeCallbacks = {
  onFinish(message: { content?: string }) {
    errorLog.value = `finish:${message.content?.slice(0, 40) ?? ''}`
  },
  onError(error: Error) {
    errorLog.value = `error:${error.message}`
  },
}

const edgePresetOverrides = computed(() => ({
  roleConfigs: {
    user: { placement: 'start' },
    assistant: { placement: 'end' },
  },
  senderProps: {
    maxLength: 5,
  },
}))
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
}

.status-bar span {
  padding: 2px 6px;
  background: #e8e8e8;
  border-radius: 3px;
}
</style>
