import type { TrChatConfig } from '@opentiny/tiny-robot-chat'

export const chatConfig: TrChatConfig = {
  request: {
    models: [
      { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant.',
    },
  },
  ui: {
    brand: { title: 'TinyRobot Chat' },
    welcome: {
      title: '自定义 Workspace 布局',
      description: '这个示例使用 TrChat.WorkspaceLayout 自定义左右侧边栏，中间用 primitives 组合聊天区。',
      prompts: [
        { label: '侧边栏', description: '如何用 WorkspaceLayout 的 #left 和 #right slots 自定义侧边栏？' },
        { label: '叶子组件', description: '什么时候该直接使用 TrChat.Sender 和 TrChat.MessageList？' },
      ],
    },
    contentLayout: 'wide',
  },
  conversation: {
    initialMessages: [
      {
        role: 'assistant',
        content: '这个示例展示了自定义左侧面板、自定义右侧面板，以及用 primitives 组合的中间聊天区。',
      },
      {
        role: 'user',
        content: '如何用 WorkspaceLayout 替换侧边栏内容？',
      },
      {
        role: 'assistant',
        content:
          '使用 TrChat.WorkspaceLayout 的 #left 和 #right slots 替换默认侧边栏，中间放 TrChat.Layout 即可。将鼠标悬停在下方反馈栏的 ℹ 图标上，可以查看本条回复的用量信息。',
        metadata: {
          model: 'gpt-4.1-mini',
          usage: {
            prompt_tokens: 128,
            completion_tokens: 56,
            total_tokens: 184,
          },
          choices: [{ finish_reason: 'stop' }],
          createdAt: Math.floor(Date.now() / 1000),
        },
      },
    ],
  },
  sender: {
    placeholder: '请输入问题...',
    mode: 'multiple',
    maxLength: 200,
    wordCount: true,
  },
  history: { enabled: true, defaultOpen: false },
  workspace: {
    enabled: true,
    defaultView: 'workspace',
    left: { enabled: true, defaultOpen: true, collapseMode: 'rail', width: 280 },
    right: { enabled: true, defaultOpen: true, collapseMode: 'hidden', width: 320 },
  },
  messages: { feedback: { enabled: true } },
}
