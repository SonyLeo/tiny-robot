<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(layoutMode === 'centered')" @click="layoutMode = 'centered'">居中布局</button>
      <button :class="buttonClass(layoutMode === 'wide')" @click="layoutMode = 'wide'">宽布局</button>
      <button :class="buttonClass(themeMode === 'light')" @click="themeMode = 'light'">浅色主题</button>
      <button :class="buttonClass(themeMode === 'dark')" @click="themeMode = 'dark'">深色主题</button>
      <button :class="buttonClass(showHistory)" @click="showHistory = !showHistory">历史入口</button>
      <button :class="buttonClass(showFeedback)" @click="showFeedback = !showFeedback">反馈能力</button>
    </div>
    <div class="demo-note">
      默认 `centered` 会把内容区限制在 `1000px` 内，`wide` 会铺满可用容器。当前文档预览通常不足
      `1000px`，所以这个示例把演示阈值临时压到了 `560px`，方便直接看到差异。在真实页面里，容器宽度达到 `1000px`
      以上时变化最明显。
    </div>
    <div class="chat-demo-container" data-demo-layout-preview="true">
      <TrChat :config="chatConfig" :runtime="{ initialMessages }" :preset-overrides="presetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'

const layoutMode = ref<'centered' | 'wide'>('centered')
const themeMode = ref<'light' | 'dark'>('light')
const showHistory = ref(true)
const showFeedback = ref(true)

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: '页面级覆盖示例',
    },
    welcome: {
      title: '页面级覆盖',
      description: '这里会同时覆盖 contentLayout、history、feedback 和发送区扩展动作。',
    },
  },
}

const initialMessages = [
  {
    role: 'assistant',
    content:
      '这是一段专门用来观察 contentLayout 的演示消息。centered 会把欢迎区、消息区和底部输入区收束在一个最大宽度内，wide 则会尽量铺满整个可用容器。',
  },
  {
    role: 'user',
    content: '请直接展示 centered 和 wide 在当前文档预览里的差别。',
  },
  {
    role: 'assistant',
    content:
      '在真实组件默认值里，centered 的上限是 1000px。为了让文档里的预览窗口也能一眼看出差异，这个示例会把演示阈值临时压到 560px；切到 wide 后，消息列和输入区会明显向两侧展开。',
  },
]

const presetOverrides = computed(() => ({
  appearance: {
    mode: themeMode.value,
  },
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

.demo-note {
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
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
  --chat-content-max-width: 560px;
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
