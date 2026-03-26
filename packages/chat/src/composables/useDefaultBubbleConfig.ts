import { markRaw, h } from 'vue'
import { BubbleRenderers, BubbleRendererMatchPriority } from '@opentiny/tiny-robot'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  ErrorRenderer,
  EditInputRenderer,
  ToolCallsRenderer,
  AttachmentsRenderer,
  MarkStreamRenderer,
} from '../components/render'
import { hasChatMessageError, isChatMessageEditing, isChatMessageOptimistic } from './chatMessageState'

/**
 * 默认 Bubble 配置
 * 提供开箱即用的 renderer matches 和 roles
 * 支持通过 options 参数扩展或覆盖
 */
export interface UseDefaultBubbleConfigOptions {
  extraContentMatches?: BubbleContentRendererMatch[]
  extraBoxMatches?: BubbleBoxRendererMatch[]
  overrideRoles?: Record<string, BubbleRoleConfig>
}

export function useDefaultBubbleConfig(options?: UseDefaultBubbleConfigOptions) {
  /**
   * Content 渲染器匹配规则
   * 优先级从高到低：Error > Editing > ToolCalls > Attachment > Fallback
   */
  const contentMatches: BubbleContentRendererMatch[] = [
    {
      find: (message) => hasChatMessageError(message),
      renderer: markRaw(ErrorRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (message) => isChatMessageEditing(message),
      renderer: markRaw(EditInputRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
      renderer: markRaw(ToolCallsRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (_, content) => content?.type === 'attachment',
      renderer: markRaw(AttachmentsRenderer),
      priority: BubbleRendererMatchPriority.CONTENT,
    },
    // 用户注入的额外规则
    ...(options?.extraContentMatches ?? []),
  ]

  /**
   * Box 渲染器匹配规则
   * 控制消息容器的渲染和属性
   */
  const boxMatches: BubbleBoxRendererMatch[] = [
    {
      find: (messages) => messages.length === 1 && isChatMessageEditing(messages[0]),
      renderer: BubbleRenderers.Box,
      priority: BubbleRendererMatchPriority.NORMAL,
      attributes: { 'data-editing': 'true', 'data-shape': 'none' },
    },
    {
      find: (messages) => messages.length === 1 && isChatMessageOptimistic(messages[0]),
      renderer: BubbleRenderers.Box,
      priority: BubbleRendererMatchPriority.NORMAL,
      attributes: { 'data-optimistic': 'true' },
    },
    {
      find: (_, content) => content?.type === 'attachment',
      renderer: BubbleRenderers.Box,
      attributes: {
        'data-box-type': 'none',
        'data-shape': 'none',
      },
    },
    // 用户注入的额外规则
    ...(options?.extraBoxMatches ?? []),
  ]

  /**
   * 角色配置
   * 定义不同角色的默认渲染器和样式
   * 包含头像、placement、fallbackContentRenderer 等
   */
  const roles: Record<string, BubbleRoleConfig> = {
    assistant: {
      placement: 'start',
      avatar: h(IconAi, { style: { fontSize: '32px' } }),
      fallbackContentRenderer: MarkStreamRenderer,
    },
    user: {
      placement: 'end',
      avatar: h(IconUser, { style: { fontSize: '32px' } }),
    },
    system: {
      hidden: true,
    },
    // 用户覆盖的角色配置
    ...options?.overrideRoles,
  }

  return { contentMatches, boxMatches, roles }
}
