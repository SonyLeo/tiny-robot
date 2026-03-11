import { IconAi } from '@opentiny/tiny-robot-svgs'

export const AVAILABLE_MODELS = ['deepseek-reasoner', 'deepseek-chat']

export const WELCOME_CONFIG = {
  icon: IconAi,
  title: 'Welcome to TinyRobot Chat',
  description: 'Try asking me anything. I can help with coding, writing, analysis, and more.',
}

export const PROMPTS = [
  { label: 'Explain React hooks', description: 'Explain React hooks' },
  { label: 'Write a Python function', description: 'Write a Python function' },
  { label: 'Summarize this text', description: 'Summarize this text' },
  { label: 'Generate a poem', description: 'Generate a poem' },
]

export const BRAND_CONFIG = {
  title: 'TinyRobot Chat',
}
