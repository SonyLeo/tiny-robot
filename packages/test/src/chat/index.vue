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
      <button
        data-testid="switch-blackbox-edge"
        :class="{ active: mode === 'blackbox-edge' }"
        @click="mode = 'blackbox-edge'"
      >
        边缘用例测试
      </button>
    </div>

    <!-- =================== 黑盒模式 =================== -->
    <div v-if="mode === 'blackbox'" data-testid="chat-blackbox" class="chat-wrapper">
      <TrChat
        :response-provider="responseProvider"
        :brand="brand"
        :welcome="welcome"
        :prompts="prompts"
        placeholder="请输入消息..."
        show-history
        v-model:fullscreen="isFullscreen"
        @finish="handleFinish"
        @error="handleError"
      />
    </div>

    <!-- =================== 黑盒模式（边缘边界用例） =================== -->
    <div v-if="mode === 'blackbox-edge' && isShow" data-testid="chat-blackbox-edge" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="on-error-log">{{ errorLog }}</span>
      </div>
      <TrChat
        :response-provider="responseProvider"
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
          <div data-testid="custom-footer-extra">这是Footer额外区域</div>
        </template>
      </TrChat>
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
import { ref } from 'vue'
import { TrChat, useChatKit } from '../../../chat/src'
import { createMockProvider } from './mockProvider'

const mode = ref<'blackbox' | 'whitebox' | 'blackbox-edge'>('blackbox')
const finishLog = ref('')
const errorLog = ref('')
const isFullscreen = ref(false)
const isShow = ref(true)

// === 共享的 mock provider，并拦截触发异常的特定文本 ===
const baseProvider = createMockProvider()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const responseProvider = async function* (body: any, signal: any) {
  const userMsg = body.messages?.[body.messages.length - 1]?.content
  if (userMsg === 'err') {
    throw new Error('Mock API Error: 模拟请求失败')
  }

  // 最佳实践：先 await 抹平外层的 Promise 包装，不论原来是同步还是异步
  const result = await baseProvider(body, signal)

  // 如果结果具有 Symbol.asyncIterator 属性，说明是流式输出（AsyncGenerator）
  if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yield* result as AsyncGenerator<any, any, any>
  } else {
    // 否则说明是非流式的一维返回，直接 yield 单个结果
    yield result
  }
}

// === UI-B1：品牌配置（Header 左侧标题） ===
const brand = {
  title: 'Chat Kit 测试',
}

// === Welcome 区配置（与品牌标题分离） ===
const welcome = {
  title: 'TinyRobot',
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
  errorLog.value = `error:${err.message}`
}

// === 白盒模式 ===
const chat = useChatKit({
  responseProvider: responseProvider,
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
