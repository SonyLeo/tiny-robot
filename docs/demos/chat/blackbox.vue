<template>
  <div class="chat-demo-container">
    <TrChat
      :config="chatConfig"
      :runtime="{ chatKit }"
      :callbacks="{ onFinish, onError }"
      :preset-overrides="{
        showHistory: true,
        placeholder: '请输入问题...',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import type { BrandConfig, ChatConfig, ResponseProvider, WelcomeConfig } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { PromptProps } from '@opentiny/tiny-robot'

const brand: BrandConfig = {
  title: 'TinyRobot Chat',
}

const welcome: WelcomeConfig = {
  title: '欢迎使用 Chat 套件',
  description: '只需几行代码即可拥有完整对话 UI',
}

const prompts: PromptProps[] = [
  { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
  { label: '流式响应', description: '演示一下打字机效果' },
]

const chatConfig: ChatConfig = {
  models: [{ id: 'mock-model', provider: 'mock' }],
  providers: {
    mock: {
      type: 'openai-compatible',
      endpoint: '/api/mock-chat',
    },
  },
  defaults: {
    model: 'mock-model',
  },
  ui: {
    brand,
    welcome,
    prompts,
  },
}

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

const chatKit = useChatKit({
  responseProvider,
})

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
