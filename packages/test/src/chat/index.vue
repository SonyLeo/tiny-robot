<template>
  <div class="chat-demo">
    <h2>Chat 组件测试</h2>

    <!-- 模式切换 -->
    <div class="mode-switcher">
      <button data-testid="switch-blackbox" :class="{ active: mode === 'blackbox' }" @click="mode = 'blackbox'">
        黑盒模式
      </button>
      <button data-testid="switch-whitebox" :class="{ active: mode === 'whitebox' }" @click="mode = 'whitebox'">
        白盒模式
      </button>
    </div>

    <!-- =================== 黑盒模式 =================== -->
    <div v-if="mode === 'blackbox'" data-testid="chat-blackbox" class="chat-wrapper">
      <TrChat
        :response-provider="responseProvider"
        :welcome="welcome"
        :prompts="prompts"
        placeholder="请输入消息..."
        show-history
        fullscreen
        @finish="handleFinish"
        @error="handleError"
      />
    </div>

    <!-- =================== 白盒模式 =================== -->
    <div v-if="mode === 'whitebox'" data-testid="chat-whitebox" class="chat-wrapper">
      <!-- 状态指示器（供测试断言） -->
      <div class="status-bar">
        <span data-testid="status-indicator">{{ status }}</span>
        <span data-testid="message-count">{{ messages.length }}</span>
        <span data-testid="on-finish-log">{{ finishLog }}</span>
      </div>

      <TrChat.Root :chat-kit="chat">
        <div class="tr-chat" style="height: calc(100vh - 120px)">
          <TrChat.Header show-history />

          <TrChat.Welcome
            v-if="messages.length === 0"
            title="白盒模式测试"
            description="验证 Root → inject → 子组件链路"
            :prompts="prompts"
            @prompt-click="handlePromptClick"
          />

          <TrChat.MessageList v-else auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="白盒发送..." />
          </TrChat.Footer>

          <TrChat.History />
        </div>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrChat, useChatKit } from '../../../chat/src'
import { createMockProvider } from './mockProvider'

const mode = ref<'blackbox' | 'whitebox'>('blackbox')
const finishLog = ref('')

// === 共享的 mock provider ===
const responseProvider = createMockProvider()

// === 共享配置 ===
const welcome = {
  title: '🤖 Chat Kit 测试',
  description: '这是 Chat Kit 的 E2E 测试页面',
}

const prompts = [
  { label: '✍️ 写作', description: '帮我写一篇测试文章' },
  { label: '💻 编程', description: '帮我写一个 Hello World' },
]

// === 黑盒模式回调 ===
function handleFinish(msg: { content?: string }) {
  finishLog.value = `finish:${msg.content?.slice(0, 20) ?? ''}`
}

function handleError(err: Error) {
  finishLog.value = `error:${err.message}`
}

// === 白盒模式 ===
const chat = useChatKit({
  responseProvider: createMockProvider(),
  onFinish: (msg) => {
    finishLog.value = `finish:${msg.content?.slice(0, 20) ?? ''}`
  },
  onError: (err) => {
    finishLog.value = `error:${err.message}`
  },
})

const { messages, status } = chat

function handlePromptClick(description: string) {
  chat.sendMessage(description)
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
</style>
