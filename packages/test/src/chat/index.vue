<template>
  <div class="chat-demo">
    <h2>Chat 组件测试</h2>

    <div class="mode-switcher">
      <button data-testid="switch-blackbox" :class="{ active: mode === 'blackbox' }" @click="mode = 'blackbox'">
        黑盒模式
      </button>
      <button data-testid="switch-whitebox" :class="{ active: mode === 'whitebox' }" @click="mode = 'whitebox'">
        白盒模式
      </button>
      <button
        data-testid="switch-blackbox-edge"
        :class="{ active: mode === 'blackbox-edge' }"
        @click="mode = 'blackbox-edge'"
      >
        边缘场景
      </button>
    </div>

    <div v-if="mode === 'blackbox'" data-testid="chat-blackbox" class="chat-wrapper">
      <TrChat
        :brand="brand"
        :welcome="welcome"
        :prompts="prompts"
        :models="models"
        :provider-factories="providerFactories"
        default-model="openai-test"
        placeholder="请输入消息..."
        show-history
        v-model:fullscreen="isFullscreen"
        @finish="handleFinish"
        @error="handleError"
      />
    </div>

    <div v-if="mode === 'blackbox-edge' && isShow" data-testid="chat-blackbox-edge" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="on-error-log">{{ errorLog }}</span>
      </div>
      <TrChat
        :response-provider="edgeResponseProvider"
        :brand="brand"
        placeholder="请输入消息..."
        show-history
        enable-fullscreen
        v-model:fullscreen="isFullscreen"
        v-model:show="isShow"
        :role-configs="{ user: { placement: 'start' }, assistant: { placement: 'end' } }"
        :sender-props="{ maxLength: 5 }"
        @finish="handleFinish"
        @error="handleError"
      >
        <template #header-extra>
          <button data-testid="custom-header-btn">右侧按钮</button>
        </template>
        <template #footer-extra>
          <div data-testid="custom-footer-extra">这是 Footer 额外区域</div>
        </template>
      </TrChat>
    </div>

    <div v-if="mode === 'whitebox'" data-testid="chat-whitebox" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="status-indicator">{{ status }}</span>
        <span data-testid="message-count">{{ messages.length }}</span>
        <span data-testid="on-finish-log">{{ finishLog }}</span>
      </div>

      <TrChat.Root :chat-kit="chat">
        <TrChat.Layout :fullscreen="false">
          <TrChat.Header show-history />

          <TrChat.Welcome
            v-if="messages.length === 0"
            title="白盒模式测试"
            description="验证 Root、inject 和手动组合链路"
            :prompts="prompts"
            @prompt-click="handlePromptClick"
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <div class="whitebox-footer">
              <TrModelSelector
                v-model="selectedModel"
                :models="models"
                :provider-factories="providerFactories"
                @change="handleModelChange"
              />
              <TrChat.Sender placeholder="白盒模式请输入消息..." />
            </div>
          </TrChat.Footer>

          <TrChat.History />
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, TrModelSelector, useChatKit, useModelSelector } from '../../../chat/src'
import type { ModelOption, ModelProviderFactory } from '../../../chat/src/types'
import type { ChatCompletion } from '../../../kit/src/vue/message/types'
import { createMockFactory, createMockProvider } from './mockProvider'

const mode = ref<'blackbox' | 'whitebox' | 'blackbox-edge'>('blackbox')
const finishLog = ref('')
const errorLog = ref('')
const isFullscreen = ref(false)
const isShow = ref(true)

const models: ModelOption[] = [
  { value: 'openai-test', label: 'OpenAI Test', provider: 'openai' },
  { value: 'deepseek-test', label: 'DeepSeek Test', provider: 'deepseek' },
]

const providerFactories: ModelProviderFactory[] = [createMockFactory('openai'), createMockFactory('deepseek')]

const edgeBaseProvider = createMockProvider({
  provider: 'edge-provider',
  model: 'edge-model',
})

const edgeResponseProvider = async function* (
  body: unknown,
  signal: AbortSignal,
): AsyncGenerator<ChatCompletion, void, unknown> {
  const stream = await edgeBaseProvider(body as never, signal)
  yield* stream as AsyncGenerator<ChatCompletion, void, unknown>
}

const brand = {
  title: 'Chat Kit 测试',
}

const welcome = {
  title: 'TinyRobot',
  description: '用于验证 Chat Kit 的 E2E 主链路。',
}

const prompts = [
  { label: '总结一下', description: '请帮我总结这个问题。' },
  { label: '生成问候语', description: '请输出 Hello World。' },
]

function handleFinish(msg: { content?: string }) {
  finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
}

function handleError(err: Error) {
  finishLog.value = `error:${err.message}`
  errorLog.value = `error:${err.message}`
}

const selectedModel = ref('openai-test')
const chat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: selectedModel.value,
  }),
  onFinish: (msg) => {
    finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
  },
  onError: (err) => {
    finishLog.value = `error:${err.message}`
  },
})

const { messages, status } = chat

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models,
  providerFactories,
  chatKit: chat,
})

function handlePromptClick(description: string) {
  chat.sendMessage(description)
}

function handleModelChange(model: ModelOption) {
  selectModel(model)
}
</script>

<style scoped>
.chat-demo {
  max-width: 100%;
  margin: 0 auto;
}

.mode-switcher {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 0 20px;
}

.mode-switcher button {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-switcher button.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

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

.whitebox-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
