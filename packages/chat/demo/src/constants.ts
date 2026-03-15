import { IconAi } from '@opentiny/tiny-robot-svgs'
import type { PromptProps } from '@opentiny/tiny-robot'
import { DEMO_RETRY_TRIGGER } from './utils/demoRetryProvider'

export const WELCOME_CONFIG = {
  icon: IconAi,
  title: 'Welcome to TinyRobot',
  description: `Try asking me anything, or type ${DEMO_RETRY_TRIGGER} to test retry.`,
}

export const PROMPTS: PromptProps[] = [
  { label: 'Explain React hooks', description: 'Explain React hooks' },
  { label: 'Write a Python function', description: 'Write a Python function' },
  { label: 'Summarize this text', description: 'Summarize this text' },
  { label: 'Generate a poem', description: 'Generate a poem' },
  { label: 'Test retry flow', description: DEMO_RETRY_TRIGGER },
]

export const BRAND_CONFIG = {
  title: 'TinyRobot Chat',
}
