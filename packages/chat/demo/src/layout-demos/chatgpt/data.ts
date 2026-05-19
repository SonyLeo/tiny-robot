import {
  IconCopy,
  IconDislike,
  IconEdit,
  IconFileFolder,
  IconLike,
  IconMore,
  IconRefresh,
  IconSearch,
  IconShare,
  IconSparkles,
} from '@opentiny/tiny-robot-svgs'

export const chatGptNavItems = [
  { label: '新聊天', icon: IconEdit },
  { label: '搜索聊天', icon: IconSearch },
  { label: '项目', icon: IconFileFolder },
  { label: 'Codex', icon: IconSparkles },
  { label: '更多', icon: IconMore },
] as const

export const chatGptRecentChats = ['问候交流', 'Greetings Exchange', '问候交流', '问候交流', '123 Response'] as const

export const chatGptAssistantActions = [IconCopy, IconLike, IconDislike, IconShare, IconRefresh, IconMore] as const
