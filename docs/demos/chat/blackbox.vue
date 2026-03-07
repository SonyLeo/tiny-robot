<template>
  <div class="chat-demo-container">
    <TrChat
      :response-provider="responseProvider"
      :brand="brand"
      :welcome="welcome"
      :prompts="prompts"
      placeholder="请输入问题..."
      show-history
      @finish="onFinish"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'
import type { ResponseProvider, WelcomeConfig, BrandConfig } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { PromptProps } from '@opentiny/tiny-robot'

// --- 品牌 ---
const brand: BrandConfig = {
  title: 'TinyRobot Chat',
}

// --- 欢迎页配置 ---
const welcome: WelcomeConfig = {
  title: '欢迎使用 Chat 套件',
  description: '只需几行代码即可拥有完整对话 UI',
}

const prompts: PromptProps[] = [
  { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
  { label: '流式响应', description: '演示一下打字机效果' },
]

// --- 模拟流式 ResponseProvider ---
const responseProvider: ResponseProvider = async function* (requestBody, _abortSignal) {
  const lastMsg = requestBody.messages[requestBody.messages.length - 1]
  const text = `这是对 "${lastMsg.content ?? ''}" 的模拟流式回复。大模型逐个吐字的效果就是这样产生的。`

  for (let i = 0; i < text.length; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 50))
    yield {
      id: 'mock_id',
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'mock-model',
      system_fingerprint: null,
      choices: [{ index: 0, delta: { content: text[i] }, message: undefined, logprobs: null, finish_reason: null }],
    }
  }
}

function onFinish(message: ChatMessage) {
  console.log('生成完成:', message)
}

function onError(error: Error) {
  console.error('发生错误:', error)
}
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}
</style>
