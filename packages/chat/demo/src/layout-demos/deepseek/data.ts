import { IconBrowser, IconCopy, IconLike, IconRefresh, IconShare, IconThink } from '@opentiny/tiny-robot-svgs'

export const historyGroups = [
  {
    label: 'Today',
    items: ['How to say protagonist', 'How to remove a git worktree'],
  },
  {
    label: '7 days',
    items: [
      'Ask an AI assistant',
      'Subject line rewrite ideas',
      'Open source stack notes',
      'Python startswith explained',
    ],
  },
  {
    label: '30 days',
    items: ['Currency conversion lookup', 'Emoji meaning analysis'],
  },
] as const

export const actionIcons = [IconCopy, IconRefresh, IconLike, IconShare] as const

export const composerModes = [
  { icon: IconThink, label: 'Deep think', accent: false },
  { icon: IconBrowser, label: 'Web search', accent: true },
] as const
