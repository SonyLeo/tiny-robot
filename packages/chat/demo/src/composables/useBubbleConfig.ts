import { markRaw } from 'vue'
import { BubbleRenderers, BubbleRendererMatchPriority } from '@opentiny/tiny-robot'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch, BubbleRoleConfig } from '@opentiny/tiny-robot'
import {
  EditInputRenderer,
  AttachmentsRenderer,
  ErrorRenderer,
  ToolCallsRenderer,
  MarkStreamRenderer,
} from '../components/render'

/**
 * Box 渲染器匹配规则
 * 用于控制消息容器的渲染和属性
 */
export const boxRendererMatches: BubbleBoxRendererMatch[] = [
  {
    find: (messages) => messages.length === 1 && messages[0].state?.isEditing === true,
    renderer: BubbleRenderers.Box,
    priority: BubbleRendererMatchPriority.NORMAL,
    attributes: { 'data-editing': 'true', 'data-shape': 'none' },
  },
  {
    find: (_, content) => content?.type === 'attachment',
    renderer: BubbleRenderers.Box,
    attributes: {
      'data-box-type': 'none',
      'data-shape': 'none',
    },
  },
]

/**
 * Content 渲染器匹配规则
 * 用于控制消息内容的渲染
 */
export const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => {
      return Boolean(message.state?.error)
    },
    renderer: markRaw(ErrorRenderer),
  },
  {
    find: (message) => message.state?.isEditing === true,
    renderer: markRaw(EditInputRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (message) => {
      return Array.isArray(message.tool_calls) && message.tool_calls.length > 0
    },
    renderer: markRaw(ToolCallsRenderer),
  },
  {
    find: (_, content) => content?.type === 'attachment',
    renderer: markRaw(AttachmentsRenderer),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]
/**
 * 角色配置
 * 定义不同角色的默认渲染器和样式
 */
export const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    fallbackContentRenderer: MarkStreamRenderer,
  },
  user: {
    placement: 'end',
  },
  system: {
    hidden: true,
  },
}
