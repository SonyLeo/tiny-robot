import { IconAi } from '@opentiny/tiny-robot-svgs'

export const WELCOME_CONFIG = {
  icon: IconAi,
  title: 'Welcome to TinyRobot',
  description: 'Try a normal chat request, switch models, or enable MCP tools to inspect the tool chain.',
}

export const WELCOME_PROMPTS = [
  {
    id: 'daily-assistant',
    label: 'Daily Assistant',
    description: 'Help me plan today, organize a trip, or draft a short email.',
    size: 'large' as const,
  },
  {
    id: 'learning',
    label: 'Learning',
    description: 'Explain the difference between Vue 3 and React in a practical way.',
    size: 'large' as const,
  },
  {
    id: 'creative',
    label: 'Creative Writing',
    description: 'Help me name a project, write a tagline, or brainstorm fresh ideas.',
    size: 'large' as const,
  },
]

export const BRAND_CONFIG = {
  title: 'TinyRobot Chat',
}
