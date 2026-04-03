<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(stateMode === 'conversation')" @click="setConversationState">会话态</button>
      <button :class="buttonClass(stateMode === 'welcome')" @click="setWelcomeState">欢迎态</button>
      <button :class="buttonClass(true)" @click="toggleTheme">
        主题：{{ themeMode === 'light' ? '浅色' : '深色' }}
      </button>
      <button :class="buttonClass(showHistory)" @click="showHistory = !showHistory">历史入口</button>
      <button :class="buttonClass(showFeedback)" @click="showFeedback = !showFeedback">反馈能力</button>
      <button :class="buttonClass(showWordCount)" @click="showWordCount = !showWordCount">字数统计</button>
      <button :class="buttonClass(showPrompts)" @click="showPrompts = !showPrompts">欢迎提示词</button>
    </div>

    <div class="demo-note">
      这个示例先把稳定默认值收敛到 `config.features`，再通过 `presetOverrides` 切换当前页面差异。切到“欢迎态”可观察
      prompts，切到“会话态”更容易观察主题、历史入口、反馈和字数统计。
    </div>

    <div class="chat-demo-container">
      <TrChat :config="chatConfig" :runtime="{ chatKit }" :preset-overrides="presetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, createChatAdapterFromConfig, useChatKit } from '@opentiny/tiny-robot-chat'

const stateMode = ref<'welcome' | 'conversation'>('conversation')
const themeMode = ref<'light' | 'dark'>('light')
const showHistory = ref(true)
const showFeedback = ref(true)
const showWordCount = ref(true)
const showPrompts = ref(true)

const welcomePrompts = [
  { label: '快速上手', description: '我应该先看哪一页文档？' },
  { label: '功能开关', description: 'history、feedback、attachments 分别该写在哪里？' },
]

const conversationMessages = [
  {
    role: 'assistant',
    content: '这是一组预填充消息，用来观察主题、feedback 和 sender actions 的开关效果。',
  },
  {
    role: 'user',
    content: '请说明 config.features 和 presetOverrides 的职责边界。',
  },
  {
    role: 'assistant',
    content: '一个适合记忆的方法是：稳定默认值放进 config.features，当前页面差异优先放进 presetOverrides。',
  },
]

const chatConfig = {
  models: [{ id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' }],
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
      title: 'Chat 配置与能力',
    },
    welcome: {
      title: '综合能力示例',
      description: '在一个页面里观察 features 和页面级覆盖是如何配合的。',
    },
    prompts: welcomePrompts,
  },
  features: {
    history: false,
    feedback: false,
    senderActions: false,
    welcomePrompts: false,
  },
}

const adapter = createChatAdapterFromConfig(chatConfig)
const chatKit = useChatKit({
  responseProvider: adapter.createResponseProvider(adapter.defaultModel),
})

function setConversationState() {
  stateMode.value = 'conversation'

  if (!chatKit.activeConversation.value) {
    const conversation = chatKit.createConversation({ title: 'Feature Playground' })
    conversation.engine.messages.value.push(...conversationMessages.map((message) => ({ ...message })))
    return
  }

  const activeMessages = chatKit.activeConversation.value.engine.messages.value
  if (!activeMessages.length) {
    activeMessages.push(...conversationMessages.map((message) => ({ ...message })))
  }
}

function setWelcomeState() {
  stateMode.value = 'welcome'
  chatKit.runtime.clear()
}

const presetOverrides = computed(() => ({
  appearance: {
    mode: themeMode.value,
  },
  showHistory: showHistory.value,
  showFeedback: showFeedback.value,
  prompts: showPrompts.value ? welcomePrompts : [],
  maxLength: showWordCount.value ? 300 : undefined,
  senderActionsFeature: showWordCount.value
    ? {
        enabled: true,
        wordCount: true,
      }
    : undefined,
}))

function buttonClass(active: boolean) {
  return ['toolbar-button', { active }]
}

function toggleTheme() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

setConversationState()
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

.demo-note {
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
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
  height: 580px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
