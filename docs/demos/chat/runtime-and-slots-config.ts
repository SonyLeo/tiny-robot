import type { TrChatConfig } from '@opentiny/tiny-robot-chat'

export const chatConfig: TrChatConfig = {
  request: {
    models: [
      { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
        systemPrompt: 'You are a helpful assistant.',
      },
    },
  },
  ui: {
    brand: { title: 'TinyRobot Chat' },
    welcome: {
      title: 'Runtime + Slots 示例',
      description: '这个示例展示如何自己持有 runtime，并通过 Page slots 做轻量扩展。',
      prompts: [
        { label: 'Runtime', description: '为什么要用 createRuntimeFromConfig？' },
        { label: 'Slots', description: 'TrChat.Page 有哪些 slots 可以用？' },
      ],
    },
    contentLayout: 'centered',
  },
  sender: {
    placeholder: '请输入问题...',
    mode: 'multiple',
  },
  history: { enabled: true, defaultOpen: false },
  workspace: {
    enabled: true,
    defaultView: 'workspace',
    left: { enabled: true, defaultOpen: true, collapseMode: 'rail' },
    right: { enabled: false },
  },
  messages: { feedback: { enabled: true } },
}
