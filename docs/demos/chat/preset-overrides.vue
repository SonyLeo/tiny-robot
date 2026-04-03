<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(pageMode === 'base')" @click="pageMode = 'base'">基础页</button>
      <button :class="buttonClass(pageMode === 'override')" @click="pageMode = 'override'">覆盖页</button>
    </div>

    <div class="demo-note">
      <strong>{{ activeScenario.title }}</strong>
      <div class="demo-note-text">{{ activeScenario.description }}</div>
      <div class="demo-note-text">
        这个示例会把 `centered` 的演示阈值临时压到 `560px`，方便在文档预览里直接看出 `contentLayout` 的差异。
      </div>
    </div>

    <div class="override-chips">
      <span v-for="item in activeScenario.chips" :key="item" class="override-chip">{{ item }}</span>
    </div>

    <div class="chat-demo-container" data-demo-layout-preview="true">
      <TrChat :config="chatConfig" :runtime="{ initialMessages }" :preset-overrides="activePresetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'

type PageMode = 'base' | 'override'

const pageMode = ref<PageMode>('override')

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
      title: '同一份基础配置',
      description: '这里演示的不是 feature 开关，而是同一份 config 在不同页面里的轻量差异。',
    },
  },
  layout: {
    contentLayout: 'centered' as const,
  },
  features: {
    history: false,
    feedback: false,
    senderActions: false,
  },
}

const initialMessages = [
  {
    role: 'assistant',
    content: '这是一段专门用来观察页面级覆盖的演示消息。你现在看到的是同一份基础 config 下的某个页面实例。',
  },
  {
    role: 'user',
    content: '请说明为什么这里更适合用 presetOverrides，而不是再维护一份新的 config。',
  },
  {
    role: 'assistant',
    content:
      '因为模型、provider 和大多数 UI 默认值都没变，变化的只是当前页面对主题、宽度、history、feedback 和发送区细节的轻量调整。',
  },
]

const scenarios = {
  base: {
    title: '基础页',
    description: '直接使用基础 config，不额外增加页面差异。适合默认聊天页或最普通的业务接入页。',
    chips: ['无页面级覆盖', 'centered', 'history 关闭', 'feedback 关闭'],
    overrides: {},
  },
  override: {
    title: '覆盖页',
    description:
      '保持基础 config 不变，只在当前页面通过 `presetOverrides` 调整主题、内容宽度、history、feedback 和发送区行为。',
    chips: ['appearance.dark', 'contentLayout: wide', 'showHistory', 'showFeedback', 'maxLength: 300', 'wordCount'],
    overrides: {
      appearance: {
        mode: 'dark' as const,
      },
      contentLayout: 'wide' as const,
      showHistory: true,
      showFeedback: true,
      placeholder: '当前是覆盖页...',
      maxLength: 300,
      senderActionsFeature: {
        enabled: true,
        wordCount: true,
      },
    },
  },
} as const

const activeScenario = computed(() => scenarios[pageMode.value])
const activePresetOverrides = computed(() => activeScenario.value.overrides)

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

.demo-note {
  display: grid;
  gap: 6px;
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.demo-note-text {
  margin: 0;
}

.override-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.override-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: #175cd3;
  background: #eff6ff;
  border: 1px solid #b2ddff;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.4;
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
