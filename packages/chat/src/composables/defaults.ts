import { h } from 'vue'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'

/**
 * 套件层内置默认 roleConfigs（UI-RC1）
 * - assistant：靠左（placement: 'start'）+ IconAi 头像
 * - user：靠右（placement: 'end'）+ IconUser 头像
 *
 * 用户传入的 roleConfigs 会与此默认值浅合并，用户配置优先。
 */
export const DEFAULT_ROLE_CONFIGS: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: h(IconAi, { style: { fontSize: '32px' } }),
  },
  user: {
    placement: 'end',
    avatar: h(IconUser, { style: { fontSize: '32px' } }),
  },
}
