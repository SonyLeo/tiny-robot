<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(layoutMode === 'centered')" @click="layoutMode = 'centered'">居中布局</button>
      <button :class="buttonClass(layoutMode === 'wide')" @click="layoutMode = 'wide'">宽布局</button>
      <button :class="buttonClass(showHistory)" @click="showHistory = !showHistory">历史入口</button>
      <button :class="buttonClass(showFeedback)" @click="showFeedback = !showFeedback">反馈能力</button>
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

const layoutMode = ref<'centered' | 'wide'>('centered')
const showHistory = ref(true)
const showFeedback = ref(true)

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'presetOverrides 示例',
    },
    welcome: {
      title: '页面级覆盖层',
      description: '这里会同时覆盖 contentLayout、history、feedback 和 sender actions。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('presetOverrides'),
})

const presetOverrides = computed(() => ({
  contentLayout: layoutMode.value,
  showHistory: showHistory.value,
  showFeedback: showFeedback.value,
  placeholder: layoutMode.value === 'wide' ? '当前是 wide 布局...' : '当前是 centered 布局...',
  senderActionsFeature: {
    wordCount: true,
  },
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
  flex-wrap: wrap;
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
