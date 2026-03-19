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
    systemPrompt: 'You are a tool-using assistant. Prefer tool results when a suitable MCP tool is enabled.',
  },
  ui: {
    brand: {
      title: '__PROJECT_TITLE__',
    },
    welcome: {
      title: 'Agent MCP Workspace',
      description: '启用右上角 MCP 面板，管理工具并开始一次带工具协作的对话。',
    },
    prompts: [
      { label: '工具清单', description: '先告诉我当前可用的 MCP 工具有哪些。' },
      { label: '天气查询', description: '如果天气工具可用，请查询今天上海的天气。' },
      { label: '调试计划', description: '请根据当前可用工具，给我一个排查线上问题的计划。' },
    ],
  },
  features: {
    history: true,
  },
}

export default chatConfig
