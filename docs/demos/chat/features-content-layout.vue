<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(!isFullWidth)" @click="isFullWidth = false">centered</button>
      <button :class="buttonClass(isFullWidth)" @click="isFullWidth = true">wide</button>
    </div>
    <div class="chat-demo-container">
      <TrChat :config="chatConfig" :runtime="{ chatKit }" :preset-overrides="presetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const isFullWidth = ref(false)

const chatConfig = createDemoChatConfig({
  layout: {
    contentLayout: 'centered',
  },
  ui: {
    brand: {
      title: 'contentLayout 覆盖',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('contentLayout'),
})

const presetOverrides = computed(() => ({
  contentLayout: isFullWidth.value ? 'wide' : 'centered',
}))

function buttonClass(active: boolean) {
  return ['toolbar-button', { active }]
}
</script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.demo-toolbar {
  display: flex;
  gap: 8px;
}

.toolbar-button {
  padding: 8px 12px;
  color: #344054;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 999px;
  cursor: pointer;
}

.toolbar-button.active {
  color: #175cd3;
  background: #eff6ff;
  border-color: #b2ddff;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
