import type { ChatConfig } from '@opentiny/tiny-robot-chat'

const chatConfig: ChatConfig = {
  models: [
    {
      id: '__DEFAULT_MODEL__',
      provider: '__DEFAULT_PROVIDER__',
      label: '__DEFAULT_MODEL__',
    },
  ],
  providers: {
    __DEFAULT_PROVIDER__: {
      type: 'openai-compatible',
      endpoint: import.meta.env.VITE_CHAT_API_ENDPOINT || '/api/chat',
    },
  },
  defaults: {
    model: '__DEFAULT_MODEL__',
    systemPrompt: 'You are a helpful assistant.',
  },
  ui: {
    brand: {
      title: '__PROJECT_TITLE__',
    },
    welcome: {
      title: 'AI Assistant',
      description: '你好，我是你的 AI 助手，有什么可以帮你的？',
    },
    prompts: [
      { label: '✍️ 写作', description: '帮我写一篇关于...' },
      { label: '💻 编程', description: '帮我写一个...' },
      { label: '📊 分析', description: '帮我分析...' },
      { label: '🌐 翻译', description: '帮我翻译...' },
    ],
  },
}

export default chatConfig
