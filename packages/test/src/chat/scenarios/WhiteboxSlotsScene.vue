<template>
  <div class="whitebox-slots-grid">
    <!-- 7.2: header-extra / footer-extra / welcome slot passthrough -->
    <div data-testid="chat-whitebox-slots-basic" class="chat-wrapper">
      <TrChat.Root :runtime="basicResolution.runtime" :ui="basicResolution.ui">
        <TrChat.Page>
          <template #header-extra>
            <span data-testid="wb-header-extra">Header Extra</span>
          </template>
          <template #footer-extra>
            <span data-testid="wb-footer-extra">Footer Extra</span>
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>

    <!-- 7.2: welcome slot replaces default welcome -->
    <div data-testid="chat-whitebox-slots-welcome" class="chat-wrapper">
      <TrChat.Root :runtime="welcomeResolution.runtime" :ui="welcomeResolution.ui">
        <TrChat.Page>
          <template #welcome>
            <div data-testid="wb-custom-welcome">Custom Welcome Slot</div>
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>

    <!-- 7.2: sender slot receives live slot props -->
    <div data-testid="chat-whitebox-slots-sender" class="chat-wrapper">
      <TrChat.Root :runtime="senderResolution.runtime" :ui="senderResolution.ui">
        <TrChat.Page>
          <template #sender="{ send, status, lastError, retry }">
            <div class="wb-sender-slot">
              <span data-testid="wb-sender-status">status:{{ status.value }}</span>
              <span data-testid="wb-sender-error">error:{{ lastError.value ? 'yes' : 'no' }}</span>
              <button data-testid="wb-sender-send" @click="send('wb-slot-send')">Send</button>
              <button data-testid="wb-sender-retry" @click="retry()">Retry</button>
            </div>
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>

    <!-- 7.2: message-list slot receives messages ref -->
    <div data-testid="chat-whitebox-slots-msglist" class="chat-wrapper">
      <TrChat.Root :runtime="msgListResolution.runtime" :ui="msgListResolution.ui">
        <TrChat.Page>
          <template #message-list="{ messages }">
            <div data-testid="wb-msglist-count">messages:{{ messages.value.length }}</div>
          </template>
          <template #sender="{ send, status }">
            <div class="wb-sender-slot">
              <span data-testid="wb-msglist-status">status:{{ status.value }}</span>
              <button data-testid="wb-msglist-send" @click="send('wb-msglist-send')">Send</button>
            </div>
          </template>
        </TrChat.Page>
      </TrChat.Root>
    </div>

    <!-- 7.2: messageListVariant prop -->
    <div data-testid="chat-whitebox-slots-variant" class="chat-wrapper">
      <TrChat.Root :runtime="variantResolution.runtime" :ui="variantResolution.ui">
        <TrChat.Page message-list-variant="workspace" />
      </TrChat.Root>
    </div>

    <!-- 7.9: update:show and update:model emits -->
    <div data-testid="chat-whitebox-slots-emits" class="chat-wrapper">
      <div class="wb-emits-toolbar">
        <span data-testid="wb-emit-show">show:{{ emitShowLog }}</span>
        <span data-testid="wb-emit-model">model:{{ emitModelLog }}</span>
      </div>
      <TrChat.Root :runtime="emitsResolution.runtime" :ui="emitsResolution.ui">
        <TrChat.Page @update:show="emitShowLog = String($event)" @update:model="emitModelLog = String($event)" />
      </TrChat.Root>
    </div>

    <!-- 7.9: update:show via close button (granular path with TrChat.Header show-close) -->
    <div data-testid="chat-whitebox-slots-close" class="chat-wrapper">
      <div class="wb-emits-toolbar">
        <span data-testid="wb-emit-close-show">show:{{ emitCloseShowLog }}</span>
      </div>
      <TrChat.Root :runtime="closeResolution.runtime" :ui="closeResolution.ui">
        <TrChat.Layout>
          <TrChat.Header
            :title="closeResolution.ui.brand?.title"
            show-close
            :show-history="false"
            :show-new-chat="false"
            @close="emitCloseShowLog = 'false'"
          />
          <TrChat.Welcome :title="closeResolution.ui.welcome?.title" />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'

const emitShowLog = ref('none')
const emitModelLog = ref('none')
const emitCloseShowLog = ref('none')

const basicConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Basic',
    welcomeTitle: 'Whitebox Slots Basic',
    welcomeDescription: 'header-extra and footer-extra slots should pass through TrChat.Page.',
  }),
)

const welcomeConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Welcome',
    welcomeTitle: 'Default Welcome (should be replaced)',
    welcomeDescription: 'The welcome slot should replace this default content.',
  }),
)

const senderConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Sender',
    welcomeTitle: 'Whitebox Sender Slot',
    welcomeDescription: 'The sender slot should receive live send/status/lastError/retry props.',
  }),
)

const msgListConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots MsgList',
    welcomeTitle: 'Whitebox MsgList Slot',
    welcomeDescription: 'The message-list slot should receive a live messages ref.',
    initialMessages: [{ role: 'assistant', content: 'Initial message' }],
  }),
)

const variantConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Variant',
    welcomeTitle: 'Whitebox Variant',
    welcomeDescription: 'messageListVariant prop should be honored.',
    initialMessages: [
      { role: 'user', content: 'variant test' },
      { role: 'assistant', content: 'variant reply' },
    ],
  }),
)

const emitsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Emits',
    welcomeTitle: 'Whitebox Emits',
    welcomeDescription: 'update:show and update:model emits should fire correctly.',
    models: [
      { id: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
      { id: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
    ],
    defaultModelId: 'openai-test',
  }),
)

const basicResolution = useStableSceneRuntime(basicConfig)
const welcomeResolution = useStableSceneRuntime(welcomeConfig)
const senderResolution = useStableSceneRuntime(senderConfig)
const msgListResolution = useStableSceneRuntime(msgListConfig)
const variantResolution = useStableSceneRuntime(variantConfig)
const emitsResolution = useStableSceneRuntime(emitsConfig)

const closeConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Whitebox Slots Close',
    welcomeTitle: 'Whitebox Close Emit',
    welcomeDescription: 'Clicking the close button should emit update:show with false.',
  }),
)
const closeResolution = useStableSceneRuntime(closeConfig)
</script>

<style scoped>
.whitebox-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}

.wb-sender-slot {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.wb-sender-slot button {
  padding: 6px 12px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.wb-sender-slot span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
  font-size: 12px;
}

.wb-emits-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.wb-emits-toolbar span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}
</style>
